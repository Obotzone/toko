import { html } from 'hono/html';
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
  imageUrl: string | null;
}

export const HomePage = ({ products, categories, settings = {} }: { products: Product[]; categories: Category[]; settings?: Record<string, string> }): any => {
  const heroTitle = settings['hero_title'] || 'Selamat Datang di Etalase';
  const heroSubtitle = settings['hero_subtitle'] || 'Temukan produk terbaik untuk kebutuhan Anda. Mulai dari elektronik, pakaian, hingga buku berkualitas.';
  const heroBtnText = settings['hero_button_text'] || 'Lihat Produk';
  const heroBtnUrl = settings['hero_button_url'] || '/categories';
  const heroBg = settings['hero_bg_color'] || 'from-primary-600/90 to-primary-600/30';
  const heroImg = settings['hero_image'] || '';
  return html`
  <div class="space-y-16">
    <section class="relative rounded-2xl overflow-hidden bg-primary-600 text-white p-8 md:p-16 min-h-[400px] flex items-center">
      ${heroImg ? html`<div class="absolute inset-0"><img src="${heroImg.startsWith('http') ? heroImg : '/api/images/' + heroImg}" class="w-full h-full object-cover"></div>` : ''}
      <div class="relative z-10 max-w-2xl">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-6">${heroTitle}</h1>
        <p class="text-lg text-primary-100 mb-8">${heroSubtitle}</p>
        <a href="${heroBtnUrl}" class="inline-block rounded-md bg-white text-primary-600 px-6 py-3 font-medium hover:bg-primary-50 transition-colors">
          ${heroBtnText}
        </a>
      </div>
      <div class="absolute inset-0 bg-gradient-to-r ${heroBg}"></div>
      ${!heroImg ? html`<div class="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M45.1,-51.1C56.8,-40.8,63.4,-23.3,65.3,-5.3C67.2,12.7,64.5,31.2,54.2,44.2C43.9,57.2,26.1,64.7,6.5,66.1C-13.1,67.5,-34.4,62.8,-48.2,51.1C-62,39.4,-68.2,20.7,-66.9,2.5C-65.6,-15.8,-56.8,-33.7,-44.2,-44.5C-31.7,-55.3,-15.8,-59.1,1.7,-61.2C19.2,-63.3,33.4,-61.4,45.1,-51.1Z" transform="translate(100 100)" /></svg>
      </div>` : ''}
    </section>

    <section>
      <div class="flex justify-between items-end mb-8">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Produk Unggulan</h2>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Pilihan produk terbaik dari kami.</p>
        </div>
        <a href="/search" class="text-sm font-medium text-primary-600 hover:text-primary-500">Lihat Semua &rarr;</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${products.map(p => ProductCard(p))}
      </div>
    </section>

    <section>
      <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">Kategori</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        ${categories.map(c => html`
          <a href="/categories/${c.slug}" class="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center hover:shadow-md transition-shadow">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
              ${c.imageUrl ? html`<img src="${c.imageUrl.startsWith('http') ? c.imageUrl : `/api/images/${c.imageUrl}`}" alt="${c.name}" class="w-full h-full object-cover rounded-full">` : html`<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>`}
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">${c.name}</h3>
          </a>
        `)}
      </div>
    </section>

    <section class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 md:p-12">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div class="text-3xl font-bold text-primary-600 mb-2">100%</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Produk Original</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-primary-600 mb-2">24/7</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Layanan Pelanggan</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-primary-600 mb-2">1 Hari</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Pengiriman Cepat</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-primary-600 mb-2">100%</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Pembayaran Aman</div>
        </div>
      </div>
    </section>
  </div>
` };