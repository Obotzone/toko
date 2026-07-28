import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';

const CART_DRAWER_ID = 'cart-drawer';

export const Layout = ({ title, children, isAdmin = false }: { title: string; children: any; isAdmin?: boolean }) => html`
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Etalase</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            primary: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81' }
          }
        }
      }
    }
  </script>
  <style>
    [x-cloak] { display: none !important; }
  </style>
</head>
<body class="bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white min-h-screen flex flex-col">
  ${isAdmin ? AdminShell({ children }) : CustomerShell({ children })}
  <script src="/client/app.js"></script>
</body>
</html>
`;

const CustomerShell = ({ children }: { children: HtmlEscapedString | HtmlEscapedString[] }) => html`
  <header class="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
    <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <a href="/" class="text-xl font-bold tracking-tight text-primary-600">Etalase</a>
      <div class="hidden md:flex items-center gap-6 text-sm font-medium">
        <a href="/categories" class="hover:text-primary-600">Kategori</a>
        <a href="/track" class="hover:text-primary-600">Lacak Pesanan</a>
        <a href="/about" class="hover:text-primary-600">Tentang</a>
      </div>
      <div class="flex items-center gap-2">
        <button id="dark-toggle" aria-label="Toggle dark mode" class="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-[40px] min-h-[40px] flex items-center justify-center">
          <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
        </button>
        <button id="cart-btn" aria-label="Keranjang" class="relative p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-[40px] min-h-[40px] flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          <span id="cart-count" class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center hidden">0</span>
        </button>
        <a href="/admin/login" class="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">Admin</a>
      </div>
    </nav>
  </header>

  ${CartDrawer()}

  <main class="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
    ${children}
  </main>

  <footer class="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mt-auto">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 class="font-semibold mb-4 text-gray-900 dark:text-white">Etalase</h4>
          <p class="text-gray-600 dark:text-gray-400">Toko online terpercaya untuk kebutuhan Anda.</p>
        </div>
        <div>
          <h4 class="font-semibold mb-4 text-gray-900 dark:text-white">Tautan</h4>
          <ul class="space-y-2 text-gray-600 dark:text-gray-400">
            <li><a href="/categories" class="hover:text-primary-600">Kategori</a></li>
            <li><a href="/track" class="hover:text-primary-600">Lacak Pesanan</a></li>
            <li><a href="/about" class="hover:text-primary-600">Tentang Kami</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4 text-gray-900 dark:text-white">Legal</h4>
          <ul class="space-y-2 text-gray-600 dark:text-gray-400">
            <li><a href="/privacy" class="hover:text-primary-600">Kebijakan Privasi</a></li>
            <li><a href="/shipping" class="hover:text-primary-600">Info Pengiriman</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4 text-gray-900 dark:text-white">Kontak</h4>
          <ul class="space-y-2 text-gray-600 dark:text-gray-400">
            <li><a href="/contact" class="hover:text-primary-600">Hubungi Kami</a></li>
          </ul>
        </div>
      </div>
      <div class="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-gray-500">
        &copy; ${new Date().getFullYear()} Etalase. All rights reserved.
      </div>
    </div>
  </footer>
`;

const AdminShell = ({ children }: { children: HtmlEscapedString | HtmlEscapedString[] }) => html`
  <div class="flex min-h-screen">
    <aside class="hidden lg:flex lg:flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <a href="/admin" class="text-xl font-bold mb-8 text-primary-600">Etalase Admin</a>
      <nav class="flex-1 space-y-1">
        <a href="/admin" class="block px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Dashboard</a>
        <a href="/admin/products" class="block px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Produk</a>
        <a href="/admin/orders" class="block px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Pesanan</a>
        <a href="/admin/categories" class="block px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Kategori</a>
        <a href="/admin/settings" class="block px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Pengaturan</a>
      </nav>
      <div class="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4">
        <a href="/" class="block px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Lihat Toko</a>
        <button onclick="adminLogout()" class="w-full text-left block px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-red-600">Logout</button>
      </div>
    </aside>
    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center px-4 lg:hidden sticky top-0 z-30">
        <button id="admin-sidebar-toggle" aria-label="Menu" class="p-2 mr-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-[40px] min-h-[40px] flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <a href="/admin" class="text-xl font-bold text-primary-600">Etalase</a>
      </header>
      <main class="flex-1 p-4 md:p-8 overflow-auto bg-zinc-50 dark:bg-black">
        ${children}
      </main>
    </div>

    <div id="admin-sidebar-mobile" class="fixed inset-0 z-50 hidden lg:hidden">
      <div class="absolute inset-0 bg-black/50" onclick="document.getElementById('admin-sidebar-mobile').classList.add('hidden')"></div>
      <aside class="absolute inset-y-0 left-0 w-64 max-w-[80vw] bg-white dark:bg-zinc-900 p-4 overflow-y-auto shadow-xl">
        <div class="flex items-center justify-between mb-8">
          <a href="/admin" class="text-xl font-bold text-primary-600" onclick="document.getElementById('admin-sidebar-mobile').classList.add('hidden')">Etalase Admin</a>
          <button id="admin-sidebar-close" aria-label="Tutup" class="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-[40px] min-h-[40px]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <nav class="flex-1 space-y-1">
          <a href="/admin" class="block px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800" onclick="document.getElementById('admin-sidebar-mobile').classList.add('hidden')">Dashboard</a>
          <a href="/admin/products" class="block px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800" onclick="document.getElementById('admin-sidebar-mobile').classList.add('hidden')">Produk</a>
          <a href="/admin/orders" class="block px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800" onclick="document.getElementById('admin-sidebar-mobile').classList.add('hidden')">Pesanan</a>
          <a href="/admin/categories" class="block px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800" onclick="document.getElementById('admin-sidebar-mobile').classList.add('hidden')">Kategori</a>
          <a href="/admin/settings" class="block px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800" onclick="document.getElementById('admin-sidebar-mobile').classList.add('hidden')">Pengaturan</a>
        </nav>
        <div class="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4">
          <a href="/" class="block px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800" onclick="document.getElementById('admin-sidebar-mobile').classList.add('hidden')">Lihat Toko</a>
          <button onclick="document.getElementById('admin-sidebar-mobile').classList.add('hidden'); adminLogout()" class="w-full text-left block px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-red-600">Logout</button>
        </div>
      </aside>
    </div>
  </div>
`;

const CartDrawer = () => html`
  <div id="${CART_DRAWER_ID}" class="fixed inset-0 z-50 hidden" aria-modal="true">
    <div class="absolute inset-0 bg-black/50 transition-opacity" id="cart-overlay"></div>
    <div class="absolute inset-y-0 right-0 max-w-md w-full bg-white dark:bg-zinc-900 shadow-xl flex flex-col transform translate-x-full transition-transform" id="cart-panel">
      <div class="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 class="text-lg font-semibold">Keranjang</h2>
        <button id="cart-close" aria-label="Tutup keranjang" class="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-[40px] min-h-[40px]">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div id="cart-items" class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Cart items injected by JS -->
      </div>
      <div class="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div class="flex justify-between mb-4 text-lg font-semibold">
          <span>Total</span>
          <span id="cart-total">Rp 0</span>
        </div>
        <a href="/checkout" id="checkout-btn" class="block w-full text-center rounded-md bg-primary-600 px-4 py-3 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">Checkout</a>
      </div>
    </div>
  </div>
`;
