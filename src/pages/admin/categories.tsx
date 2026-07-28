import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number | null;
  productCount: number;
}

export const AdminCategoriesPage = ({ categories }: { categories: Category[] }): any => html`
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Kategori</h1>
      <button onclick="document.getElementById('category-form').classList.toggle('hidden')" class="rounded-md bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700">Tambah Kategori</button>
    </div>

    <div id="category-form" class="hidden p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <h2 class="text-lg font-semibold mb-4">Tambah Kategori Baru</h2>
      <form onsubmit="event.preventDefault(); adminPost('/api/admin/categories', Object.fromEntries(new FormData(event.target)))" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="c-name" class="block text-sm font-medium mb-1">Nama Kategori</label>
          <input type="text" id="c-name" name="name" required class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
        </div>
        <div>
          <label for="c-image" class="block text-sm font-medium mb-1">URL Gambar</label>
          <input type="text" id="c-image" name="imageUrl" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
        </div>
        <div class="md:col-span-2">
          <label for="c-desc" class="block text-sm font-medium mb-1">Deskripsi</label>
          <textarea id="c-desc" name="description" rows="2" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800"></textarea>
        </div>
        <div class="md:col-span-2">
          <button type="submit" class="rounded-md bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700">Simpan</button>
        </div>
      </form>
    </div>

    <div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
            <tr>
              <th class="text-left px-4 py-3">Nama</th>
              <th class="text-left px-4 py-3">Slug</th>
              <th class="text-center px-4 py-3">Produk</th>
              <th class="text-right px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200 dark:divide-zinc-700">
            ${categories.map(c => html`
              <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <td class="px-4 py-3 font-medium">${c.name}</td>
                <td class="px-4 py-3 text-zinc-500">${c.slug}</td>
                <td class="px-4 py-3 text-center">${c.productCount}</td>
                <td class="px-4 py-3 text-right">
                  <button onclick="if(confirm('Hapus ${c.name}?')) adminDelete('/api/admin/categories/${c.id}')" class="text-sm text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    </div>
  </div>
`;
