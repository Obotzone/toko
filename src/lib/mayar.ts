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
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mayar API error ${res.status}: ${body}`);
  }
  return res.json();
}
