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

export const CategoryPage = ({ products, categoryName, categorySlug, sort, page, totalPages }: { products: Product[]; categoryName: string; categorySlug: string; sort: string; page: number; totalPages: number }): any => html`
  <div class="max-w-4xl mx-auto">
    <a href="/categories" class="text-sm text-primary-600 hover:text-primary-500 mb-4 inline-block">&larr; Semua Kategori</a>
    <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">${categoryName}</h1>
    
    <div class="flex items-center justify-between mb-8">
      <div class="flex gap-2 text-sm">
        <a href="/categories/${categorySlug}?sort=newest" class="px-3 py-1.5 rounded-md ${sort === 'newest' ? 'bg-primary-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}">Terbaru</a>
        <a href="/categories/${categorySlug}?sort=price_asc" class="px-3 py-1.5 rounded-md ${sort === 'price_asc' ? 'bg-primary-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}">Harga ↑</a>
        <a href="/categories/${categorySlug}?sort=price_desc" class="px-3 py-1.5 rounded-md ${sort === 'price_desc' ? 'bg-primary-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}">Harga ↓</a>
        <a href="/categories/${categorySlug}?sort=name" class="px-3 py-1.5 rounded-md ${sort === 'name' ? 'bg-primary-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}">A-Z</a>
      </div>
    </div>

    ${products.length === 0 ? html`
      <p class="text-gray-500 dark:text-gray-400">Belum ada produk di kategori ini.</p>
    ` : html`
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        ${products.map(p => ProductCard(p))}
      </div>
      ${totalPages > 1 ? html`
        <div class="flex justify-center gap-2">
          ${Array.from({length: totalPages}, (_, i) => i + 1).map(p => html`
            <a href="/categories/${categorySlug}?sort=${sort}&page=${p}" class="w-10 h-10 flex items-center justify-center rounded-md ${p === page ? 'bg-primary-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}">${p}</a>
          `)}
        </div>
      ` : ''}
    `}
  </div>
`;
