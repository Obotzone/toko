const COOKIE = 'customer_session'
const STATE_COOKIE = 'google_oauth_state'
const SESSION_SECONDS = 60 * 60 * 24 * 30

function b64url(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}
function decodeB64url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4))
  return Uint8Array.from(raw, c => c.charCodeAt(0))
}
async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))))
}
export function randomToken(bytes = 32): string {
  const value = new Uint8Array(bytes)
  crypto.getRandomValues(value)
  return b64url(value)
}
export async function createCustomerSession(user: { sub: string; email: string; name: string; picture?: string }, secret: string) {
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })))
  return { value: `${payload}.${await sign(payload, secret)}`, maxAge: SESSION_SECONDS }
}
export async function readCustomerSession(cookieHeader: string | undefined, secret?: string): Promise<{ sub: string; email: string; name: string; picture?: string } | null> {
  if (!cookieHeader || !secret) return null
  const cookie = cookieHeader.split(';').map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1)
  if (!cookie) return null
  const [payload, signature] = cookie.split('.')
  if (!payload || !signature || signature !== await sign(payload, secret)) return null
  try {
    const data = JSON.parse(new TextDecoder().decode(decodeB64url(payload)))
    if (!data.sub || !data.email || !data.exp || data.exp <= Date.now() / 1000) return null
    return { sub: data.sub, email: data.email, name: data.name || '', picture: data.picture }
  } catch { return null }
}
export function readCookie(cookieHeader: string | undefined, name: string): string | null {
  return cookieHeader?.split(';').map(x => x.trim()).find(x => x.startsWith(`${name}=`))?.slice(name.length + 1) || null
}
export const CUSTOMER_COOKIE = COOKIE
export const OAUTH_STATE_COOKIE = STATE_COOKIE
export const CUSTOMER_SESSION_MAX_AGE = SESSION_SECONDS
export const GOOGLE_STATE_MAX_AGE = 600
