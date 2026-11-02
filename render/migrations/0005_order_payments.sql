CREATE TABLE IF NOT EXISTS order_payments (
 order_id TEXT PRIMARY KEY REFERENCES orders(id),
 outlet TEXT NOT NULL,
 choice TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'Unpaid',
 amount INTEGER NOT NULL,
 confirmed_by TEXT,
 updated BIGINT NOT NULL
);
