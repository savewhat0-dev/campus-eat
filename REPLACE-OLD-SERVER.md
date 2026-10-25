# Replace the old SQLite deployment

This package uses PostgreSQL. It does not require DATABASE_PATH, /var/data, a paid persistent disk, Wrangler, Vinext, or Next.js.

1. Extract this ZIP and upload all its CONTENTS to your GitHub repository root, replacing existing files. package.json, package-lock.json and render/ must be replaced together. Keep the render folder intact. If your old project is in a subfolder, ensure Render Root Directory points to the same location you updated; otherwise leave it blank.
2. On Render, confirm Settings > Repository and Branch point to the repo/branch you just updated.
3. Set Build Command: npm ci --include=dev && npm run build:render
4. Set Start Command: npm run start:render
5. Set Health Check Path: /healthz
6. Environment: keep DATABASE_URL (Internal Postgres URL), NODE_VERSION=24.21.0, NODE_ENV=production and your actual RESEND_API_KEY, EMAIL_FROM, RETAILER_ACCOUNTS. Remove obsolete DATABASE_PATH. PUBLIC_ORIGIN can remain if it matches your actual current HTTPS website address, otherwise remove it to use Render's assigned URL automatically. Set your custom origin only AFTER its domain/DNS is connected and verified.
7. Select Manual Deploy > Clear build cache & deploy (or the equivalent current option). Deploy the newest commit, not an older selected commit.
8. The NEW startup log says: Campus Eats PostgreSQL server ready (postgres-v2)
9. If the log still contains "Persistent DATABASE_PATH under /var/data is required", Render is building another commit, repo or subfolder. Adding a DATABASE_PATH variable does not convert that old server to PostgreSQL.

No database records or secrets are included. Existing SQLite/D1 data must be explicitly transferred if it needs retaining. The provided database schema is applied automatically for a new PostgreSQL database. Your actual hosted connection and email delivery require final testing.

Free Render Postgres expires after 30 days. This package does not create or authorize paid resources.
