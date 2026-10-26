# Render setup: final PostgreSQL package

Use ONLY Campus-Eats-Render-Final.zip. Extract it, and upload all extracted files and folders to the ROOT of a new private GitHub repository named campus-eats. Preserve folder structure. Do not upload the ZIP. Existing incomplete repositories can retain conflicting settings, so a new repository is the clearest route. The package includes Chef, PostgreSQL support and a file guide; no credentials or customer records are included.

## A. Project (optional grouping)

If Render asks for Project, create/select Campus Eats.
If it asks for Environment, choose Production under that project.
These are grouping labels, not database credentials. If the selector is optional you can leave it unassigned. Your service Environment tab (secret key/value settings) is a different feature.

## B. Create the database first

Render Dashboard > New > Postgres.

| Form field | Enter/select |
| --- | --- |
| Name | campus-eats-db |
| Project | Campus Eats, or leave optional selector unassigned |
| Environment | Production, if you assigned the project |
| Database | campus_eats |
| User | campus_eats_user |
| Region | Singapore; use the SAME region for the web service |
| PostgreSQL Version | 18; keep Render's current default if 18 is unavailable |
| Datadog API Key | Leave BLANK; this app does not require Datadog |
| Datadog Region / Site | Leave default/blank; without a Datadog key it is unused |
| Instance / Compute Plan | Free |
| Storage | Free plan's fixed 1 GB; do not enable paid storage |
| Storage Autoscaling | Off, if offered |
| High Availability / replicas | Off / none, if offered |

If you already created a database, use its actual assigned database/user names and connection URL instead of creating duplicates. On Free only one active database per workspace is allowed. Do not delete an existing database containing records just to match these suggested labels.

Click Create Database. Wait until Available. Open Connect and copy the INTERNAL Database URL. It contains its generated password, hostname, username and database name. Do not construct the URL yourself or paste it into chat/GitHub. Do not change its generated password.

Free Render Postgres expires 30 days after creation and has 1 GB capacity. It is a trial/demo database, not permanent free hosting. Export/migrate before expiry or choose a paid database after reviewing its charges. No paid resource has been created or authorized by this package.

## C. Create the website service

Render Dashboard > New > Web Service > Git Provider > connect GitHub > select campus-eats.

| Form field | Enter/select |
| --- | --- |
| Name | campus-eats-bmu (if unavailable, campus-eats-bmu-risha or another unique name) |
| Project | Campus Eats, if created |
| Environment | Production, if offered |
| Language / Runtime | Node |
| Region | Singapore; same as database |
| Branch | main, or your actual uploaded branch |
| Root Directory | Leave BLANK when package.json is at repository root |
| Build Command | npm ci --include=dev && npm run build:render |
| Start Command | npm run start:render |
| Pre-Deploy Command | Leave BLANK; migrations run on startup |
| Instance / Compute Plan | Free |
| Health Check Path | /healthz |
| Auto Deploy | On commit / enabled |
| Persistent disk | NONE |
| Docker settings | Not used; choose Node runtime |
| Secret Files | NONE; use environment variables below |
| Build filters / custom domains / monitoring | Leave default unless you already configured them intentionally |

Choose Web Service, NOT Static Site. The login and orders API requires a running backend. For an already existing web service, update these commands, runtime environment variables and health path, then deploy your newest commit. Do not delete disks containing old records without migrating those records.

## D. Environment variables on the WEB SERVICE

| Key | Exact value/source |
| --- | --- |
| NODE_VERSION | 24.21.0 |
| NODE_ENV | production |
| DATABASE_URL | Paste the entire INTERNAL Database URL copied from the database Connect menu |
| SMTP_HOST | Your mailbox provider's SMTP hostname; for Gmail, `smtp.gmail.com` |
| SMTP_PORT | Provider's SMTP port. Gmail uses `587` (STARTTLS) or `465` (SSL); Render Free blocks both |
| SMTP_SECURE | `false` for STARTTLS on 587; `true` for SSL on 465 |
| SMTP_USER | Full SMTP account username, usually the complete sender email address |
| SMTP_PASS | Provider-issued app password or SMTP password; store only in Render |
| EMAIL_FROM | `Campus Eats <rishabh.kaktan.25bb@bmu.edu.in>` if that mailbox is authorized to send |
| RETAILER_ACCOUNTS | Five-account salted-hash JSON generated as below |

Do NOT add DATABASE_PATH, SQLite paths, Datadog keys, frontend VITE_ secrets, or placeholder credentials. Do not manually set PORT; Render supplies it.

PUBLIC_ORIGIN is now OPTIONAL for the default onrender.com URL. The app automatically reads RENDER_EXTERNAL_URL supplied by Render, avoiding the need to guess the website's final address. Remove an old incorrect PUBLIC_ORIGIN setting if present. Only set PUBLIC_ORIGIN later for a custom domain; use the full canonical HTTPS origin with no path. A trailing slash is normalized.

