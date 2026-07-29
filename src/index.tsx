import { Hono } from 'hono'
import { getDb } from './db'
import { eq, and, like, or, desc, asc, count, sql } from 'drizzle-orm'
import * as s from './schema'
import { idr, slugify, genId, now, SHIPPING_COST, TAX_RATE, calcShipping, calcTax } from './lib/utils'
import { createMayarInvoice } from './lib/mayar'
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

const app = new Hono<{ Bindings: { DB: D1Database; BUCKET: R2Bucket; MAYAR_API_KEY?: string; ADMIN_SECRET?: string } }>()
const PER_PAGE = 20

function checkAdmin(c: any) {
  const secret = c.req.header('Cookie')?.split(';').find((c: string) => c.trim().startsWith('admin_secret='))?.split('=')[1]
  return secret === c.env.ADMIN_SECRET
}

async function loadSettings(c: any): Promise<Record<string, string>> {
  const db = getDb(c.env)
  const rows = await db.select().from(s.storeSettings)
  const settings: Record<string, string> = {}
  for (const r of rows) settings[r.key] = r.value || ''
  return settings
}

// --- Static Pages ---
const staticPage = (title: string, content: any) => async (c: any) => {
  const settings = await loadSettings(c)
  return c.html(<Layout title={title} settings={settings}>{content}</Layout>)
}

app.get('/about', staticPage('Tentang', <AboutPage />))
app.get('/contact', staticPage('Kontak', <ContactPage />))
app.get('/privacy', staticPage('Privasi', <PrivacyPage />))
app.get('/shipping', staticPage('Pengiriman', <ShippingPage />))

// --- Homepage ---
app.get('/', async (c) => {
  const db = getDb(c.env)
  const featured = await db.select().from(s.products).where(and(eq(s.products.isActive, 1), eq(s.products.isFeatured, 1))).limit(8)
  const cats = await db.select().from(s.categories).orderBy(s.categories.sortOrder)
  const settings = await loadSettings(c)
  return c.html(<Layout title="Beranda" settings={settings}><HomePage products={featured} categories={cats} settings={settings} /></Layout>)
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
  const settings = await loadSettings(c)
  return c.html(<Layout title={product.name} settings={settings}><ProductPage product={product} related={related} /></Layout>)
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
  const settings = await loadSettings(c)
  return c.html(<Layout title="Kategori" settings={settings}><CategoriesPage categories={cats} /></Layout>)
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
  const settings = await loadSettings(c)

  return c.html(<Layout title={cat.name} settings={settings}><CategoryPage products={products} categoryName={cat.name} categorySlug={cat.slug} sort={sort} page={page} totalPages={totalPages} /></Layout>)
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
  const settings = await loadSettings(c)

  return c.html(<Layout title="Cari" settings={settings}><SearchPage products={products} categories={cats} q={q} category={catId} min={min} max={max} page={page} totalPages={totalPages} /></Layout>)
})

// --- Checkout ---
app.get('/checkout', async (c) => {
  const settings = await loadSettings(c)
  const mayarEnabled = settings['mayar_enabled'] !== '0'
  return c.html(<Layout title="Checkout" settings={settings}><CheckoutPage mayarEnabled={mayarEnabled} settings={settings} /></Layout>)
})

