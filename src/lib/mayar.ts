interface MayarItem {
  quantity: number;
  rate: number;
  description: string;
}

interface MayarPayload {
  name: string;
  email: string;
  mobile?: string;
  description: string;
  items: MayarItem[];
  expiredAt: string;
  extraData: { orderId: string };
}

interface MayarResponse {
  data: {
    id: string;
    transactionId: string;
    link: string;
  };
}

export async function createMayarInvoice(apiKey: string, payload: MayarPayload): Promise<MayarResponse> {
  const res = await fetch('https://api.mayar.id/hl/v2/invoices/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });
  const body = await res.json().catch(() => null) as any
  if (!res.ok || !body || (body.statusCode && body.statusCode >= 400)) {
    const message = body?.messages || body?.message || `HTTP ${res.status}`
    throw new Error(`Mayar API error ${res.status}: ${message}`)
  }
  if (!body.data?.id || !body.data?.link) throw new Error('Mayar API response tidak lengkap')
  return body as MayarResponse;
}
