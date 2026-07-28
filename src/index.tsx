import { Hono } from 'hono'
import { getDb } from './db'
import { eq, and, like, or, desc, asc, count, sql } from 'drizzle-orm'
import * as s from './schema'
import { idr, slugify, genId, now, SHIPPING_COST, TAX_RATE, calcShipping, calcTax } from './lib/utils'
import { createMayarInvoice } from './lib/mayar'
import { createStripeSession, verifyStripeSignature } from './lib/stripe'
import { uploadImage, getImage, deleteImage } from './lib/r2'
import { APP_JS } from './client/app-content'
import { Layout } from './components/layout'
import { ProductCard } from './components/product-card'
import { CheckoutForm } from './components/checkout-form'
import { HomePage } from './pages/home'
import { ProductPage } from './pages/product'
import { CategoriesPage } from './pages/categories'
import { CategoryPage } from './pages/category'
import { SearchPage } from './pages/search'
import { CheckoutPage } from './pages/checkout'
import { SuccessPage } from './pages/success'
import { TrackPage } from './pages/track'
import { DashboardPage } from './pages/admin/dashboard'
import { AdminProductsPage } from './pages/admin/products'
import { AdminOrdersPage } from './pages/admin/orders'
import { AdminCategoriesPage } from './pages/admin/categories'
import { AdminSettingsPage } from './pages/admin/settings'
import { AboutPage } from './pages/static/about'
import { ContactPage } from './pages/static/contact'
import { PrivacyPage } from './pages/static/privacy'
import { ShippingPage } from './pages/static/shipping'

const app = new Hono<{ Bindings: { DB: D1Database; BUCKET: R2Bucket; MAYAR_API_KEY?: string; ADMIN_SECRET?: string; STRIPE_SECRET_KEY?: string; STRIPE_WEBHOOK_SECRET?: string } }>()
const PER_PAGE = 20

function checkAdmin(c: any) {
  const secret = c.req.header('Cookie')?.split(';').find((c: string) => c.trim().startsWith('admin_secret='))?.split('=')[1]
  return secret === c.env.ADMIN_SECRET
}

// --- Static Pages ---
const staticPage = (title: string, content: any) => (c: any) => c.html(<Layout title={title}>{content}</Layout>)

app.get('/about', staticPage('Tentang', <AboutPage />))
app.get('/contact', staticPage('Kontak', <ContactPage />))
app.get('/privacy', staticPage('Privasi', <PrivacyPage />))
app.get('/shipping', staticPage('Pengiriman', <ShippingPage />))

// --- Homepage ---
app.get('/', async (c) => {
  const db = getDb(c.env)
  const featured = await db.select().from(s.products).where(and(eq(s.products.isActive, 1), eq(s.products.isFeatured, 1))).limit(8)
  const cats = await db.select().from(s.categories).orderBy(s.categories.sortOrder)
  return c.html(<Layout title="Beranda"><HomePage products={featured} categories={cats} /></Layout>)
})

// --- Product Detail ---
app.get('/products/:slug', async (c) => {
  const db = getDb(c.env)
  const slug = c.req.param('slug')
  const [product] = await db.select().from(s.products).where(and(eq(s.products.slug, slug), eq(s.products.isActive, 1))).limit(1)
  if (!product) return c.notFound()
  let related: typeof product[] = []
  if (product.categoryId) {
    related = await db.select().from(s.products).where(and(eq(s.products.categoryId, product.categoryId), eq(s.products.isActive, 1), sql`${s.products.id} != ${product.id}`)).limit(4)
  }
  return c.html(<Layout title={product.name}><ProductPage product={product} related={related} /></Layout>)
})

// --- Categories ---
app.get('/categories', async (c) => {
  const db = getDb(c.env)
  const cats = await db.select({
    id: s.categories.id,
    name: s.categories.name,
    slug: s.categories.slug,
    description: s.categories.description,
    imageUrl: s.categories.imageUrl,
    productCount: count()
  }).from(s.categories).leftJoin(s.products, eq(s.categories.id, s.products.categoryId)).where(eq(s.products.isActive, 1)).groupBy(s.categories.id).orderBy(s.categories.sortOrder)
  return c.html(<Layout title="Kategori"><CategoriesPage categories={cats} /></Layout>)
})

