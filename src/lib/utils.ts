export function idr(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function genId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  let id = '';
  for (let i = 0; i < 8; i++) id += chars[array[i] % chars.length];
  return id;
}

export function now(): string {
  return new Date().toISOString();
}

export const SHIPPING_COST = 15000;
export const TAX_RATE = 0.11;

export function calcShipping(items: { type: string }[], settings: Record<string, string> = {}): number {
  return items.some(i => i.type === 'physical') ? getShippingCost(settings) : 0;
}

export function getShippingCost(settings: Record<string, string>): number {
  const v = parseInt(settings['shipping_cost'] || '');
  return Number.isFinite(v) && v >= 0 ? v : SHIPPING_COST;
}

export function getTaxRate(settings: Record<string, string>): number {
  const v = parseFloat(settings['tax_rate_percent'] || '');
  return Number.isFinite(v) && v >= 0 ? v / 100 : TAX_RATE;
}

export function calcTax(subtotal: number, settings: Record<string, string> = {}): number {
  return Math.round(subtotal * getTaxRate(settings));
}
