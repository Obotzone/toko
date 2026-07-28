interface StripeItem {
  price_data: {
    currency: string;
    product_data: { name: string };
    unit_amount: number;
  };
  quantity: number;
}

interface StripePayload {
  line_items: StripeItem[];
  mode: 'payment';
  success_url: string;
  cancel_url: string;
  customer_email: string;
  metadata: { orderId: string };
}

interface StripeSession {
  id: string;
  url: string;
}

export async function createStripeSession(apiKey: string, payload: StripePayload): Promise<StripeSession> {
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${apiKey}`
    },
    body: new URLSearchParams({
      'mode': payload.mode,
      'success_url': payload.success_url,
      'cancel_url': payload.cancel_url,
      'customer_email': payload.customer_email,
      'metadata[orderId]': payload.metadata.orderId,
      ...payload.line_items.reduce((acc, item, i) => {
        acc[`line_items[${i}][price_data][currency]`] = item.price_data.currency;
        acc[`line_items[${i}][price_data][product_data][name]`] = item.price_data.product_data.name;
        acc[`line_items[${i}][price_data][unit_amount]`] = String(item.price_data.unit_amount);
        acc[`line_items[${i}][quantity]`] = String(item.quantity);
        return acc;
      }, {} as Record<string, string>)
    })
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Stripe API error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function verifyStripeSignature(secret: string, payload: string, sig: string | null): Promise<boolean> {
  if (!sig) return false;
  const parts = Object.fromEntries(sig.split(',').map(p => p.split('=')));
  const timestamp = parts['t'];
  const expected = parts['v1'];

  const toSign = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(toSign));
  const hex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hex === expected;
}