// --- Category Page ---
app.get('/categories/:slug', async (c) => {
  const db = getDb(c.env)
  const slug = c.req.param('slug')
  const sort = c.req.query('sort') || 'newest'
  const page = parseInt(c.req.query('page') || '1')
  const [cat] = await db.select().from(s.categories).where(eq(s.categories.slug, slug)).limit(1)
  if (!cat) return c.notFound()

  const baseQuery = db.select().from(s.products).where(and(eq(s.products.categoryId, cat.id), eq(s.products.isActive, 1)))
  let orderBy: any
  switch (sort) {
    case 'price_asc': orderBy = asc(s.products.price); break
    case 'price_desc': orderBy = desc(s.products.price); break
    case 'name': orderBy = asc(s.products.name); break
    default: orderBy = desc(s.products.createdAt)
  }
  const total = (await db.select({ count: count() }).from(s.products).where(and(eq(s.products.categoryId, cat.id), eq(s.products.isActive, 1))))[0].count
  const products = await baseQuery.orderBy(orderBy).limit(PER_PAGE).offset((page - 1) * PER_PAGE)
  const totalPages = Math.ceil(total / PER_PAGE)

  return c.html(<Layout title={cat.name}><CategoryPage products={products} categoryName={cat.name} categorySlug={cat.slug} sort={sort} page={page} totalPages={totalPages} /></Layout>)
})

// --- Search ---
app.get('/search', async (c) => {
  const db = getDb(c.env)
  const q = c.req.query('q') || ''
  const catId = c.req.query('category') || ''
  const min = c.req.query('min') || ''
  const max = c.req.query('max') || ''
  const page = parseInt(c.req.query('page') || '1')

  const cats = await db.select().from(s.categories)
  const conditions = [eq(s.products.isActive, 1)]
  if (q) conditions.push(or(like(s.products.name, `%${q}%`), like(s.products.description, `%${q}%`)) as any)
  if (catId) conditions.push(eq(s.products.categoryId, catId))
  if (min) conditions.push(sql`${s.products.price} >= ${parseInt(min)}`)
  if (max) conditions.push(sql`${s.products.price} <= ${parseInt(max)}`)

  const total = (await db.select({ count: count() }).from(s.products).where(and(...conditions)))[0].count
  const products = await db.select().from(s.products).where(and(...conditions)).orderBy(desc(s.products.createdAt)).limit(PER_PAGE).offset((page - 1) * PER_PAGE)
  const totalPages = Math.ceil(total / PER_PAGE)

  return c.html(<Layout title="Cari"><SearchPage products={products} categories={cats} q={q} category={catId} min={min} max={max} page={page} totalPages={totalPages} /></Layout>)
})

// --- Checkout ---
app.get('/checkout', async (c) => {
  return c.html(<Layout title="Checkout"><CheckoutPage /></Layout>)
})

// --- Success ---
app.get('/checkout/success', async (c) => {
  const db = getDb(c.env)
  const orderId = c.req.query('orderId')
  if (!orderId) return c.redirect('/')
  const [order] = await db.select().from(s.orders).where(eq(s.orders.id, orderId)).limit(1)
  if (!order) return c.redirect('/')
  return c.html(<Layout title="Pesanan Berhasil"><SuccessPage order={order} /></Layout>)
})

// --- Track ---
app.get('/track', async (c) => {
  const db = getDb(c.env)
  const orderId = c.req.query('orderId')
  const email = c.req.query('email')
  if (orderId && email) {
    const [order] = await db.select().from(s.orders).where(and(eq(s.orders.id, orderId), eq(s.orders.customerEmail, email))).limit(1)
    if (order) {
      const items = await db.select().from(s.orderItems).where(eq(s.orderItems.orderId, order.id))
      return c.html(<Layout title="Lacak Pesanan"><TrackPage order={{ ...order, items }} /></Layout>)
    }
  }
  return c.html(<Layout title="Lacak Pesanan"><TrackPage /></Layout>)
})

