# Campus Eats final Render upload package

This replaces the previous SQLite upload package. Start with DEPLOY-RENDER.md for the exact steps and environment settings. Upload every extracted file and folder to your GitHub repository ROOT, preserving the folder structure. Do not upload the ZIP itself. This package contains no credentials or customer records.

| Path | Purpose |
| --- | --- |
| package.json | Dependencies, build, start and test commands |
| package-lock.json | Locked dependencies for npm ci |
| index.html | Browser entry page |
| vite.render.config.mjs | React frontend build |
| postcss.config.mjs | CSS processor configuration |
| render.yaml | Free Render web service; no disk; DATABASE_URL supplied as secret |
| app/page.tsx | Customer menus, authentication, cart and orders |
| app/globals.css | Website styles |
| components/retailer-workspace.tsx | Outlet-scoped retailer orders and status actions |
| components/wash-chat.tsx | Chef food assistant UI (historical filename) |
| lib/catalog.ts | Menus, prices and outlets |
| lib/order-flow.ts | Customer validation and order transitions |
| lib/wash-chat.ts | Chef catalogue matching |
| lib/api.ts | OTP, sessions, profile, order and retailer APIs |
| render/client.tsx | Mounts the React application |
| render/build.mjs | Bundles the backend API |
| render/env.mjs | Supplies backend environment bindings |
| render/server.mjs | Starts Node server and PostgreSQL initialization |
| render/postgres.mjs | Parameterized queries, connection pool and transactional migrations |
| render/migrations/0001_initial.sql | PostgreSQL schema for all app tables |
| render/README.md | Backend and verification notes |
| drizzle/*.sql | Original SQLite schema, retained for regression tests only |
| scripts/provision-retailers.mjs | Generates salted hashes for five retailer accounts |
| scripts/order-flow-test.mjs | Full authentication and order lifecycle tests |
| scripts/postgres-test-db.mjs | Embedded PostgreSQL test fixture |
| scripts/wash-chat-test.mjs | Food search tests |
| public/favicon.svg | Browser icon |
| public/assets/* | Website images and reference menu photos |
| DEPLOY-RENDER.md | Step-by-step deployment, secrets and verification |
| .gitignore | Excludes secrets, local database files and generated output |
| FILES.csv | Upload inventory and file sizes |
| README.md | This file guide |

Render Free Postgres expires after 30 days. This package removes the paid disk requirement but does not remove hosting provider limits. Existing ChatGPT-site orders are not transferred automatically. Real email delivery requires Gmail API OAuth credentials for the configured BMU sender account; see DEPLOY-RENDER.md.

New files: render/config.mjs automatically selects and validates the Render URL; scripts/setup-retailers.ps1 privately prompts for retailer passwords and copies hashes; scripts/render-config-test.mjs verifies automatic URL and custom-domain settings. Follow DEPLOY-RENDER.md for the complete field-by-field setup, including Datadog, project, PostgreSQL version and environment variables.
