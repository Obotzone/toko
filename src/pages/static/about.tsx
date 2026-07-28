import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';

export const AboutPage = (): any => html`
  <div class="max-w-3xl mx-auto space-y-12">
    <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white text-center">Tentang Etalase</h1>
    <div class="text-lg text-gray-600 dark:text-gray-400 text-center">
      <p>Etalase adalah toko online terpercaya yang menyediakan berbagai produk berkualitas mulai dari elektronik, pakaian, hingga buku. Kami berkomitmen untuk memberikan pengalaman belanja yang aman, nyaman, dan memuaskan.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
      <div class="space-y-4">
        <div class="w-16 h-16 mx-auto rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 class="font-semibold text-gray-900 dark:text-white">Produk Original</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Semua produk kami dijamin keasliannya dan bergaransi resmi.</p>
      </div>
      <div class="space-y-4">
        <div class="w-16 h-16 mx-auto rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h3 class="font-semibold text-gray-900 dark:text-white">Pengiriman Cepat</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Pesanan Anda akan diproses dan dikirim dalam waktu 1x24 jam.</p>
      </div>
      <div class="space-y-4">
        <div class="w-16 h-16 mx-auto rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
        </div>
        <h3 class="font-semibold text-gray-900 dark:text-white">Pembayaran Aman</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Mendukung QRIS, e-wallet, VA, dan transfer bank untuk kemudahan Anda.</p>
      </div>
    </div>
  </div>
`;
