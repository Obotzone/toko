import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';
import { idr } from '../../lib/utils';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string | null;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: string | null;
  items: { productName: string; quantity: number; productPrice: number }[];
}

export const AdminOrdersPage = ({ orders, page, totalPages, statusFilter }: { orders: Order[]; page: number; totalPages: number; statusFilter: string }): any => html`
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Pesanan</h1>
      <div class="flex gap-2 text-sm">
        <a href="/admin/orders?status=" class="px-3 py-1.5 rounded-md ${!statusFilter ? 'bg-primary-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}">Semua</a>
        <a href="/admin/orders?status=pending" class="px-3 py-1.5 rounded-md ${statusFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}">Pending</a>
        <a href="/admin/orders?status=paid" class="px-3 py-1.5 rounded-md ${statusFilter === 'paid' ? 'bg-green-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}">Lunas</a>
        <a href="/admin/orders?status=shipped" class="px-3 py-1.5 rounded-md ${statusFilter === 'shipped' ? 'bg-blue-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}">Dikirim</a>
      </div>
    </div>

    ${orders.map(o => html`
      <div class="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div class="flex justify-between items-start mb-4">
          <div>
            <a href="/admin/orders/${o.id}" class="font-semibold text-lg hover:text-primary-600">${o.customerName}</a>
            <p class="text-sm text-zinc-500">${o.customerEmail}</p>
          </div>
          <div class="text-right">
            <p class="font-bold text-lg">${idr(o.totalAmount)}</p>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${o.status === 'paid' ? 'bg-green-100 text-green-700' : o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}">${o.status}</span>
          </div>
        </div>
        <div class="text-sm text-zinc-600 mb-4 border-t border-zinc-200 dark:border-zinc-700 pt-4">
          ${o.items.map(item => html`<div class="flex justify-between"><span>${item.productName} x${item.quantity}</span><span>${idr(item.productPrice * item.quantity)}</span></div>`)}
        </div>
        <div class="flex items-center gap-2 justify-end">
          ${o.status === 'pending' ? html`
            <button onclick="adminPut('/api/admin/orders/${o.id}', { status: 'paid' })" class="text-xs font-semibold px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700">Tandai Lunas</button>
            <button onclick="adminPut('/api/admin/orders/${o.id}', { status: 'cancelled' })" class="text-xs font-semibold px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700">Batalkan</button>
          ` : ''}
          ${o.status === 'paid' ? html`
            <button onclick="adminPut('/api/admin/orders/${o.id}', { status: 'shipped' })" class="text-xs font-semibold px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Tandai Dikirim</button>
          ` : ''}
        </div>
      </div>
    `)}

    ${totalPages > 1 ? html`
      <div class="flex justify-center gap-2">
        ${Array.from({length: totalPages}, (_, i) => i + 1).map(p => html`
          <a href="/admin/orders?page=${p}&status=${statusFilter}" class="w-10 h-10 flex items-center justify-center rounded-md ${p === page ? 'bg-primary-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}">${p}</a>
        `)}
      </div>
    ` : ''}
  </div>
`;
