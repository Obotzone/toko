import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';
import { idr } from '../../lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  type: string;
  isActive: number;
  isFeatured: number;
  categoryId: string | null;
}

interface Category {
  id: string;
  name: string;
}

export const AdminProductsPage = ({ products, categories, page, totalPages }: { products: Product[]; categories: Category[]; page: number; totalPages: number }): any => html`
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Produk</h1>
      <button onclick="document.getElementById('product-form').classList.toggle('hidden')" class="rounded-md bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700">Tambah Produk</button>
    </div>

    <div id="product-form" class="hidden p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <h2 class="text-lg font-semibold mb-4">Tambah Produk Baru</h2>
      <form onsubmit="event.preventDefault(); adminPost('/api/admin/products', Object.fromEntries(new FormData(event.target)))" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="p-name" class="block text-sm font-medium mb-1">Nama Produk</label>
          <input type="text" id="p-name" name="name" required class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
        </div>
        <div>
          <label for="p-category" class="block text-sm font-medium mb-1">Kategori</label>
          <select id="p-category" name="categoryId" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
            <option value="">-</option>
            ${categories.map(c => html`<option value="${c.id}">${c.name}</option>`)}
          </select>
        </div>
        <div>
          <label for="p-price" class="block text-sm font-medium mb-1">Harga (Rp)</label>
          <input type="number" id="p-price" name="price" required min="0" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
        </div>
        <div>
          <label for="p-stock" class="block text-sm font-medium mb-1">Stok</label>
          <input type="number" id="p-stock" name="stock" required min="0" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
        </div>
        <div>
          <label for="p-type" class="block text-sm font-medium mb-1">Tipe</label>
          <select id="p-type" name="type" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
            <option value="physical">Fisik</option>
            <option value="digital">Digital</option>
          </select>
        </div>
        <div>
          <label for="p-image" class="block text-sm font-medium mb-1">URL Gambar</label>
          <input type="text" id="p-image" name="imageUrl" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
        </div>
        <div class="md:col-span-2">
          <label for="p-desc" class="block text-sm font-medium mb-1">Deskripsi</label>
          <textarea id="p-desc" name="description" rows="3" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800"></textarea>
        </div>
        <div class="md:col-span-2 flex gap-4">
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" value="1" checked> Aktif</label>
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="isFeatured" value="1"> Unggulan</label>
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
              <th class="text-left px-4 py-3">Gambar</th>
              <th class="text-left px-4 py-3">Nama</th>
              <th class="text-right px-4 py-3">Harga</th>
              <th class="text-center px-4 py-3">Stok</th>
              <th class="text-center px-4 py-3">Tipe</th>
              <th class="text-center px-4 py-3">Status</th>
              <th class="text-right px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200 dark:divide-zinc-700">
            ${products.map(p => html`
              <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <td class="px-4 py-3">
                  ${p.imageUrl ? html`<div class="w-10 h-10 rounded bg-zinc-100 overflow-hidden"><img src="${p.imageUrl.startsWith('http') ? p.imageUrl : `/api/images/${p.imageUrl}`}" class="w-full h-full object-cover"></div>` : html`<div class="w-10 h-10 rounded bg-zinc-100"></div>`}
                </td>
                <td class="px-4 py-3 font-medium">${p.name}</td>
                <td class="px-4 py-3 text-right">${idr(p.price)}</td>
                <td class="px-4 py-3 text-center">${p.stock}</td>
                <td class="px-4 py-3 text-center"><span class="px-2 py-0.5 rounded-full text-xs ${p.type === 'digital' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">${p.type}</span></td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-0.5 rounded-full text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${p.isActive ? 'Aktif' : 'Nonaktif'}</span>
                  ${p.isFeatured ? html`<span class="ml-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">Unggulan</span>` : ''}
                </td>
                <td class="px-4 py-3 text-right">
                  <button onclick="adminPut('/api/admin/products/${p.id}', { isActive: ${p.isActive ? 0 : 1} })" class="text-sm text-primary-600 hover:underline mr-2">${p.isActive ? 'Nonaktifkan' : 'Aktifkan'}</button>
                  <button onclick="if(confirm('Hapus ${p.name}?')) adminDelete('/api/admin/products/${p.id}')" class="text-sm text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    </div>

    ${totalPages > 1 ? html`
      <div class="flex justify-center gap-2">
        ${Array.from({length: totalPages}, (_, i) => i + 1).map(p => html`
          <a href="/admin/products?page=${p}" class="w-10 h-10 flex items-center justify-center rounded-md ${p === page ? 'bg-primary-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}">${p}</a>
        `)}
      </div>
    ` : ''}
  </div>
`;
