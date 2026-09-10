const TG_API = 'https://api.telegram.org'

export interface TelegramEnv {
  TELEGRAM_BOT_TOKEN?: string
  TELEGRAM_CHAT_ID?: string
}

export function escapeHtml(value: any): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Kirim pesan ke bot/channel Telegram.
 * No-op (return false) jika TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID belum diset.
 * Tidak pernah melempar error — kegagalan hanya dicatat ke log.
 */
export async function sendTelegramMessage(
  env: TelegramEnv,
  text: string,
  opts: { waitUntil?: (promise: Promise<any>) => void } = {}
): Promise<boolean> {
  const token = env.TELEGRAM_BOT_TOKEN
  const chatId = env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return false

  const doSend = async (): Promise<boolean> => {
    try {
      const res = await fetch(`${TG_API}/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      })
      if (!res.ok) {
        const err = await res.text().catch(() => '')
        console.error('Telegram send failed:', res.status, err.slice(0, 300))
        return false
      }
      return true
    } catch (e) {
      console.error('Telegram send error:', e)
      return false
    }
  }

  const promise = doSend()
  if (opts.waitUntil) {
    opts.waitUntil(promise)
    return true
  }
  return promise
}
