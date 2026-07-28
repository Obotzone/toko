export { sql, eq, and, or, like, desc, asc, count, sum } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  sortOrder: integer('sort_order').default(0)
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: integer('price').notNull(),
  stock: integer('stock').notNull().default(0),
  imageUrl: text('image_url'),
  fileKey: text('file_key'),
  type: text('type').notNull().default('physical'),
  isActive: integer('is_active').notNull().default(1),
  isFeatured: integer('is_featured').notNull().default(0),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at')
});

export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP')
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone'),
  shippingAddress: text('shipping_address'),
  subtotal: integer('subtotal').notNull(),
  shippingCost: integer('shipping_cost').default(0),
  taxAmount: integer('tax_amount').default(0),
  totalAmount: integer('total_amount').notNull(),
  status: text('status').notNull().default('pending'),
  paymentMethod: text('payment_method').notNull().default('manual'),
  paymentId: text('payment_id'),
  notes: text('notes'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at')
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id'),
  productName: text('product_name').notNull(),
  productPrice: integer('product_price').notNull(),
  quantity: integer('quantity').notNull()
});

export const storeSettings = sqliteTable('store_settings', {
  key: text('key').primaryKey(),
  value: text('value')
});
