import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  customerName: string;
}

export const SuccessPage = ({ order }: { order: Order }): any => html`
  <div class="max-w-2xl mx-auto text-center space-y-8">
    <div class="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600">
      <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
    </div>
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Pesanan Berhasil!</h1>
      <p class="text-gray-600 dark:text-gray-400">Terima kasih, ${order.customerName}. Pesanan Anda telah diterima.</p>
    </div>
    
    <div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 text-left">
      <div class="grid grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <span class="text-zinc-500">Nomor Pesanan</span>
          <p class="font-semibold text-gray-900 dark:text-white">${order.id}</p>
        </div>
        <div>
          <span class="text-zinc-500">Total</span>
          <p class="font-semibold text-primary-600">Rp ${order.totalAmount.toLocaleString('id-ID')}</p>
        </div>
        <div>
          <span class="text-zinc-500">Status Pembayaran</span>
          <p class="font-semibold"><span class="px-2 py-0.5 rounded-full text-xs ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${order.status === 'paid' ? 'Lunas' : 'Menunggu Pembayaran'}</span></p>
        </div>
        <div>
          <span class="text-zinc-500">Metode Pembayaran</span>
          <p class="font-semibold capitalize">${order.paymentMethod}</p>
        </div>
      </div>
      
      <div id="payment-status" class="text-sm text-center p-4 bg-zinc-50 dark:bg-zinc-800 rounded-md">
        ${order.status === 'paid' 
          ? html`<p class="text-green-600 font-medium">Pembayaran telah dikonfirmasi.</p>`
          : html`
            <p class="text-zinc-600 dark:text-zinc-300">Menunggu verifikasi pembayaran... Halaman ini akan memperbarui secara otomatis.</p>
          `}
      </div>
    </div>

    <div class="flex justify-center gap-4">
      <a href="/" class="rounded-md bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-6 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700">Lanjut Belanja</a>
      <a href="/track" class="rounded-md bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700">Lacak Pesanan</a>
    </div>
  </div>
  <script>
    if ('${order.status}' !== 'paid') {
      setInterval(async () => {
        try {
          const res = await fetch('/api/orders/${order.id}/status');
          const data = await res.json();
          if (data.status === 'paid') location.reload();
        } catch (e) {}
      }, 5000);
    }
  </script>
`;