For a first visual preview, the SMTP fields, EMAIL_FROM and RETAILER_ACCOUNTS may remain unset. The website will show that login is awaiting configuration. All SMTP fields and EMAIL_FROM must be configured for customer sign-in. The database URL is mandatory. Never paste secrets into chat or source control.

## E. Generate the five retailer accounts on Windows

Install Node.js 24 locally if needed. Extract this package. Open PowerShell in the extracted folder. Run:

    powershell -NoProfile -File .\scripts\setup-retailers.ps1

The script asks for a username and hidden password for each outlet: kathi, greenox, cafe, burger, dominos. Use five distinct usernames and passwords at least 12 characters long. It copies only the salted-hash configuration to your clipboard. Paste the whole value into Render's RETAILER_ACCOUNTS environment variable. Save, then clear your clipboard. Keep retailer login passwords in your password manager and distribute them privately to their corresponding owners. No public self-registration is enabled for retailers.

If your machine's script policy prevents running this helper, do not weaken a managed policy: the cross-platform scripts/provision-retailers.mjs also accepts five JSON objects through stdin as documented in that file. Contact your machine administrator if necessary.

## F. Email setup

The verification logic is first-party: the server generates a random six-digit code, stores only its hash with a ten-minute expiry, limits attempts, and consumes it after a successful check. SMTP only delivers the email; no Google Cloud project, Gmail API, OAuth client, or refresh token is used.

For a Gmail sender, configure `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`, and `SMTP_USER` as the full sender address. `SMTP_PASS` must be an app password created for that mailbox (not the normal account password); Google requires 2-Step Verification, and school/work administrators can disable app passwords. Keep that secret in Render only. Google documents these SMTP settings [here](https://support.google.com/a/answer/176600) and app-password requirements [here](https://support.google.com/accounts/answer/185833).

Render's Free web services block outbound SMTP ports 25, 465, and 587. Therefore Gmail SMTP will not work on this service while it is on the Free plan. To use Gmail SMTP, move the web service to a paid Render instance. Alternatively, use an SMTP provider that offers a supported port such as 2525, after confirming that provider accepts your chosen sender. There is no way for app code alone to deliver a message into an inbox without a reachable mail server and authorized sender credentials. Render's current port policy is documented [here](https://render.com/docs/free).

## G. Deploy and verify

Save settings and select Deploy / Deploy latest commit. The service automatically creates and migrates tables in your new PostgreSQL database. No manual SQL console commands are required. Startup ends with Campus Eats server ready. Open the actual assigned onrender.com URL. Visit /healthz: expect {"ok":true}.

Then test:
1. Request an actual OTP to your university email, verify it, and complete name/ID/phone profile.
2. Sign in to each retailer; verify each sees only its own outlet's orders.
3. Place an order and accept/deny it; verify the student sees the update/reason.
4. Progress an accepted order through Preparing, Ready, Collected.
5. Check Chef food search and mobile display.

The build, embedded PostgreSQL authentication/order flow, original SQLite regression, Chef matching and automatic-origin tests have passed locally. Email delivery is mocked in tests. Hosted PostgreSQL networking/TLS and real email delivery still require this final verification using your private account configuration. The package cannot guarantee provider uptime or remove Free-plan limits.

## H. Common errors

| Symptom | Check |
| --- | --- |
| package.json not found | Files are nested one folder too deep; upload contents at root or set correct Root Directory |
| npm ci lock error | Upload package.json and package-lock.json from this SAME final package |
| Missing DATABASE_URL | Add it to the WEB SERVICE environment and redeploy |
| Database connection timeout | Database must be Available, same region; use full correct Internal URL |
| Invalid request origin | Remove incorrect PUBLIC_ORIGIN for onrender.com; custom domain must match its exact HTTPS origin |
| Login awaiting setup | Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM and five retailer hashes |
| Email delivery failed | Check SMTP hostname/port, mailbox credentials, app-password/Workspace policy and the Render plan's outbound SMTP rules; never share SMTP_PASS |
| First load is slow | Free Render web services sleep after 15 minutes idle and take about a minute to wake |
| Free Postgres expired | Restore/migrate from your export to a valid database, then update DATABASE_URL |

## I. Data and domains

This is a separate database from the existing ChatGPT-hosted website. Existing D1/SQLite orders do not transfer automatically. Do an explicit data export/import if records must be preserved. For a domain you own: service Settings > Custom Domains > Add, apply Render's displayed DNS records, verify, then set PUBLIC_ORIGIN to the canonical HTTPS domain and redeploy.

Official references checked 25 October 2026:
https://render.com/docs/postgresql-creating-connecting
https://render.com/docs/web-services
https://render.com/docs/free
https://render.com/docs/datadog
https://render.com/docs/environment-variables
