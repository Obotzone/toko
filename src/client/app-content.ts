// @ts-nocheck
export const APP_JS = String.raw`
const Cart = {
  KEY: 'etalase-cart',
  get items() { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); },
  set items(v) { localStorage.setItem(this.KEY, JSON.stringify(v)); this.render(); },
  add(product, qty = 1) {
    const items = this.items;
    const idx = items.findIndex(i => i.id === product.id);
    if (idx > -1) {
      items[idx].qty = Math.min(items[idx].qty + qty, product.stock || 99);
    } else {
      items.push({ id: product.id, name: product.name, price: product.price, qty, type: product.type, stock: product.stock, imageUrl: product.imageUrl, slug: product.slug });
    }
    this.items = items;
  },
  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
  },
  updateQty(id, qty) {
    const items = this.items;
    const idx = items.findIndex(i => i.id === id);
    if (idx > -1) {
      if (qty < 1) return this.remove(id);
      items[idx].qty = Math.min(qty, items[idx].stock || 99);
    }
    this.items = items;
  },
  clear() { this.items = []; },
  get totalItems() { return this.items.reduce((s, i) => s + i.qty, 0); },
  get totalPrice() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
  render() {
    const count = document.getElementById('cart-count');
    if (count) {
      const total = this.totalItems;
      count.textContent = total;
      count.classList.toggle('hidden', total === 0);
    }
    const panel = document.getElementById('cart-items');
    if (!panel) return;
    const items = this.items;
    if (items.length === 0) {
      panel.innerHTML = '<p class="text-center text-zinc-500 py-8">Keranjang kosong</p>';
    } else {
      panel.innerHTML = items.map(i => '<div class="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">' +
        '<div class="w-16 h-16 rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">' +
          (i.imageUrl ? '<img src="' + (i.imageUrl.startsWith('http') ? i.imageUrl : '/api/images/' + i.imageUrl) + '" class="w-full h-full object-cover">' : '') +
        '</div>' +
        '<div class="flex-1 min-w-0">' +
          '<a href="/products/' + i.slug + '" class="font-medium text-sm hover:text-primary-600 line-clamp-1">' + i.name + '</a>' +
          '<p class="text-sm text-primary-600 font-semibold">Rp ' + i.price.toLocaleString('id-ID') + '</p>' +
          '<div class="flex items-center gap-2 mt-2">' +
            '<button onclick="Cart.updateQty(\'' + i.id + '\', ' + (i.qty - 1) + ')" class="w-8 h-8 rounded border border-zinc-300 flex items-center justify-center text-sm hover:bg-zinc-100">&minus;</button>' +
            '<span class="w-8 text-center text-sm font-medium">' + i.qty + '</span>' +
            '<button onclick="Cart.updateQty(\'' + i.id + '\', ' + (i.qty + 1) + ')" class="w-8 h-8 rounded border border-zinc-300 flex items-center justify-center text-sm hover:bg-zinc-100">+</button>' +
          '</div>' +
        '</div>' +
        '<button onclick="Cart.remove(\'' + i.id + '\')" class="text-zinc-400 hover:text-red-500 p-2" aria-label="Hapus">' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>' +
        '</button>' +
      '</div>').join('');
    }
    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = 'Rp ' + this.totalPrice.toLocaleString('id-ID');
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.disabled = items.length === 0;
  }
};

let _cartFocusTrap = null;

function openCart() {
  var el = document.getElementById('cart-drawer');
  el.classList.remove('hidden');
  setTimeout(function() { document.getElementById('cart-panel').classList.remove('translate-x-full'); }, 10);
  document.body.style.overflow = 'hidden';
  var panel = document.getElementById('cart-panel');
  var focusable = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length) focusable[0].focus();
  _cartFocusTrap = function(e) {
    if (e.key === 'Tab') {
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (e.key === 'Escape') { closeCart(); }
  };
  panel.addEventListener('keydown', _cartFocusTrap);
}

function closeCart() {
  var panel = document.getElementById('cart-panel');
  panel.classList.add('translate-x-full');
  if (_cartFocusTrap) { panel.removeEventListener('keydown', _cartFocusTrap); _cartFocusTrap = null; }
  setTimeout(function() {
    document.getElementById('cart-drawer').classList.add('hidden');
    document.body.style.overflow = '';
  }, 200);
}

document.addEventListener('click', function(e) {
  var cartBtn = e.target.closest('#cart-btn');
  if (cartBtn) { openCart(); return; }
  var closeBtn = e.target.closest('#cart-close');
  if (closeBtn) { closeCart(); return; }
  if (e.target.closest('#cart-overlay')) { closeCart(); return; }
  if (e.target.closest('#dark-toggle')) {
    var dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('dark', dark);
    return;
  }
  if (e.target.closest('#admin-sidebar-toggle')) {
    var sb = document.getElementById('admin-sidebar-mobile');
    if (sb) sb.classList.remove('hidden');
    return;
  }
  if (e.target.closest('#admin-sidebar-close')) {
    var sb2 = document.getElementById('admin-sidebar-mobile');
    if (sb2) sb2.classList.add('hidden');
    return;
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeCart();
});

document.addEventListener('click', function(e) {
  var btn = e.target.closest('#add-to-cart');
  if (!btn) return;
  var product = JSON.parse(btn.dataset.product);
  var qty = parseInt(document.getElementById('qty-input') ? document.getElementById('qty-input').value : '1');
  Cart.add(product, qty);
  openCart();
});

document.addEventListener('click', function(e) {
  var dec = e.target.closest('#qty-dec');
  var inc = e.target.closest('#qty-inc');
  if (!dec && !inc) return;
  var input = document.getElementById('qty-input');
  if (!input) return;
  var val = parseInt(input.value) || 1;
  var max = parseInt(input.max) || 99;
  if (dec) val = Math.max(1, val - 1);
  if (inc) val = Math.min(max, val + 1);
  input.value = val;
});

document.addEventListener('submit', async function(e) {
  var form = e.target.closest('#checkout-form');
  if (!form) return;
  e.preventDefault();
  var btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Memproses...';
  try {
    var data = Object.fromEntries(new FormData(form));
    var items;
    try { items = JSON.parse(data.items); } catch(ex) { items = []; }
    if (!items.length) { alert('Keranjang kosong'); btn.disabled = false; btn.textContent = 'Bayar Sekarang'; return; }
    data.items = items;
    var res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      var err = await res.json();
      alert(err.error || 'Gagal membuat pesanan');
      btn.disabled = false;
      btn.textContent = 'Bayar Sekarang';
      return;
    }
    var orderId = (await res.json()).orderId;
    var pm = data.paymentMethod;
    localStorage.removeItem(Cart.KEY);
    if (pm === 'mayar') {
      var mayarRes = await fetch('/api/checkout/mayar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId })
      });
      if (mayarRes.ok) {
        var link = (await mayarRes.json()).link;
        window.location.href = link;
      } else {
        window.location.href = '/checkout/success?orderId=' + orderId;
      }
    } else {
      window.location.href = '/checkout/success?orderId=' + orderId;
    }
  } catch (err) {
    alert('Terjadi kesalahan: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Bayar Sekarang';
  }
});

async function adminPost(url, data) {
  var res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (res.ok) location.reload();
  else { var e = await res.json(); alert(e.error); }
}

async function adminPut(url, data) {
  var res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (res.ok) location.reload();
  else { var e = await res.json(); alert(e.error); }
}

async function adminDelete(url) {
  var res = await fetch(url, { method: 'DELETE' });
  if (res.ok) location.reload();
  else { var e = await res.json(); alert(e.error); }
}

async function adminLogout() {
  await fetch('/api/admin/logout', { method: 'POST' });
  window.location.href = '/admin/login';
}

function recalcTotals() {
  var subtotalEl = document.getElementById('subtotal-amount');
  var shippingEl = document.getElementById('shipping-cost');
  var taxEl = document.getElementById('tax-amount');
  var totalEl = document.getElementById('total-amount');
  if (!shippingEl || !taxEl || !totalEl) return;
  var itemsInput = document.querySelector('[name="items"]');
  if (!itemsInput) return;
  var items;
  try { items = JSON.parse(itemsInput.value); } catch(ex) { items = []; }
  var subtotal = items.reduce(function(s, i) { return s + i.price * i.qty; }, 0);
  var hasPhysical = items.some(function(i) { return i.type === 'physical'; });
  var shipping = hasPhysical ? 15000 : 0;
  var tax = Math.round(subtotal * 0.11);
  var total = subtotal + shipping + tax;
  if (subtotalEl) subtotalEl.textContent = 'Rp ' + subtotal.toLocaleString('id-ID');
  shippingEl.textContent = 'Rp ' + shipping.toLocaleString('id-ID');
  taxEl.textContent = 'Rp ' + tax.toLocaleString('id-ID');
  totalEl.textContent = 'Rp ' + total.toLocaleString('id-ID');
}

function renderCheckoutCart() {
  var container = document.getElementById('checkout-cart-items');
  if (!container) return;
  var items = Cart.items;
  if (!items.length) { container.innerHTML = '<p class="text-sm text-zinc-500">Keranjang kosong</p>'; return; }
  container.innerHTML = items.map(function(i) {
    return '<div class="flex items-center gap-3 text-sm">' +
      '<div class="w-12 h-12 rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">' +
        (i.imageUrl ? '<img src="' + (i.imageUrl.startsWith('http') ? i.imageUrl : '/api/images/' + i.imageUrl) + '" class="w-full h-full object-cover">' : '') +
      '</div>' +
      '<div class="flex-1 min-w-0">' +
        '<p class="font-medium truncate">' + i.name + '</p>' +
        '<p class="text-zinc-500">' + i.qty + ' × Rp ' + i.price.toLocaleString('id-ID') + '</p>' +
      '</div>' +
      '<p class="font-medium">Rp ' + (i.price * i.qty).toLocaleString('id-ID') + '</p>' +
    '</div>';
  }).join('');
}

function populateCheckoutInputs() {
  var input = document.getElementById('checkout-items-input');
  if (input) input.value = JSON.stringify(Cart.items);
}

document.addEventListener('DOMContentLoaded', function() {
  Cart.render();
  recalcTotals();
  renderCheckoutCart();
  populateCheckoutInputs();
});

if (localStorage.getItem('dark') === 'true' || (!localStorage.getItem('dark') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
  localStorage.setItem('dark', 'true');
}
`;
