import { html } from 'hono/html';
import { CheckoutForm } from '../components/checkout-form';

export const CheckoutPage = ({ mayarEnabled = true }: { mayarEnabled?: boolean }): any => html`
  <div class="max-w-3xl mx-auto">
    <a href="/" class="text-sm text-primary-600 hover:text-primary-500 mb-6 inline-block">&larr; Lanjut Belanja</a>
    <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">Checkout</h1>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        ${CheckoutForm({ mayarEnabled })}
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
