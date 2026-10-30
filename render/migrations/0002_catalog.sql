CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, outlet TEXT NOT NULL, data TEXT NOT NULL, updated BIGINT NOT NULL);
CREATE INDEX IF NOT EXISTS products_outlet ON products(outlet);
CREATE TABLE IF NOT EXISTS product_images (product_id TEXT PRIMARY KEY, data TEXT NOT NULL, mime TEXT NOT NULL, updated BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS order_events (id TEXT PRIMARY KEY, order_id TEXT NOT NULL, outlet TEXT NOT NULL, status TEXT NOT NULL, created BIGINT NOT NULL);
CREATE INDEX IF NOT EXISTS order_events_order ON order_events(order_id,created);
CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, order_id TEXT NOT NULL UNIQUE, outlet TEXT NOT NULL, customer TEXT NOT NULL, rating INTEGER NOT NULL, comment TEXT NOT NULL, created BIGINT NOT NULL);
