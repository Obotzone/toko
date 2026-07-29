import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';
import { idr } from '../lib/utils';
import { ProductCard } from '../components/product-card';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  description: string | null;
  imageUrl: string | null;
  type: string;
  stock: number;
}

interface Related {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  type: string;
  stock: number;
}

export const ProductPage = ({ product, related }: { product: Product; related: Related[] }): any => html`
  <div class="max-w-5xl mx-auto">
    <a href="/" class="text-sm text-primary-600 hover:text-primary-500 mb-6 inline-block">&larr; Kembali</a>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div class="aspect-square rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        ${product.imageUrl 
          ? html`<img src="${product.imageUrl.startsWith('http') ? product.imageUrl : `/api/images/${product.imageUrl}`}" alt="${product.name}" class="w-full h-full object-cover">`
          : html`<div class="w-full h-full flex items-center justify-center text-zinc-400"><svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>`
        }
      </div>
      <div class="space-y-6">
        <div class="flex gap-2">
          <span class="rounded-full px-3 py-1 text-xs font-semibold ${product.type === 'digital' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">${product.type === 'digital' ? 'Digital' : 'Fisik'}</span>
          ${product.stock <= 0 && product.type === 'physical' ? html`<span class="rounded-full px-3 py-1 text-xs font-semibold bg-red-100 text-red-700">Stok Habis</span>` : html`<span class="rounded-full px-3 py-1 text-xs font-semibold bg-green-100 text-green-700">Stok: ${product.stock}</span>`}
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">${product.name}</h1>
        <p class="text-3xl text-primary-600 dark:text-primary-400 font-semibold">${idr(product.price)}</p>
        <div class="prose prose-sm text-gray-600 dark:text-gray-400">${product.description || ''}</div>
        <div class="flex items-center gap-4">
          <div class="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-md">
            <button type="button" id="qty-dec" aria-label="Kurangi" class="px-3 py-2 min-w-[40px] min-h-[40px] hover:bg-zinc-100 dark:hover:bg-zinc-800">&minus;</button>
            <input type="number" id="qty-input" value="1" min="1" max="${product.stock || 99}" class="w-16 text-center border-x border-zinc-300 dark:border-zinc-700 bg-transparent py-2 text-sm outline-none">
            <button type="button" id="qty-inc" aria-label="Tambah" class="px-3 py-2 min-w-[40px] min-h-[40px] hover:bg-zinc-100 dark:hover:bg-zinc-800">+</button>
          </div>
          <button id="add-to-cart" data-product='${JSON.stringify(product)}' class="flex-1 rounded-md bg-primary-600 px-6 py-3 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed" 
            ${product.stock <= 0 && product.type === 'physical' ? 'disabled' : ''}>
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
    ${related.length > 0 ? html`
      <section class="mt-16">
        <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">Produk Terkait</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          ${related.map(p => ProductCard(p))}
        </div>
      </section>
    ` : ''}
  </div>
`;
