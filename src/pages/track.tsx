import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';
import { idr } from '../lib/utils';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  customerName: string;
  shippingAddress: string | null;
  createdAt: string | null;
  items: { productName: string; quantity: number; productPrice: number }[];
}

export const TrackPage = ({ order }: { order?: Order }): any => html`
  <div class="max-w-2xl mx-auto space-y-8">
    <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Lacak Pesanan</h1>
    
    <form method="GET" action="/track" class="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label for="orderId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Pesanan</label>
          <input type="text" id="orderId" name="orderId" required class="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm" placeholder="Masukkan ID pesanan">
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" id="email" name="email" required class="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm" placeholder="Masukkan email pembelian">
        </div>
      </div>
      <button type="submit" class="w-full rounded-md bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700">Cari Pesanan</button>
    </form>

    ${order ? html`
      <div class="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-6">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Pesanan #${order.id}</h2>
            <p class="text-sm text-zinc-500">${new Date(order.createdAt || '').toLocaleDateString('id-ID')}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'paid' ? 'bg-green-100 text-green-700' : order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}">${order.status}</span>
        </div>
        
        <div class="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
          ${order.items.map(item => html`
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">${item.productName} x${item.quantity}</span>
              <span class="font-medium">${idr(item.productPrice * item.quantity)}</span>
            </div>
          `)}
          <div class="flex justify-between font-semibold border-t border-zinc-200 dark:border-zinc-800 pt-2">
            <span>Total</span>
            <span>${idr(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    ` : ''}
  </div>
`;