// --- API: Products JSON ---
app.get('/api/products', async (c) => {
  const db = getDb(c.env)
  const products = await db.select().from(s.products).where(eq(s.products.isActive, 1)).orderBy(desc(s.products.createdAt))
  return c.json(products)
})

// --- API: Checkout ---
app.post('/api/checkout', async (c) => {
  const db = getDb(c.env)
  const body = await c.req.json()
  const { customer_name, customer_email, customer_phone, shipping_address, paymentMethod, items } = body

  if (!customer_name || !customer_email || !items?.length) {
    return c.json({ error: 'Data tidak lengkap' }, 400)
  }

  const dbItems = []
  let subtotal = 0
  let hasPhysical = false

  for (const item of items) {
    const [product] = await db.select().from(s.products).where(and(eq(s.products.id, item.id), eq(s.products.isActive, 1))).limit(1)
    if (!product) return c.json({ error: `Produk ${item.name} tidak ditemukan` }, 400)
    if (product.type === 'physical' && product.stock < item.qty) return c.json({ error: `Stok ${product.name} tidak mencukupi` }, 400)

    dbItems.push({
      id: genId(),
      orderId: '',
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      quantity: item.qty
    })
    subtotal += product.price * item.qty
    if (product.type === 'physical') hasPhysical = true
  }

  const shipping = hasPhysical ? SHIPPING_COST : 0
  const tax = calcTax(subtotal)
  const total = subtotal + shipping + tax

  const orderId = genId()

  // Find or create customer
  let [customer] = await db.select().from(s.customers).where(eq(s.customers.email, customer_email)).limit(1)
  if (!customer) {
    const cid = genId()
    await db.insert(s.customers).values({ id: cid, name: customer_name, email: customer_email, phone: customer_phone || '' })
    customer = { id: cid, name: customer_name, email: customer_email, phone: customer_phone || '', createdAt: '' }
  }

  await db.insert(s.orders).values({
    id: orderId,
    customerId: customer.id,
    customerName: customer_name,
    customerEmail: customer_email,
    customerPhone: customer_phone || '',
    shippingAddress: shipping_address || '',
    subtotal,
    shippingCost: shipping,
    taxAmount: tax,
    totalAmount: total,
    status: 'pending',
    paymentMethod: paymentMethod || 'manual',
    createdAt: now()
  })

  for (const di of dbItems) {
    di.orderId = orderId
    await db.insert(s.orderItems).values(di)
    await db.update(s.products).set({ stock: sql`${s.products.stock} - ${di.quantity}` }).where(eq(s.products.id, di.productId))
  }

  return c.json({ orderId })
})

// --- API: Mayar Checkout ---
app.post('/api/checkout/mayar', async (c) => {
  const body = await c.req.json()
  const { orderId } = body
  if (!c.env.MAYAR_API_KEY) return c.json({ error: 'Mayar tidak dikonfigurasi' }, 400)
  const db = getDb(c.env)
  const [order] = await db.select().from(s.orders).where(eq(s.orders.id, orderId)).limit(1)
  if (!order) return c.json({ error: 'Pesanan tidak ditemukan' }, 404)
  const items = await db.select().from(s.orderItems).where(eq(s.orderItems.orderId, orderId))

  const result = await createMayarInvoice(c.env.MAYAR_API_KEY, {
    name: order.customerName,
    email: order.customerEmail,
    mobile: order.customerPhone || undefined,
    description: `Pesanan ${orderId.slice(0, 8)}`,
    items: items.map(i => ({ quantity: i.quantity, rate: i.productPrice, description: i.productName })),
    expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    extraData: { orderId }
  })

  await db.update(s.orders).set({ paymentId: result.data.id }).where(eq(s.orders.id, orderId))
  return c.json({ link: result.data.link })
})

