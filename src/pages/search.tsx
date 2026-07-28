import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';
import { ProductCard } from '../components/product-card';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  type: string;
  stock: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export const SearchPage = ({ products, categories, q, category, min, max, page, totalPages }: { products: Product[]; categories: Category[]; q: string; category: string; min: string; max: string; page: number; totalPages: number }): any => html`
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">Cari Produk</h1>
    
    <form method="GET" action="/search" class="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="md:col-span-2">
        <label for="q" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kata Kunci</label>
        <input type="text" id="q" name="q" value="${q}" class="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm">
      </div>
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
        <select id="category" name="category" class="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm">
          <option value="">Semua</option>
          ${categories.map(c => html`<option value="${c.id}" ${category === c.id ? 'selected' : ''}>${c.name}</option>`)}
        </select>
      </div>
      <div>
        <label for="min" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga Min</label>
        <input type="number" id="min" name="min" value="${min}" min="0" class="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm">
      </div>
      <div>
        <label for="max" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga Max</label>
        <input type="number" id="max" name="max" value="${max}" min="0" class="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm">
      </div>
      <div class="md:col-span-2 flex items-end">
        <button type="submit" class="w-full rounded-md bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700">Cari</button>
      </div>
    </form>

    ${products.length === 0 ? html`
      <p class="text-gray-500 dark:text-gray-400">Produk tidak ditemukan.</p>
    ` : html`
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        ${products.map(p => ProductCard(p))}
      </div>
      ${totalPages > 1 ? html`
        <div class="flex justify-center gap-2">
          ${Array.from({length: totalPages}, (_, i) => i + 1).map(p => html`
            <a href="/search?q=${q}&category=${category}&min=${min}&max=${max}&page=${p}" class="w-10 h-10 flex items-center justify-center rounded-md ${p === page ? 'bg-primary-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}">${p}</a>
          `)}
        </div>
      ` : ''}
    `}
  </div>
`;
