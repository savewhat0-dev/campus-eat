# Render setup: final PostgreSQL package

For this upgrade, follow UPGRADE-REPORT.md first. Use CampusEats-Product-Images-2026-10-30.zip. Extract it, and upload all extracted files and folders to the ROOT of a new private GitHub repository named campus-eats. Preserve folder structure. Do not upload the ZIP. Existing incomplete repositories can retain conflicting settings, so a new repository is the clearest route. The package includes Chef, PostgreSQL support and a file guide; no credentials or customer records are included.

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
| GOOGLE_CLIENT_ID | OAuth client ID from Google Cloud > Google Auth Platform > Clients |
| GOOGLE_CLIENT_SECRET | Secret from that same OAuth client; store only in Render |
| GOOGLE_OAUTH_REFRESH_TOKEN | Long-lived refresh token issued after authorizing the Gmail API `gmail.send` scope; store only in Render |
| EMAIL_FROM | `Campus Eats <your-authorized-gmail@gmail.com>`; the address must be the Google account that authorized this OAuth client, or an alias configured in that Gmail account |
| RETAILER_ACCOUNTS | Five-account salted-hash JSON generated as below |

Do NOT add DATABASE_PATH, SQLite paths, Datadog keys, frontend VITE_ secrets, or placeholder credentials. Do not manually set PORT; Render supplies it.

PUBLIC_ORIGIN is now OPTIONAL for the default onrender.com URL. The app automatically reads RENDER_EXTERNAL_URL supplied by Render, avoiding the need to guess the website's final address. Remove an old incorrect PUBLIC_ORIGIN setting if present. Only set PUBLIC_ORIGIN later for a custom domain; use the full canonical HTTPS origin with no path. A trailing slash is normalized.

For a first visual preview, the Google OAuth fields, EMAIL_FROM and RETAILER_ACCOUNTS may remain unset. The website will show that login is awaiting configuration. All three Google OAuth fields and EMAIL_FROM must be configured for customer sign-in. The database URL is mandatory. Never paste secrets into chat or source control.

## E. Generate the five retailer accounts on Windows

Install Node.js 24 locally if needed. Extract this package. Open PowerShell in the extracted folder. Run:

    powershell -NoProfile -File .\scripts\setup-retailers.ps1

The script asks for a username and hidden password for each outlet: kathi, greenox, cafe, burger, dominos. Use five distinct usernames and passwords at least 12 characters long. It copies only the salted-hash configuration to your clipboard. Paste the whole value into Render's RETAILER_ACCOUNTS environment variable. Save, then clear your clipboard. Keep retailer login passwords in your password manager and distribute them privately to their corresponding owners. No public self-registration is enabled for retailers.

If your machine's script policy prevents running this helper, do not weaken a managed policy: the cross-platform scripts/provision-retailers.mjs also accepts five JSON objects through stdin as documented in that file. Contact your machine administrator if necessary.

## F. Email setup

Customer verification uses a first-party magic link: the server generates a random, single-use token, stores only its SHA-256 hash, and expires it after 15 minutes. Clicking the link verifies the @bmu.edu.in address and starts the session. The link can only be used once. The app sends it using Gmail API over HTTPS; it does not use Resend, SMTP, or a Gmail app password. Render Free blocks SMTP ports, but this Gmail API request uses HTTPS.

