export function idr(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function genId(): string {
  return crypto.randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}

export const SHIPPING_COST = 15000;
export const TAX_RATE = 0.11;

export function calcShipping(items: { type: string }[]): number {
  return items.some(i => i.type === 'physical') ? SHIPPING_COST : 0;
}

export function calcTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE);
}
