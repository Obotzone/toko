import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';

export const PrivacyPage = (): any => html`
  <div class="max-w-3xl mx-auto prose prose-sm dark:prose-invert">
    <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">Kebijakan Privasi</h1>
    <p>Kami menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi yang Anda berikan kepada kami.</p>
    <h2>Data yang Dikumpulkan</h2>
    <ul>
      <li>Nama lengkap</li>
      <li>Alamat email</li>
      <li>Nomor telepon</li>
      <li>Alamat pengiriman</li>
    </ul>
    <h2>Penggunaan Data</h2>
    <p>Data Anda digunakan untuk memproses pesanan, mengirimkan notifikasi, dan meningkatkan layanan kami.</p>
    <h2>Keamanan</h2>
    <p>Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi data pribadi Anda dari akses yang tidak sah.</p>
  </div>
`;
