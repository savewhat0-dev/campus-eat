# PostgreSQL standalone backend

render/server.mjs now uses DATABASE_URL and render/postgres.mjs, rather than local SQLite. PostgreSQL migrations live in render/migrations/. The existing Sites/D1 app remains compatible and separate. render/database.mjs is retained only as the older local SQLite adapter; it is not used by the standalone server.

PostgreSQL adapter tests: set TEST_POSTGRES=1 and run node scripts/order-flow-test.mjs. This uses embedded PostgreSQL via PGlite, skips only the migration advisory-lock call unsupported in that embedded test environment, and runs the same authentication and order lifecycle assertions. Real pg.Pool networking, TLS and concurrent-process locking require hosted verification.