// --- API: Stripe Checkout ---
app.post('/api/checkout/stripe', async (c) => {
  const body = await c.req.json()
  const { orderId } = body
  if (!c.env.STRIPE_SECRET_KEY) return c.json({ error: 'Stripe tidak dikonfigurasi' }, 400)
  const db = getDb(c.env)
  const [order] = await db.select().from(s.orders).where(eq(s.orders.id, orderId)).limit(1)
  if (!order) return c.json({ error: 'Pesanan tidak ditemukan' }, 404)
  const items = await db.select().from(s.orderItems).where(eq(s.orderItems.orderId, orderId))

  const origin = new URL(c.req.url).origin
  const result = await createStripeSession(c.env.STRIPE_SECRET_KEY, {
    line_items: items.map(i => ({
      price_data: { currency: 'idr', product_data: { name: i.productName }, unit_amount: i.productPrice },
      quantity: i.quantity
    })),
    mode: 'payment',
    success_url: `${origin}/checkout/success?orderId=${orderId}`,
    cancel_url: `${origin}/checkout`,
    customer_email: order.customerEmail,
    metadata: { orderId }
  })

  await db.update(s.orders).set({ paymentId: result.id }).where(eq(s.orders.id, orderId))
  return c.json({ url: result.url })
})

// --- API: Mayar Webhook ---
app.post('/api/webhooks/mayar', async (c) => {
  const body = await c.req.json()
  const db = getDb(c.env)
  const orderId = body.extraData?.orderId || body.data?.extraData?.orderId
  if (orderId && body.status === 'PAID') {
    await db.update(s.orders).set({ status: 'paid', updatedAt: now() }).where(eq(s.orders.id, orderId))
  }
  return c.json({ ok: true })
})

// --- API: Order Status Polling ---
app.get('/api/orders/:id/status', async (c) => {
  const db = getDb(c.env)
  const id = c.req.param('id')
  const [order] = await db.select({ status: s.orders.status }).from(s.orders).where(eq(s.orders.id, id)).limit(1)
  if (!order) return c.json({ error: 'Not found' }, 404)
  return c.json({ status: order.status })
})

// --- API: Image Upload ---
app.post('/api/upload', async (c) => {
  const fd = await c.req.formData()
  const file = fd.get('file') as File
  if (!file || !file.type.startsWith('image/')) return c.json({ error: 'File harus gambar' }, 400)
  if (file.size > 5 * 1024 * 1024) return c.json({ error: 'File maksimal 5MB' }, 400)

  const name = `${genId()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`
  const ab = await file.arrayBuffer()
  const key = await uploadImage(c.env.BUCKET, name, file.type, ab)
  return c.json({ key })
})

// --- API: Serve Image ---
app.get('/api/images/:key+', async (c) => {
  const key = c.req.param('key') as string
  const obj = await getImage(c.env.BUCKET, key)
  if (!obj) return c.notFound()
  const headers = new Headers()
  headers.set('Content-Type', obj.httpMetadata?.contentType || 'image/jpeg')
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  headers.set('ETag', obj.etag)
  return new Response(obj.body, { headers })
})

// --- API: Track ---
app.get('/api/track', async (c) => {
  const db = getDb(c.env)
  const orderId = c.req.query('orderId')
  const email = c.req.query('email')
  if (!orderId || !email) return c.json({ error: 'orderId dan email diperlukan' }, 400)
  const [order] = await db.select().from(s.orders).where(and(eq(s.orders.id, orderId), eq(s.orders.customerEmail, email))).limit(1)
  if (!order) return c.json({ error: 'Pesanan tidak ditemukan' }, 404)
  const items = await db.select().from(s.orderItems).where(eq(s.orderItems.orderId, order.id))
  return c.json({ ...order, items })
})

// --- Admin: Login ---
app.get('/admin/login', async (c) => {
  return c.html(<Layout title="Admin Login" isAdmin={true}>
    <div class="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <h1 class="text-2xl font-bold mb-6 text-center">Login Admin</h1>
      <form action="/api/admin/login" method="post" class="space-y-4">
        <div>
          <label for="password" class="block text-sm font-medium mb-1">Password</label>
          <input type="password" id="password" name="password" required class="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
        </div>
        <button type="submit" class="w-full rounded-md bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700">Login</button>
      </form>
    </div>
  </Layout>)
})

