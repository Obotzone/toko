import { html } from 'hono/html';
import { CheckoutForm } from '../components/checkout-form';

export const CheckoutPage = ({ mayarEnabled = false, settings = {}, storeConfig = { shipping: 15000, taxRate: 0.11 } }: { mayarEnabled?: boolean; settings?: Record<string, string>; storeConfig?: { shipping: number; taxRate: number } }): any => html`
  <div class="max-w-3xl mx-auto">
    <a href="/" class="text-sm text-primary-600 hover:text-primary-500 mb-6 inline-block">&larr; Lanjut Belanja</a>
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Checkout</h1>
      <p class="mt-2 text-sm text-zinc-500">Lengkapi data di bawah untuk menyelesaikan pesanan.</p>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        ${CheckoutForm({ mayarEnabled, settings, storeConfig })}
      </div>
      <div class="lg:col-span-1">
        <div class="sticky top-24 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h3 class="font-semibold mb-4">Pesanan Anda</h3>
          <div id="checkout-cart-items" class="space-y-3">
            <p class="text-sm text-zinc-500">Keranjang kosong</p>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