// --- Success ---
app.get('/checkout/success', async (c) => {
  const db = getDb(c.env)
  const orderId = c.req.query('orderId')
  if (!orderId) return c.redirect('/')
  const [order] = await db.select().from(s.orders).where(eq(s.orders.id, orderId)).limit(1)
  if (!order) return c.redirect('/')
  const items = await db.select().from(s.orderItems).where(eq(s.orderItems.orderId, orderId))
  const settings = await loadSettings(c)
  return c.html(<Layout title="Pesanan Berhasil" settings={settings}><SuccessPage order={order} items={items} settings={settings} /></Layout>)
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
      const settings = await loadSettings(c)
      return c.html(<Layout title="Lacak Pesanan" settings={settings}><TrackPage order={{ ...order, items }} /></Layout>)
    }
  }
  const settings = await loadSettings(c)
  return c.html(<Layout title="Lacak Pesanan" settings={settings}><TrackPage /></Layout>)
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
  let discountAmount = 0
  let discountLabel = ''
  const discountCode = body.discountCode || ''
  if (discountCode) {
    const dcKey = `discount_${discountCode.toUpperCase()}`
    const [discSetting] = await db.select().from(s.storeSettings).where(eq(s.storeSettings.key, dcKey)).limit(1)
    if (discSetting && discSetting.value) {
      const parts = discSetting.value.split(':')
      const dType = (parts[0] || '').toLowerCase()
      const dVal = parseInt(parts[1])
      if (dType === 'percent' && dVal > 0 && dVal <= 100) { discountAmount = Math.round(subtotal * dVal / 100); discountLabel = dVal + '%' }
      if (dType === 'fixed' && dVal > 0) { discountAmount = dVal; discountLabel = 'Rp ' + dVal.toLocaleString('id-ID') }
    }
  }
  const total = Math.max(0, subtotal + shipping + tax - discountAmount)

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

// --- API: Mayar Webhook ---
app.get('/api/webhooks/mayar', async (c) => c.json({ ok: true }))
app.post('/api/webhooks/mayar', async (c) => {
  const raw = await c.req.text()
  let body: any
  try { body = JSON.parse(raw) } catch { return c.json({ ok: false, error: 'invalid json' }, 400) }
  const db = getDb(c.env)
  const isPaid = body.event === 'payment.success' || body.status === 'PAID' || body.status === 'paid'
  const orderId = body.extraData?.orderId || body.data?.invoice?.extraData?.orderId || body.data?.extraData?.orderId || body.invoice?.extraData?.orderId
  if (orderId && isPaid) {
    await db.update(s.orders).set({ status: 'paid', updatedAt: now() }).where(eq(s.orders.id, orderId))
  }
  return c.json({ ok: true })
})


// --- API: Validate Discount ---
app.post('/api/checkout/validate-discount', async (c) => {
  const body = await c.req.json()
  const code = (body.code || '').toUpperCase()
  if (!code) return c.json({ valid: false, error: 'Kode tidak boleh kosong' })
  const db = getDb(c.env)
  const [setting] = await db.select().from(s.storeSettings).where(eq(s.storeSettings.key, `discount_${code}`)).limit(1)
  if (!setting || !setting.value) return c.json({ valid: false, error: 'Kode diskon tidak ditemukan' })
  const parts = setting.value.split(':')
  const type = (parts[0] || '').toLowerCase()
  const value = parseInt(parts[1])
  if (type === 'percent' && value > 0 && value <= 100) {
    return c.json({ valid: true, type: 'percent', value: value, label: value + '%' })
  }
  if (type === 'fixed' && value > 0) {
    return c.json({ valid: true, type: 'fixed', value: value, label: 'Rp ' + value.toLocaleString('id-ID') })
  }
  return c.json({ valid: false, error: 'Kode diskon tidak valid' })
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
  if (!file) return c.json({ error: 'File diperlukan' }, 400)
  if (file.size > 50 * 1024 * 1024) return c.json({ error: 'File maksimal 50MB' }, 400)

  const name = `${genId()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`
  const ab = await file.arrayBuffer()
  const key = await uploadImage(c.env.BUCKET, name, file.type, ab)
  return c.json({ key })
})