app.post('/api/admin/login', async (c) => {
  const fd = await c.req.formData()
  const password = fd.get('password')?.toString()
  if (password === c.env.ADMIN_SECRET) {
    const headers = new Headers()
    headers.set('Set-Cookie', `admin_secret=${c.env.ADMIN_SECRET}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`)
    headers.set('Location', '/admin')
    return new Response(null, { status: 302, headers })
  }
  const headers = new Headers()
  headers.set('Location', '/admin/login?error=1')
  return new Response(null, { status: 302, headers })
})

app.post('/api/admin/logout', async (c) => {
  const headers = new Headers()
  headers.set('Set-Cookie', `admin_secret=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
  headers.set('Location', '/admin/login')
  return new Response(null, { status: 302, headers })
})

// --- Admin Middleware ---
function adminGuard(c: any) {
  if (!checkAdmin(c)) {
    const headers = new Headers()
    headers.set('Location', '/admin/login')
    return new Response(null, { status: 302, headers })
  }
}

const adminRoute = (handler: (c: any) => any) => async (c: any) => {
  const guard = adminGuard(c)
  if (guard) return guard
  return handler(c)
}

// --- Admin: Dashboard ---
app.get('/admin', adminRoute(async (c) => {
  const db = getDb(c.env)
  const [prodCount] = await db.select({ count: count() }).from(s.products)
  const [orderCount] = await db.select({ count: count() }).from(s.orders)
  const [rev] = await db.select({ total: sql<number>`COALESCE(SUM(total_amount), 0)` }).from(s.orders).where(eq(s.orders.status, 'paid'))
  const [pending] = await db.select({ count: count() }).from(s.orders).where(eq(s.orders.status, 'pending'))
  const recent = await db.select().from(s.orders).orderBy(desc(s.orders.createdAt)).limit(5)
  const stats = { totalProducts: prodCount.count, totalOrders: orderCount.count, totalRevenue: rev.total, pendingOrders: pending.count }
  return c.html(<Layout title="Dashboard" isAdmin={true}><DashboardPage stats={stats} recentOrders={recent} /></Layout>)
}))

// --- Admin: Products ---
app.get('/admin/products', adminRoute(async (c) => {
  const db = getDb(c.env)
  const page = parseInt(c.req.query('page') || '1')
  const total = (await db.select({ count: count() }).from(s.products))[0].count
  const products = await db.select().from(s.products).orderBy(desc(s.products.createdAt)).limit(PER_PAGE).offset((page - 1) * PER_PAGE)
  const cats = await db.select().from(s.categories)
  return c.html(<Layout title="Produk" isAdmin={true}><AdminProductsPage products={products} categories={cats} page={page} totalPages={Math.ceil(total / PER_PAGE)} /></Layout>)
}))

app.post('/api/admin/products', adminRoute(async (c) => {
  const db = getDb(c.env)
  const body = await c.req.json()
  await db.insert(s.products).values({
    id: genId(),
    name: body.name,
    slug: slugify(body.name) + '-' + genId().slice(0, 4),
    description: body.description || '',
    price: parseInt(body.price),
    stock: parseInt(body.stock || '0'),
    categoryId: body.categoryId || null,
    type: body.type || 'physical',
    isActive: body.isActive ? 1 : 0,
    isFeatured: body.isFeatured ? 1 : 0,
    imageUrl: body.imageUrl || null,
    createdAt: now()
  })
  return c.json({ ok: true })
}))

app.put('/api/admin/products/:id', adminRoute(async (c) => {
  const db = getDb(c.env)
  const id = c.req.param('id')
  const body = await c.req.json()
  await db.update(s.products).set({ ...body, updatedAt: now() }).where(eq(s.products.id, id))
  return c.json({ ok: true })
}))

app.delete('/api/admin/products/:id', adminRoute(async (c) => {
  const db = getDb(c.env)
  const id = c.req.param('id')
  await db.delete(s.products).where(eq(s.products.id, id))
  return c.json({ ok: true })
}))

// --- Admin: Orders ---
app.get('/admin/orders', adminRoute(async (c) => {
  const db = getDb(c.env)
  const page = parseInt(c.req.query('page') || '1')
  const statusFilter = c.req.query('status') || ''
  const conditions = statusFilter ? [eq(s.orders.status, statusFilter)] : []
  const total = (await db.select({ count: count() }).from(s.orders).where(and(...conditions)))[0].count
  const orders = await db.select().from(s.orders).where(and(...conditions)).orderBy(desc(s.orders.createdAt)).limit(PER_PAGE).offset((page - 1) * PER_PAGE)
  const result = []
  for (const o of orders) {
    const items = await db.select().from(s.orderItems).where(eq(s.orderItems.orderId, o.id))
    result.push({ ...o, items })
  }
  return c.html(<Layout title="Pesanan" isAdmin={true}><AdminOrdersPage orders={result} page={page} totalPages={Math.ceil(total / PER_PAGE)} statusFilter={statusFilter} /></Layout>)
}))

app.get('/admin/orders/:id', adminRoute(async (c) => {
  const db = getDb(c.env)
  const id = c.req.param('id')
  const [order] = await db.select().from(s.orders).where(eq(s.orders.id, id)).limit(1)
  if (!order) return c.notFound()
  const items = await db.select().from(s.orderItems).where(eq(s.orderItems.orderId, order.id))
  return c.html(<Layout title={`Pesanan ${id.slice(0, 8)}`} isAdmin={true}>
    <div class="space-y-6 max-w-3xl">
      <a href="/admin/orders" class="text-sm text-primary-600 hover:underline">&larr; Kembali</a>
      <h1 class="text-3xl font-bold">Pesanan #{id.slice(0, 8)}</h1>
      <div class="grid grid-cols-2 gap-6">
        <div class="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <h2 class="font-semibold mb-4">Data Pelanggan</h2>
          <p class="text-sm"><strong>Nama:</strong> {order.customerName}</p>
          <p class="text-sm"><strong>Email:</strong> {order.customerEmail}</p>
          <p class="text-sm"><strong>Telepon:</strong> {order.customerPhone || '-'}</p>
          <p class="text-sm"><strong>Alamat:</strong> {order.shippingAddress || '-'}</p>
        </div>
        <div class="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <h2 class="font-semibold mb-4">Pembayaran</h2>
          <p class="text-sm"><strong>Metode:</strong> {order.paymentMethod}</p>
          <p class="text-sm"><strong>Status:</strong> <span class={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            order.status === 'paid' ? 'bg-green-100 text-green-700' : order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
          }`}>{order.status}</span></p>
          <p class="text-sm"><strong>Payment ID:</strong> {order.paymentId || '-'}</p>
        </div>
      </div>
      <div class="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <h2 class="font-semibold mb-4">Item Pesanan</h2>
        <table class="w-full text-sm">
          <thead><tr class="border-b"><th class="text-left py-2">Produk</th><th class="text-right py-2">Harga</th><th class="text-center py-2">Jumlah</th><th class="text-right py-2">Subtotal</th></tr></thead>
          <tbody>
            {items.map(i => <tr class="border-b">
              <td class="py-2">{i.productName}</td>
              <td class="text-right py-2">{idr(i.productPrice)}</td>
              <td class="text-center py-2">{i.quantity}</td>
              <td class="text-right py-2">{idr(i.productPrice * i.quantity)}</td>
            </tr>)}
          </tbody>
        </table>
        <div class="mt-4 space-y-1 text-sm text-right">
          <p>Subtotal: {idr(order.subtotal)}</p>
          <p>Pengiriman: {idr(order.shippingCost || 0)}</p>
          <p>Pajak: {idr(order.taxAmount || 0)}</p>
          <p class="font-bold text-lg">Total: {idr(order.totalAmount)}</p>
        </div>
      </div>
      <div class="flex gap-2">
        {order.status === 'pending' ? <>
          <button onclick="adminPut('/api/admin/orders/' + '{order.id}', { status: 'paid' })" class="rounded-md bg-green-600 px-4 py-2 text-white text-sm font-medium hover:bg-green-700">Tandai Lunas</button>
          <button onclick="adminPut('/api/admin/orders/' + '{order.id}', { status: 'cancelled' })" class="rounded-md bg-red-600 px-4 py-2 text-white text-sm font-medium hover:bg-red-700">Batalkan</button>
        </> : ''}
        {order.status === 'paid' ? <button onclick="adminPut('/api/admin/orders/' + '{order.id}', { status: 'shipped' })" class="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700">Tandai Dikirim</button> : ''}
      </div>
    </div>
  </Layout>)
}))

