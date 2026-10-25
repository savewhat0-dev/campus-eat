CREATE TABLE challenges (
 email TEXT PRIMARY KEY,
 hash TEXT NOT NULL,
 expires BIGINT NOT NULL,
 sent BIGINT NOT NULL,
 attempts INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE sessions (
 token TEXT PRIMARY KEY,
 subject TEXT NOT NULL,
 role TEXT NOT NULL,
 outlet TEXT,
 expires BIGINT NOT NULL
);
CREATE TABLE profiles (email TEXT PRIMARY KEY, details TEXT NOT NULL);
CREATE TABLE settings (outlet TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE orders (
 id TEXT PRIMARY KEY,
 customer TEXT NOT NULL,
 outlet TEXT NOT NULL,
 items TEXT NOT NULL,
 total INTEGER NOT NULL,
 status TEXT NOT NULL,
 pickup TEXT NOT NULL,
 note TEXT NOT NULL,
 created BIGINT NOT NULL,
 customer_details TEXT NOT NULL DEFAULT '{}',
 decision_note TEXT NOT NULL DEFAULT '',
 request_id TEXT UNIQUE
);
CREATE INDEX orders_customer_created ON orders (customer,created DESC);
CREATE INDEX orders_outlet_created ON orders (outlet,created DESC);
