import { html } from 'hono/html';

interface Settings {
  qrisImage?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
  mayarStatus?: string;
}

export const AdminSettingsPage = ({ settings, mayarConfigured }: { settings: Record<string, string>; mayarConfigured: boolean }): any => html`
  <div class="space-y-8">
    <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Pengaturan</h1>

    <div class="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-6">
      <h2 class="text-xl font-semibold">Informasi Toko</h2>
      <form onsubmit="event.preventDefault(); saveSettings(event)" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label for="store_name" class="block text-sm font-medium mb-1">Nama Toko</label>
          <input type="text" id="store_name" name="store_name" value="${settings['store_name'] || ''}" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
        </div>
        <div class="md:col-span-2">
          <label for="store_description" class="block text-sm font-medium mb-1">Deskripsi (SEO)</label>
          <textarea id="store_description" name="store_description" rows="3" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">${settings['store_description'] || ''}</textarea>
          <p class="text-xs text-zinc-500 mt-1">Digunakan sebagai meta description tag.</p>
        </div>
        <div class="md:col-span-2">
          <label for="store_keywords" class="block text-sm font-medium mb-1">Kata Kunci (SEO)</label>
          <input type="text" id="store_keywords" name="store_keywords" value="${settings['store_keywords'] || ''}" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800" placeholder="toko online, belanja, e-commerce">
          <p class="text-xs text-zinc-500 mt-1">Pisahkan dengan koma. Digunakan sebagai meta keywords tag.</p>
        </div>
        <div class="md:col-span-2">
          <button type="submit" class="rounded-md bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700">Simpan</button>
        </div>
      </form>
    </div>

    <div class="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-6">
      <h2 class="text-xl font-semibold">Logo Toko</h2>
      <p class="text-sm text-zinc-500">Upload logo toko. Ukuran optimal: 200x200px.</p>
      <form id="logo-form" enctype="multipart/form-data">
        <input type="file" name="file" accept="image/*" required class="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100">
        <button type="submit" class="mt-4 rounded-md bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700">Upload Logo</button>
      </form>
      ${settings['store_logo'] ? html`
        <div class="mt-4">
          <p class="text-sm font-medium mb-2">Preview:</p>
          <img src="/api/images/${settings['store_logo']}" class="max-w-[200px] max-h-[200px] rounded-lg border border-zinc-200 dark:border-zinc-700">
        </div>
      ` : html`<p class="text-sm text-zinc-400 mt-2">Belum ada logo.</p>`}
    </div>

    <div class="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-6">
      <h2 class="text-xl font-semibold">QRIS Pembayaran</h2>
      <p class="text-sm text-zinc-500">Upload gambar QRIS dari GoBiz atau iSaku merchant app.</p>
      <form id="qris-form" enctype="multipart/form-data">
        <input type="file" name="file" accept="image/*" required class="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100">
        <button type="submit" class="mt-4 rounded-md bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700">Upload QRIS</button>
      </form>
      ${settings['qris_image'] ? html`
        <div class="mt-4">
          <p class="text-sm font-medium mb-2">Preview:</p>
          <img src="/api/images/${settings['qris_image']}" class="max-w-xs rounded-lg border border-zinc-200 dark:border-zinc-700">
        </div>
      ` : html`<p class="text-sm text-zinc-400 mt-2">Belum ada QRIS.</p>`}
    </div>

    <div class="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-6">
      <h2 class="text-xl font-semibold">Informasi Transfer Bank</h2>
      <form onsubmit="event.preventDefault(); saveSettings(event)" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="bank_name" class="block text-sm font-medium mb-1">Nama Bank</label>
          <input type="text" id="bank_name" name="bank_name" value="${settings['bank_name'] || ''}" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
        </div>
        <div>
          <label for="bank_account" class="block text-sm font-medium mb-1">Nomor Rekening</label>
          <input type="text" id="bank_account" name="bank_account" value="${settings['bank_account'] || ''}" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
        </div>
        <div class="md:col-span-2">
          <label for="bank_holder" class="block text-sm font-medium mb-1">Atas Nama</label>
          <input type="text" id="bank_holder" name="bank_holder" value="${settings['bank_holder'] || ''}" class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800">
        </div>
        <div class="md:col-span-2">
          <button type="submit" class="rounded-md bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700">Simpan</button>
        </div>
      </form>
    </div>

    <div class="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-4">
      <h2 class="text-xl font-semibold">Mayar API</h2>
      <div class="flex items-center gap-2 text-sm">
        <span class="w-3 h-3 rounded-full ${mayarConfigured ? 'bg-green-500' : 'bg-red-500'}"></span>
        <span>${mayarConfigured ? 'Mayar API key terkonfigurasi' : 'Mayar API key tidak ditemukan'}</span>
      </div>
      ${mayarConfigured ? html`
        <form onsubmit="event.preventDefault(); saveSettings(event)">
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="mayar_enabled" value="1" ${settings['mayar_enabled'] !== '0' ? 'checked' : ''} class="w-5 h-5 rounded border-zinc-300 text-primary-600 focus:ring-primary-500" onchange="this.form.requestSubmit()">
            <div>
              <span class="block text-sm font-medium">Aktifkan Mayar Payment</span>
              <span class="block text-xs text-zinc-500">Nonaktifkan untuk menyembunyikan opsi Mayar di halaman checkout.</span>
            </div>
          </label>
        </form>
      ` : ''}
    </div>
  </div>
  <script>
    async function saveSettings(e) {
      const form = e.target;
      const data = Object.fromEntries(new FormData(form));
      await adminPost('/api/admin/settings', data);
    }
    ['qris-form', 'logo-form'].forEach(function(id) {
      document.getElementById(id).addEventListener('submit', async function(e) {
        e.preventDefault();
        var fd = new FormData(e.target);
        var res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (res.ok) {
          var key = (await res.json()).key;
          var settingKey = id === 'qris-form' ? 'qris_image' : 'store_logo';
          var obj = {};
          obj[settingKey] = key;
          await adminPost('/api/admin/settings', obj);
        } else {
          var err = await res.json();
          alert(err.error || 'Upload gagal');
        }
      });
    });
  </script>
`;
