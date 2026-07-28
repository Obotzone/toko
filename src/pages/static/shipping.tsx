import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';

export const ShippingPage = (): any => html`
  <div class="max-w-3xl mx-auto prose prose-sm dark:prose-invert">
    <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">Info Pengiriman</h1>
    <p>Informasi mengenai kebijakan pengiriman dan biaya yang berlaku di Etalase.</p>
    <h2>Biaya Pengiriman</h2>
    <ul>
      <li>Produk fisik: Rp 15.000 per pesanan</li>
      <li>Produk digital: Gratis (Rp 0)</li>
    </ul>
    <h2>Waktu Pengiriman</h2>
    <p>Pesanan diproses dalam 1x24 jam setelah pembayaran terkonfirmasi. Waktu pengiriman tergantung pada alamat tujuan dan kurir yang digunakan.</p>
    <h2>Area Pengiriman</h2>
    <p>Saat ini kami melayani pengiriman ke seluruh wilayah Indonesia.</p>
  </div>
`;
