import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
}

export const CategoriesPage = ({ categories }: { categories: Category[] }): any => html`
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">Kategori</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${categories.map(c => html`
        <a href="/categories/${c.slug}" class="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4 mb-3">
            <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600">
              ${c.imageUrl ? html`<img src="${c.imageUrl.startsWith('http') ? c.imageUrl : `/api/images/${c.imageUrl}`}" alt="${c.name}" class="w-full h-full object-cover rounded-full">` : ''}
            </div>
            <div>
              <h2 class="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">${c.name}</h2>
              <p class="text-sm text-gray-500">${c.productCount} produk</p>
            </div>
          </div>
          ${c.description ? html`<p class="text-sm text-gray-600 dark:text-gray-400">${c.description}</p>` : ''}
        </a>
      `)}
    </div>
  </div>
`;