// --- API: Serve Image ---
app.get('/api/images/*', async (c) => {
  let key = c.req.path.replace(/^\/api\/images\//, '')
  let obj = await getImage(c.env.BUCKET, key)
  if (!obj) obj = await getImage(c.env.BUCKET, key.replace(/^products\//, ''))
  if (!obj) obj = await getImage(c.env.BUCKET, `products/${key}`)
  if (!obj) return c.notFound()
  const headers = new Headers()
  headers.set('Content-Type', obj.httpMetadata?.contentType || 'image/jpeg')
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  headers.set('ETag', obj.etag)
  return new Response(obj.body, { headers })
})

// --- API: Download Digital Product ---
app.get('/api/download/:orderId/:itemId', async (c) => {
  const db = getDb(c.env)
  const { orderId, itemId } = c.req.param() as any
  const email = c.req.query('email')
  if (!email) return c.text('Email diperlukan', 400)
  const [order] = await db.select().from(s.orders).where(and(eq(s.orders.id, orderId), eq(s.orders.customerEmail, email))).limit(1)
  if (!order) return c.text('Pesanan tidak ditemukan', 404)
  if (order.status !== 'paid') return c.text('Pesanan belum dibayar', 402)
  const [item] = await db.select().from(s.orderItems).where(and(eq(s.orderItems.id, itemId), eq(s.orderItems.orderId, orderId))).limit(1)
  if (!item || !item.productId) return c.text('Item tidak ditemukan', 404)
  const [product] = await db.select().from(s.products).where(eq(s.products.id, item.productId)).limit(1)
  if (!product || !product.fileKey) return c.text('File tidak tersedia', 404)
  const obj = await getImage(c.env.BUCKET, product.fileKey)
  if (!obj) return c.text('File tidak ditemukan', 404)
  const headers = new Headers()
  headers.set('Content-Type', obj.httpMetadata?.contentType || 'application/octet-stream')
  headers.set('Content-Disposition', 'attachment')
  headers.set('Cache-Control', 'no-cache')
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
  const settings = await loadSettings(c)
  return c.html(<Layout title="Admin Login" isAdmin={true} settings={settings}>
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
  const settings = await loadSettings(c)
  return c.html(<Layout title="Dashboard" isAdmin={true} settings={settings}><DashboardPage stats={stats} recentOrders={recent} /></Layout>)
}))

// --- Admin: Products ---
app.get('/admin/products', adminRoute(async (c) => {
  const db = getDb(c.env)
  const page = parseInt(c.req.query('page') || '1')
  const total = (await db.select({ count: count() }).from(s.products))[0].count
  const products = await db.select().from(s.products).orderBy(desc(s.products.createdAt)).limit(PER_PAGE).offset((page - 1) * PER_PAGE)
  const cats = await db.select().from(s.categories)
  const settings = await loadSettings(c)
  return c.html(<Layout title="Produk" isAdmin={true} settings={settings}><AdminProductsPage products={products} categories={cats} page={page} totalPages={Math.ceil(total / PER_PAGE)} /></Layout>)
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
  const settings = await loadSettings(c)
  return c.html(<Layout title="Pesanan" isAdmin={true} settings={settings}><AdminOrdersPage orders={result} page={page} totalPages={Math.ceil(total / PER_PAGE)} statusFilter={statusFilter} /></Layout>)
}))

app.get('/admin/orders/:id', adminRoute(async (c) => {
  const db = getDb(c.env)
  const id = c.req.param('id')
  const [order] = await db.select().from(s.orders).where(eq(s.orders.id, id)).limit(1)
  if (!order) return c.notFound()
  const items = await db.select().from(s.orderItems).where(eq(s.orderItems.orderId, order.id))
  const settings = await loadSettings(c)
  return c.html(<Layout title={`Pesanan ${id.slice(0, 8)}`} isAdmin={true} settings={settings}>
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
  const settings = await loadSettings(c)
  return c.html(<Layout title="Kategori" isAdmin={true} settings={settings}><AdminCategoriesPage categories={cats} /></Layout>)
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
  return c.html(<Layout title="Pengaturan" isAdmin={true} settings={settings}>
    <AdminSettingsPage settings={settings} mayarConfigured={!!c.env.MAYAR_API_KEY} />
  </Layout>)
}))

app.post('/api/admin/settings', adminRoute(async (c) => {
  const db = getDb(c.env)
  const body = await c.req.json()
  for (const [key, value] of Object.entries(body)) {
    if (key.startsWith('delete_')) {
      await db.delete(s.storeSettings).where(eq(s.storeSettings.key, key.replace('delete_', '')))
    } else {
      await db.insert(s.storeSettings).values({ key, value: String(value) }).onConflictDoUpdate({ target: s.storeSettings.key, set: { value: String(value) } })
    }
  }
  return c.json({ ok: true })
}))

// --- Client JS ---
app.get('/client/app.js', (c) => {
  return new Response(APP_JS, { headers: { 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=3600' } })
})

export default app