app.put('/api/admin/orders/:id', adminRoute(async (c) => {
  const db = getDb(c.env)
  const id = c.req.param('id')
  const body = await c.req.json()
  await db.update(s.orders).set({ ...body, updatedAt: now() }).where(eq(s.orders.id, id))
  return c.json({ ok: true })
}))

// --- Admin: Categories ---
app.get('/admin/categories', adminRoute(async (c) => {
  const db = getDb(c.env)
  const cats = await db.select({
    id: s.categories.id,
    name: s.categories.name,
    slug: s.categories.slug,
    description: s.categories.description,
    imageUrl: s.categories.imageUrl,
    sortOrder: s.categories.sortOrder,
    productCount: count()
  }).from(s.categories).leftJoin(s.products, eq(s.categories.id, s.products.categoryId)).groupBy(s.categories.id).orderBy(s.categories.sortOrder)
  return c.html(<Layout title="Kategori" isAdmin={true}><AdminCategoriesPage categories={cats} /></Layout>)
}))

app.post('/api/admin/categories', adminRoute(async (c) => {
  const db = getDb(c.env)
  const body = await c.req.json()
  await db.insert(s.categories).values({
    id: genId(),
    name: body.name,
    slug: slugify(body.name) + '-' + genId().slice(0, 4),
    description: body.description || '',
    imageUrl: body.imageUrl || null
  })
  return c.json({ ok: true })
}))

