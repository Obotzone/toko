const COOKIE_NAME = 'admin_session'
const SESSION_TTL_SECONDS = 24 * 60 * 60 // 24 jam

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = ''
  for (const b of bytes) hex += b.toString(16).padStart(2, '0')
  return hex
}

function hexToBytes(hex: string): Uint8Array | null {
  if (!/^[0-9a-f]+$/.test(hex) || hex.length % 2 !== 0) return null
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

export async function createSessionToken(secret: string): Promise<{ token: string; maxAge: number }> {
  const exp = Date.now() + SESSION_TTL_SECONDS * 1000
  const key = await importKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(String(exp)))
  return { token: `${exp}.${bytesToHex(new Uint8Array(sig))}`, maxAge: SESSION_TTL_SECONDS }
}

export async function verifySessionToken(token: string | undefined, secret: string | undefined): Promise<boolean> {
  if (!token || !secret) return false
  const dot = token.indexOf('.')
  if (dot <= 0) return false
  const exp = token.slice(0, dot)
  const sigHex = token.slice(dot + 1)
  if (!/^\d+$/.test(exp)) return false
  if (parseInt(exp, 10) <= Date.now()) return false
  const sig = hexToBytes(sigHex)
  if (!sig || sig.length !== 32) return false
  const key = await importKey(secret)
  try {
    return await crypto.subtle.verify('HMAC', key, sig.buffer as ArrayBuffer, new TextEncoder().encode(exp))
  } catch {
    return false
  }
}

export function readSessionCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined
  for (const part of cookieHeader.split(';')) {
    const p = part.trim()
    if (p.startsWith(COOKIE_NAME + '=')) return p.slice(COOKIE_NAME.length + 1)
  }
  return undefined
}

export const ADMIN_COOKIE = COOKIE_NAME
