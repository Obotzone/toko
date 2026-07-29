import { html } from 'hono/html';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
}

interface OrderItem { id: string; productId: string | null; productName: string; quantity: number; }

export const SuccessPage = ({ order, items = [], settings = {} }: { order: Order; items?: OrderItem[]; settings?: Record<string, string> }): any => {
  const qrisKey = settings['qris_image'] || '';
  const bankName = settings['bank_name'] || '';
  const bankAccount = settings['bank_account'] || '';
  const bankHolder = settings['bank_holder'] || '';
  const showManualInfo = order.paymentMethod === 'manual' && order.status !== 'paid';
  return html`
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

      ${showManualInfo ? html`
        <div class="border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-6 space-y-6">
          <h3 class="font-semibold text-lg text-center">Petunjuk Pembayaran</h3>
          ${bankName && bankAccount && bankHolder ? html`
            <div class="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-md text-sm space-y-2">
              <p class="font-medium">Transfer ke rekening berikut:</p>
              <p><span class="text-zinc-500">Bank:</span> ${bankName}</p>
              <p><span class="text-zinc-500">Nomor:</span> <span class="font-semibold tracking-wider">${bankAccount}</span></p>
              <p><span class="text-zinc-500">Atas Nama:</span> ${bankHolder}</p>
              <p class="text-xs text-zinc-400 mt-2">Konfirmasi pembayaran akan diverifikasi oleh admin.</p>
            </div>
          ` : ''}
          ${qrisKey ? html`
            <div class="text-center">
              <p class="text-sm font-medium mb-3">Atau scan QRIS berikut:</p>
              <img src="/api/images/${qrisKey}" class="inline-block max-w-[250px] rounded-lg border border-zinc-200 dark:border-zinc-700">
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      ${order.status === "paid" && items.length ? html`        <div class="border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-6">          <h3 class="font-semibold text-lg mb-4">Download Produk Digital</h3>          <div class="space-y-3">            ${items.filter(i => i.productId).map(i => html`              <a href="/api/download/${order.id}/${i.id}?email=${order.customerEmail}" class="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">                <span class="font-medium text-sm">${i.productName}</span>                <span class="text-primary-600 text-sm font-semibold">Download &rarr;</span>              </a>            `)}          </div>        </div>      ` : ""}                  ${order.status === "paid" ? html`
        <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4 text-sm">
          <p class="font-semibold text-amber-800 dark:text-amber-200 mb-1">⚠ Simpan Nomor Pesanan</p>
          <p class="text-amber-700 dark:text-amber-300">Catat nomor <strong>${order.id}</strong> untuk akses nanti. Gunakan <a href="/track" class="underline font-medium">Lacak Pesanan</a> dengan nomor ini + email Anda.</p>
        </div>
      ` : ""}
      <div id="payment-status" class="text-sm text-center p-4 bg-zinc-50 dark:bg-zinc-800 rounded-md mt-6">
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
    ${settings && settings.whatsapp_number ? html`
    <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-sm text-center">
      <p class="text-blue-800 dark:text-blue-200">${String.fromCharCode(128222)} Ada kendala? Hubungi <a href="https://wa.me/${settings.whatsapp_number}" target="_blank" class="font-medium underline">WhatsApp Admin</a></p>
    </div>
    ` : ''}
  </div>
  <script>
    if ('${order.status}' !== 'paid') {
      setInterval(async () => {
        try {
          var res = await fetch('/api/orders/${order.id}/status');
          var data = await res.json();
          if (data.status === 'paid') location.reload();
        } catch (e) {}
      }, 5000);
    }
  </script>
` };
