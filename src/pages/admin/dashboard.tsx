import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';
import { idr } from '../../lib/utils';

interface Stat {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string | null;
}

export const DashboardPage = ({ stats, recentOrders }: { stats: Stat; recentOrders: RecentOrder[] }): any => html`
  <div class="space-y-8">
    <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
    
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <p class="text-sm text-zinc-500">Total Produk</p>
        <p class="text-3xl font-bold mt-2">${stats.totalProducts}</p>
      </div>
      <div class="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <p class="text-sm text-zinc-500">Total Pesanan</p>
        <p class="text-3xl font-bold mt-2">${stats.totalOrders}</p>
      </div>
      <div class="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <p class="text-sm text-zinc-500">Pendapatan</p>
        <p class="text-3xl font-bold mt-2 text-primary-600">${idr(stats.totalRevenue)}</p>
      </div>
      <div class="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <p class="text-sm text-zinc-500">Pending Orders</p>
        <p class="text-3xl font-bold mt-2 text-yellow-600">${stats.pendingOrders}</p>
      </div>
    </div>

    <div>
      <h2 class="text-xl font-semibold mb-4">Pesanan Terbaru</h2>
      <div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th class="text-left px-4 py-3 font-medium">ID</th>
                <th class="text-left px-4 py-3 font-medium">Pelanggan</th>
                <th class="text-right px-4 py-3 font-medium">Total</th>
                <th class="text-center px-4 py-3 font-medium">Status</th>
                <th class="text-right px-4 py-3 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-700">
              ${recentOrders.map(o => html`
                <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <td class="px-4 py-3 text-primary-600"><a href="/admin/orders/${o.id}">${o.id.slice(0, 8)}...</a></td>
                  <td class="px-4 py-3">${o.customerName}</td>
                  <td class="px-4 py-3 text-right">${idr(o.totalAmount)}</td>
                  <td class="px-4 py-3 text-center"><span class="px-2 py-0.5 rounded-full text-xs font-semibold ${o.status === 'paid' ? 'bg-green-100 text-green-700' : o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}">${o.status}</span></td>
                  <td class="px-4 py-3 text-right text-zinc-500">${new Date(o.createdAt || '').toLocaleDateString('id-ID')}</td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
`;
