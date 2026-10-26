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
| GMAIL_USER | `rishabh.kaktan.25bb@bmu.edu.in` |
| EMAIL_FROM | `Campus Eats <rishabh.kaktan.25bb@bmu.edu.in>` |
| GOOGLE_OAUTH_CLIENT_ID | OAuth client ID from the Google Cloud project with Gmail API enabled |
| GOOGLE_OAUTH_CLIENT_SECRET | OAuth client secret; store only in Render |
| GOOGLE_OAUTH_REFRESH_TOKEN | Refresh token authorized for the BMU sender and `gmail.send` scope; store only in Render |
| RETAILER_ACCOUNTS | Five-account salted-hash JSON generated as below |

Do NOT add DATABASE_PATH, SQLite paths, Datadog keys, frontend VITE_ secrets, or placeholder credentials. Do not manually set PORT; Render supplies it.

PUBLIC_ORIGIN is now OPTIONAL for the default onrender.com URL. The app automatically reads RENDER_EXTERNAL_URL supplied by Render, avoiding the need to guess the website's final address. Remove an old incorrect PUBLIC_ORIGIN setting if present. Only set PUBLIC_ORIGIN later for a custom domain; use the full canonical HTTPS origin with no path. A trailing slash is normalized.

For a first visual preview, the Gmail OAuth fields, EMAIL_FROM and RETAILER_ACCOUNTS may remain unset. The website will show that login is awaiting configuration. All Gmail OAuth fields must be configured for customer sign-in. The database URL is mandatory. Never paste secrets into chat or source control.

## E. Generate the five retailer accounts on Windows

Install Node.js 24 locally if needed. Extract this package. Open PowerShell in the extracted folder. Run:

    powershell -NoProfile -File .\scripts\setup-retailers.ps1

The script asks for a username and hidden password for each outlet: kathi, greenox, cafe, burger, dominos. Use five distinct usernames and passwords at least 12 characters long. It copies only the salted-hash configuration to your clipboard. Paste the whole value into Render's RETAILER_ACCOUNTS environment variable. Save, then clear your clipboard. Keep retailer login passwords in your password manager and distribute them privately to their corresponding owners. No public self-registration is enabled for retailers.

If your machine's script policy prevents running this helper, do not weaken a managed policy: the cross-platform scripts/provision-retailers.mjs also accepts five JSON objects through stdin as documented in that file. Contact your machine administrator if necessary.

## F. Email setup

This package sends through the Gmail API over HTTPS using the BMU mailbox configured above. It does not use Resend or SMTP. Google requires OAuth authorization for the `gmail.send` scope, and a BMU Google Workspace administrator may need to allow the OAuth app. See [Gmail API authorization](https://developers.google.com/workspace/gmail/api/auth/web-server) and [Gmail API scopes](https://developers.google.com/workspace/gmail/api/auth/scopes).

Setup:
1. In Google Cloud Console, create a project, enable the Gmail API, and configure its OAuth consent screen. Use the BMU account as the sender. If BMU manages this account, follow its administrator's rules for third-party OAuth apps.
2. Create an OAuth client and authorize the exact scope `https://www.googleapis.com/auth/gmail.send` for `rishabh.kaktan.25bb@bmu.edu.in`.
3. Obtain the client ID, client secret and refresh token through Google's OAuth flow. Do not use a Gmail password or App Password in these fields.
4. Add the five Gmail variables from the table to the Render web service environment, save, and redeploy.

Google may expire refresh tokens for OAuth apps left in external Testing mode, and BMU may block the authorization. If the app reports `admin_policy_enforced`, only BMU's Google Workspace administrator can allow it. The app logs the HTTP status and error code, never OAuth secrets.

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
| Login awaiting setup | Configure Gmail OAuth fields, EMAIL_FROM and five retailer hashes |
| Email delivery failed | Check Google OAuth credentials, `gmail.send` consent, BMU Workspace policy and Render logs; never share OAuth secrets |
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
