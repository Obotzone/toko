import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';

export const CheckoutForm = ({ mayarEnabled = true, settings = {} }: { mayarEnabled?: boolean; settings?: Record<string, string> }): any => html`
  <form id="checkout-form" class="space-y-6">
    <input type="hidden" id="checkout-items-input" name="items" value="[]">

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="customer_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
        <input type="text" id="customer_name" name="customer_name" required class="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none">
      </div>
      <div>
        <label for="customer_email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
        <input type="email" id="customer_email" name="customer_email" required class="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none">
      </div>
      <div>
        <label for="customer_phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telepon (Opsional)</label>
        <input type="tel" id="customer_phone" name="customer_phone" class="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none">
      </div>
      <div class="md:col-span-2">
        <label for="shipping_address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat Pengiriman</label>
        <textarea id="shipping_address" name="shipping_address" rows="3" class="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" placeholder="Masukkan alamat lengkap untuk pengiriman barang fisik..."></textarea>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Metode Pembayaran</label>
      <div class="space-y-3">
        ${mayarEnabled ? html`
        <label class="flex items-center p-4 border border-zinc-200 dark:border-zinc-800 rounded-md cursor-pointer has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-900/20">
          <input type="radio" name="paymentMethod" value="mayar" class="text-primary-600 focus:ring-primary-500 mr-3">
          <div>
            <span class="block font-medium text-sm">QRIS / E-Wallet / VA (Otomatis)</span>
            <span class="block text-xs text-zinc-500">Pembayaran via Mayar.id, verifikasi otomatis.</span>
          </div>
        </label>
        ` : ''}
        <label class="flex items-center p-4 border border-zinc-200 dark:border-zinc-800 rounded-md cursor-pointer has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-900/20">
          <input type="radio" name="paymentMethod" value="manual" class="text-primary-600 focus:ring-primary-500 mr-3">
          <div>
            <span class="block font-medium text-sm">Transfer Bank Manual</span>
            <span class="block text-xs text-zinc-500">Transfer ke rekening kami, tunggu verifikasi admin.</span>
          </div>
        </label>
      </div>
    </div>

    <div class="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div class="flex justify-between mb-2 text-sm">
        <span class="text-zinc-600 dark:text-zinc-400">Subtotal</span>
        <span id="subtotal-amount">Rp 0</span>
      </div>
      <div class="flex justify-between mb-2 text-sm">
        <span class="text-zinc-600 dark:text-zinc-400">Pengiriman</span>
        <span id="shipping-cost">Rp 0</span>
      </div>
      <div class="flex justify-between mb-2 text-sm">
        <span class="text-zinc-600 dark:text-zinc-400">Pajak (PPN 11%)</span>
        <span id="tax-amount">Rp 0</span>
      </div>
      <div class="flex justify-between font-semibold text-lg border-t border-zinc-200 dark:border-zinc-800 mt-2 pt-2">
        <span>Total</span>
        <span id="total-amount">Rp 0</span>
      </div>
    </div>

        ${settings && settings.whatsapp_number ? html`
      <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-sm">
        <p class="text-blue-800 dark:text-blue-200"> Ada kendala? Hubungi <a href="https://wa.me/${settings.whatsapp_number}" target="_blank" class="font-medium underline">WhatsApp Admin</a></p>
      </div>
    ` : ""}

    <div class="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <label class="block text-sm font-medium mb-2">Punya Kode Diskon?</label>
      <div class="flex gap-2" id="discount-input-group">
        <input type="text" id="discount-input" placeholder="Masukkan kode" class="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm">
        <button type="button" id="discount-btn" class="rounded-md bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700">Gunakan</button>
      </div>
      <div id="discount-applied" class="flex items-center justify-between gap-2" style="display:none">
        <span id="discount-msg" class="text-xs text-green-600"></span>
        <button type="button" onclick="removeDiscount()" class="text-xs text-red-500 hover:text-red-700">Hapus</button>
      </div>
      <input type="hidden" id="discount-code" name="discountCode" value="">
      <p id="discount-msg" class="text-xs mt-1 text-zinc-500"></p>
    </div>

    <button type="submit" class="w-full rounded-md bg-primary-600 px-4 py-3 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
      Bayar Sekarang
    </button>
  </form>
`;