### Google Cloud setup (one-time)

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select the project you will use. In **APIs & Services > Library**, find **Gmail API** and click **Enable**.
2. Open **Google Auth Platform > Branding**. Set the app name to **Campus Eats**, add your contact/support email, and save. This is the consent-screen label; it is not the website URL.
3. Open **Google Auth Platform > Audience**. Choose **External** for a personal Gmail sender. Add the Gmail account that will send the links under **Test users** while setting up.
4. Open **Google Auth Platform > Data Access > Add or remove scopes**. Add only `https://www.googleapis.com/auth/gmail.send`, then save.
5. Open **Google Auth Platform > Clients > Create client**. Select **Web application**. Add this exact **Authorized redirect URI**: `https://developers.google.com/oauthplayground`. Create it and copy the client ID and client secret. Do not add the Render site URL as this redirect; OAuth Playground receives this setup's callback.
6. Open [OAuth 2.0 Playground](https://developers.google.com/oauthplayground). Click the gear icon at the top right. Turn on **Use your own OAuth credentials**, then paste the client ID and client secret from step 5. Save the settings.
7. In Step 1, enter only `https://www.googleapis.com/auth/gmail.send` in the scope box and click **Authorize APIs**. Sign in as the exact Gmail account that should send the messages and allow access. Return to the Playground.
8. In Step 2, click **Exchange authorization code for tokens**. Copy the **Refresh token** value. Do not use the Authorization code or Access token. Do not send the refresh token in chat or put it in a source file.

**Important token lifetime:** the OAuth Playground's default app has a short-lived token. This setup uses your own OAuth client credentials instead. Google's OAuth docs state that an External app left in **Testing** issues refresh tokens that expire after 7 days for Gmail scopes. For longer-running use, change the app publishing status in **Google Auth Platform > Audience** to **In production**. Google may show an unverified-app warning or require OAuth verification because `gmail.send` is a sensitive scope. If you keep Testing, expect to repeat authorization and replace the Render refresh token every 7 days. Google explains [OAuth refresh tokens and expiration](https://developers.google.com/identity/protocols/oauth2) and [sending with Gmail API](https://developers.google.com/workspace/gmail/api/guides/sending).

### Put the values in Render

1. Open **Render Dashboard > your `campus-eats-bmu` Web Service > Environment** (not the Postgres database's Environment page).
2. Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_OAUTH_REFRESH_TOKEN` using the exact values from Google Cloud/OAuth Playground.
3. Set `EMAIL_FROM` to `Campus Eats <the-same-authorized-gmail-address@gmail.com>`. The sender must be the Gmail account that granted the OAuth consent, unless that account already has the chosen sender configured as a verified alias.
4. Keep `DATABASE_URL`, `RETAILER_ACCOUNTS`, and other existing settings. Remove old `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS` variables; they are no longer used.
5. Click **Save, rebuild, and deploy** (or save changes and trigger **Manual Deploy > Deploy latest commit** after uploading the updated project files to GitHub).
6. After deployment completes, open the site, request a link using a real `@bmu.edu.in` address, and check that inbox and Spam. The message will come from the Gmail address configured above. Click the one-time link within 15 minutes.

The three Google OAuth values are secrets. Keep them only in the Render Web Service environment. Never send them in chat, screenshots, GitHub, or a browser-visible `VITE_` variable. Google authorization is for the sender account only; students do not authorize Gmail or share passwords.

## G. Deploy and verify

Save settings and select Deploy / Deploy latest commit. The service automatically creates and migrates tables in your new PostgreSQL database. No manual SQL console commands are required. Startup ends with Campus Eats server ready. Open the actual assigned onrender.com URL. Visit /healthz: expect {"ok":true}.

Then test:
1. Request a sign-in link to your university email, click it, and complete name/ID/phone profile.
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
| Login awaiting setup | Configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN, EMAIL_FROM and five retailer hashes |
| `google_oauth_rejected` | Confirm the client ID/secret match the OAuth Playground custom credentials and that the refresh token came from that same OAuth client and Gmail account; issue a fresh token if needed |
| `gmail_api_rejected` | Confirm Gmail API is enabled, the OAuth grant includes `gmail.send`, the sender matches the authorized Gmail account/alias, and the token has not expired or been revoked |
| Login stops working after several days | If the Google Auth Platform app is still in Testing, Google expires Gmail-scope refresh tokens after 7 days; publish the app and complete any verification Google requires, or reauthorize and update the Render token |
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