app.put('/api/admin/categories/:id', adminRoute(async (c) => {
  const db = getDb(c.env)
  const id = c.req.param('id')
  const body = await c.req.json()
  await db.update(s.categories).set(body).where(eq(s.categories.id, id))
  return c.json({ ok: true })
}))

app.delete('/api/admin/categories/:id', adminRoute(async (c) => {
  const db = getDb(c.env)
  const id = c.req.param('id')
  await db.delete(s.categories).where(eq(s.categories.id, id))
  return c.json({ ok: true })
}))

// --- Admin: Settings ---
app.get('/admin/settings', adminRoute(async (c) => {
  const db = getDb(c.env)
  const rows = await db.select().from(s.storeSettings)
  const settings: Record<string, string> = {}
  for (const r of rows) settings[r.key] = r.value || ''
  return c.html(<Layout title="Pengaturan" isAdmin={true}>
    <AdminSettingsPage settings={settings} mayarConfigured={!!c.env.MAYAR_API_KEY} />
  </Layout>)
}))

app.post('/api/admin/settings', adminRoute(async (c) => {
  const db = getDb(c.env)
  const body = await c.req.json()
  for (const [key, value] of Object.entries(body)) {
    await db.insert(s.storeSettings).values({ key, value: String(value) }).onConflictDoUpdate({ target: s.storeSettings.key, set: { value: String(value) } })
  }
  return c.json({ ok: true })
}))

// --- Client JS ---
app.get('/client/app.js', (c) => {
  return new Response(APP_JS, { headers: { 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=3600' } })
})

// --- Webhook: Stripe ---
app.post('/api/webhooks/stripe', async (c) => {
  const body = await c.req.text()
  const sig = c.req.header('stripe-signature')
  const valid = await verifyStripeSignature(c.env.STRIPE_WEBHOOK_SECRET || '', body, sig || null)
  if (!valid) return c.json({ error: 'invalid signature' }, 400)
  const event = JSON.parse(body)
  if (event.type === 'checkout.session.completed') {
    const orderId = event.data.object.metadata?.orderId
    if (orderId) {
      const db = getDb(c.env)
      await db.update(s.orders).set({ status: 'paid', updatedAt: now() }).where(eq(s.orders.id, orderId))
    }
  }
  return c.json({ received: true })
})

export default app
