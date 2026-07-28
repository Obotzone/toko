import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';
import { idr } from '../lib/utils';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  type: string;
  stock: number;
}

export const ProductCard = ({ id, name, slug, price, imageUrl, type, stock }: ProductCardProps): any => html`
  <a href="/products/${slug}" class="group block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
    <div class="aspect-square bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
      ${imageUrl 
        ? html`<img src="${imageUrl.startsWith('http') ? imageUrl : `/api/images/${imageUrl}`}" alt="${name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">`
        : html`<div class="w-full h-full flex items-center justify-center text-zinc-400"><svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>`
      }
      <div class="absolute top-2 left-2 flex gap-2">
        <span class="rounded-full px-2 py-0.5 text-xs font-semibold ${type === 'digital' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'}">
          ${type === 'digital' ? 'Digital' : 'Fisik'}
        </span>
        ${stock <= 0 && type === 'physical' ? html`<span class="rounded-full px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Habis</span>` : ''}
      </div>
    </div>
    <div class="p-4">
      <h3 class="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">${name}</h3>
      <p class="text-primary-600 dark:text-primary-400 font-semibold">${idr(price)}</p>
    </div>
  </a>
`;
