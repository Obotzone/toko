INSERT INTO categories (id, name, slug, description, image_url, sort_order) VALUES
('cat-elektronik', 'Elektronik', 'elektronik', 'Perangkat elektronik terbaru', NULL, 1),
('cat-pakaian', 'Pakaian', 'pakaian', 'Pakaian fashion trendy', NULL, 2),
('cat-buku', 'Buku', 'buku', 'Buku best seller', NULL, 3);

INSERT INTO products (id, category_id, name, slug, description, price, stock, image_url, type, is_active, is_featured) VALUES
('prod-001', 'cat-elektronik', 'Laptop Asus Vivobook', 'laptop-asus-vivobook', 'Laptop performa tinggi untuk produktivitas.', 12000000, 10, 'https://picsum.photos/400/400?random=1', 'physical', 1, 1),
('prod-002', 'cat-elektronik', 'Headset Logitech G Pro', 'headset-logitech-g-pro', 'Headset gaming profesional.', 1500000, 25, 'https://picsum.photos/400/400?random=2', 'physical', 1, 0),
('prod-003', 'cat-elektronik', 'Mouse Razer DeathAdder', 'mouse-razer-deathadder', 'Mouse gaming ergonomis.', 900000, 30, 'https://picsum.photos/400/400?random=3', 'physical', 1, 0),
('prod-004', 'cat-elektronik', 'Keyboard Mechanical RGB', 'keyboard-mechanical-rgb', 'Keyboard mekanik responsif.', 800000, 20, 'https://picsum.photos/400/400?random=4', 'physical', 1, 1),
('prod-005', 'cat-pakaian', 'Kaos Polos Katun Premium', 'kaos-polos-katun', 'Kaos nyaman untuk sehari-hari.', 150000, 100, 'https://picsum.photos/400/400?random=5', 'physical', 1, 0),
('prod-006', 'cat-pakaian', 'Jeans Slim Fit', 'jeans-slim-fit', 'Celana jeans modern.', 350000, 50, 'https://picsum.photos/400/400?random=6', 'physical', 1, 1),
('prod-007', 'cat-pakaian', 'Hoodie Premium Fleece', 'hoodie-premium-fleece', 'Hoodie tebal dan hangat.', 450000, 40, 'https://picsum.photos/400/400?random=7', 'physical', 1, 0),
('prod-008', 'cat-pakaian', 'Jaket Denim Klasik', 'jaket-denim-klasik', 'Jaket denim abadi.', 550000, 30, 'https://picsum.photos/400/400?random=8', 'physical', 1, 0),
('prod-009', 'cat-buku', 'Laskar Pelangi', 'laskar-pelangi', 'Novel Andrea Hirata.', 85000, 60, 'https://picsum.photos/400/400?random=9', 'physical', 1, 1),
('prod-010', 'cat-buku', 'Bumi Manusia', 'bumi-manusia', 'Novel Pramoedya Ananta Toer.', 95000, 60, 'https://picsum.photos/400/400?random=10', 'physical', 1, 0),
('prod-011', 'cat-buku', 'Filosofi Teras', 'filosofi-teras', 'Buku pengembangan diri.', 75000, 80, 'https://picsum.photos/400/400?random=11', 'digital', 1, 0),
('prod-012', 'cat-buku', 'Atomic Habits', 'atomic-habits', 'Buku kebiasaan kecil.', 110000, 70, 'https://picsum.photos/400/400?random=12', 'digital', 1, 1);
