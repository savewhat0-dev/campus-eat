# Deploy Campus Eats outside ChatGPT

The Render build is independent of ChatGPT hosting. Existing Sites build commands remain available.

## Before deployment

1. Create your own Render account at https://dashboard.render.com/register and connect the Render integration in this chat. Do not share passwords or API keys in chat.
2. Put this project in a private GitHub repository you control, then connect that repository to Render. Do not upload .git, .env files, .dev.vars, .wrangler, .sites-runtime, outputs, storage, or node_modules. Never copy the existing Sites Git remote credentials.
3. Review Render's current charges before creating resources. render.yaml specifies one Starter Node web service and a 1 GB persistent disk. This is a paid configuration. No paid service has been created yet.

## Render configuration

Use New > Blueprint with this repository and render.yaml at its root (or set its path if the project is a subdirectory). Inspect the proposed resources and billing before confirming.

Build: npm ci --include=dev && npm run build:render
Start: npm run start:render
Health check: /healthz
Node: 24.21.0
Persistent disk: /var/data, 1 GB
DATABASE_PATH: /var/data/campus.sqlite

Set secrets only in Render Environment:
- PUBLIC_ORIGIN: exact HTTPS origin assigned to your service, without trailing slash, e.g. https://your-service.onrender.com. Change this to your canonical custom domain when attached.
- RESEND_API_KEY: your Resend secret API key.
- EMAIL_FROM: approved sender on your verified domain, e.g. Campus Eats <orders@your-domain.example>.
- RETAILER_ACCOUNTS: five-account JSON containing username, outlet, salt and hash generated with scripts/provision-retailers.mjs. Outlet IDs: kathi, greenox, cafe, burger, dominos. Follow that script's stdin instructions; do not commit plaintext passwords or its secret output.

The server refuses to boot on Render without a configured origin and persistent database path. Migrations run transactionally on startup and are recorded so subsequent deployments preserve data. Use one service instance for this SQLite setup. Back up the SQLite database with SQLite-aware tooling before production changes; copy-only snapshots of a running database are insufficient.

## Verify before opening orders

Open /healthz and the customer home. Test an actual @bmu.edu.in OTP delivery, login with each retailer, and place one test order. Verify outlet isolation and customer-visible accept/deny/preparing/ready/collected updates. Tests currently mock email delivery; real sender configuration remains unverified.

Existing ChatGPT-hosted database records are not automatically transferred. This installation starts a separate database. If old orders must be retained, export and migrate them explicitly before switching customers.

## Domain

The assigned onrender.com URL works without buying a domain. For your own name, purchase a domain you choose, then use Render Settings > Custom Domains, add it, and apply the exact DNS records shown by Render. After verification and TLS provisioning, update PUBLIC_ORIGIN and redeploy. No domain has been purchased or reserved.

## Local standalone checks

npm run build:render
npm run start:render

Default local URL: http://localhost:3000. Local database: storage/campus.sqlite. Set PORT, DATABASE_PATH and PUBLIC_ORIGIN as environment variables when using another address. The existing Sites deployment remains separate.
