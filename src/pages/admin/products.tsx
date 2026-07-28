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
  description: string | null;
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
      <form onsubmit="event.preventDefault(); submitCreateForm(event)" class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <input type="text" id="p-image" name="imageUrl" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800" placeholder="URL eksternal atau upload via form edit">
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
                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <button onclick='openEditForm(${JSON.stringify(p).replace(/'/g, "\\'")})' class="text-sm text-blue-600 hover:underline mr-2">Edit</button>
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

  <div id="edit-modal" class="fixed inset-0 z-50 hidden">
    <div class="absolute inset-0 bg-black/50" onclick="closeEditForm()"></div>
    <div class="absolute inset-0 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 class="text-xl font-semibold" id="edit-title">Edit Produk</h2>
          <button onclick="closeEditForm()" aria-label="Tutup" class="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-[40px] min-h-[40px]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <form id="edit-form" onsubmit="event.preventDefault(); submitEditForm(event)" class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="hidden" id="e-id" name="id">
          <div class="md:col-span-2">
            <label for="e-name" class="block text-sm font-medium mb-1">Nama Produk</label>
            <input type="text" id="e-name" name="name" required class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
          </div>
          <div>
            <label for="e-category" class="block text-sm font-medium mb-1">Kategori</label>
            <select id="e-category" name="categoryId" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
              <option value="">-</option>
              ${categories.map(c => html`<option value="${c.id}">${c.name}</option>`)}
            </select>
          </div>
          <div>
            <label for="e-type" class="block text-sm font-medium mb-1">Tipe</label>
            <select id="e-type" name="type" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
              <option value="physical">Fisik</option>
              <option value="digital">Digital</option>
            </select>
          </div>
          <div>
            <label for="e-price" class="block text-sm font-medium mb-1">Harga (Rp)</label>
            <input type="number" id="e-price" name="price" required min="0" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
          </div>
          <div>
            <label for="e-stock" class="block text-sm font-medium mb-1">Stok</label>
            <input type="number" id="e-stock" name="stock" required min="0" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
          </div>
          <div class="md:col-span-2">
            <label for="e-image" class="block text-sm font-medium mb-1">URL Gambar (eksternal)</label>
            <input type="text" id="e-image" name="imageUrl" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800" placeholder="https://...">
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">Upload Gambar ke R2</label>
            <input type="file" id="e-image-file" accept="image/*" class="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100">
            <p class="text-xs text-zinc-500 mt-1" id="e-image-status">Maks 5MB. Upload akan mengganti URL gambar di atas.</p>
            <div id="e-image-preview" class="mt-2 ${products.some(p => p.imageUrl) ? '' : 'hidden'}">
              <img id="e-image-preview-img" class="max-w-[150px] max-h-[150px] rounded border border-zinc-200 dark:border-zinc-700">
            </div>
          </div>
          <div class="md:col-span-2">
            <label for="e-desc" class="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea id="e-desc" name="description" rows="3" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800"></textarea>
          </div>
          <div class="md:col-span-2 flex gap-4">
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" id="e-isActive" name="isActive" value="1"> Aktif</label>
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" id="e-isFeatured" name="isFeatured" value="1"> Unggulan</label>
          </div>
          <div class="md:col-span-2 flex gap-3">
            <button type="submit" class="rounded-md bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700">Simpan Perubahan</button>
            <button type="button" onclick="closeEditForm()" class="rounded-md bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700">Batal</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <script>
    var _editingProductId = null;

    function openEditForm(product) {
      _editingProductId = product.id;
      document.getElementById('e-id').value = product.id;
      document.getElementById('e-name').value = product.name || '';
      document.getElementById('e-category').value = product.categoryId || '';
      document.getElementById('e-type').value = product.type || 'physical';
      document.getElementById('e-price').value = product.price || 0;
      document.getElementById('e-stock').value = product.stock || 0;
      document.getElementById('e-image').value = product.imageUrl || '';
      document.getElementById('e-desc').value = product.description || '';
      document.getElementById('e-isActive').checked = product.isActive === 1;
      document.getElementById('e-isFeatured').checked = product.isFeatured === 1;
      var preview = document.getElementById('e-image-preview');
      var previewImg = document.getElementById('e-image-preview-img');
      if (product.imageUrl) {
        previewImg.src = product.imageUrl.startsWith('http') ? product.imageUrl : '/api/images/' + product.imageUrl;
        preview.classList.remove('hidden');
      } else {
        preview.classList.add('hidden');
      }
      document.getElementById('e-image-status').textContent = product.imageUrl && !product.imageUrl.startsWith('http') ? 'Gambar dari R2: ' + product.imageUrl : 'Maks 5MB. Upload akan mengganti URL gambar.';
      document.getElementById('edit-modal').classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }

    function closeEditForm() {
      document.getElementById('edit-modal').classList.add('hidden');
      document.body.style.overflow = '';
      _editingProductId = null;
    }

    async function submitCreateForm(event) {
      var form = event.target;
      var data = Object.fromEntries(new FormData(form));
      await adminPost('/api/admin/products', data);
    }

    async function submitEditForm(event) {
      var form = event.target;
      var data = Object.fromEntries(new FormData(form));
      var id = data.id;
      delete data.id;
      data.isActive = document.getElementById('e-isActive').checked ? 1 : 0;
      data.isFeatured = document.getElementById('e-isFeatured').checked ? 1 : 0;
      var fileInput = document.getElementById('e-image-file');
      if (fileInput.files && fileInput.files[0]) {
        var fd = new FormData();
        fd.append('file', fileInput.files[0]);
        var uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
        if (uploadRes.ok) {
          var uploadData = await uploadRes.json();
          data.imageUrl = uploadData.key;
        } else {
          var err = await uploadRes.json();
          if (err.error) { alert(err.error); return; }
        }
      }
      await adminPut('/api/admin/products/' + id, data);
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeEditForm();
    });
  </script>
`;
