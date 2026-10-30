# CampusEats upgrade — 30 October 2026

This package upgrades the existing Render application. It has not been deployed to your live Render service.

## What changed

- Green responsive customer interface, aligned outlet cards, original supplied brand logos, distinct illustrative banners and Chef mascot.
- Product details group only existing menu variants, with correct size prices and quantity controls. Existing 307 menu options / 235 distinct outlet dishes retain their source prices and IDs.
- Chef AI searches the live catalogue, handles product names inside sentences, budget and vegetarian queries, and follow-up context. Product cards open the same product/variant dialog used by menus. Unknown requests ask for a particular product name. It is catalogue search, not an external general-purpose language model.
- Mandatory profile completion after email-link authentication: full name, enrollment/staff ID, programme, year and mobile. Server checks prevent bypassing this step. Returning complete profiles continue directly.
- Retailer dashboard includes own-outlet orders, accept/deny reasons, preparation and pickup stages, menu management, real-photo upload, analytics, feedback and settings. Sign-out has a confirmation step.
- Customer and retailer login dialogs scroll on short screens. Existing magic-link authentication, five hashed retailer accounts, order history and server pricing are retained.
- Catalogue, images, feedback and status events are persisted in PostgreSQL. Migrations run automatically at startup and keep existing records. Seed insertion does not overwrite retailer edits.
- Sign-in email redesign: responsive live HTML, accessible meme image, prominent one-time verification button and no visible raw token URL in the email text.
- Fifteen supplied memes rotate in a fixed order per normalized university email address. PostgreSQL stores each account's position, independent across devices. Successful sends advance once; failed-delivery retries reuse the pending meme. The hamster-on-a-bike image is first; order is configurable with optional `SIGNIN_MEME_ORDER`. See SIGN-IN-MEMES.md.

## Product images — updated by the user's later request

The user subsequently authorized AI product illustrations while retaining actual-photo replacement. Every seed menu option now has labeled AI artwork. No AI image is marked as an outlet-approved photo. Actual retailer uploads take priority. See PRODUCT-IMAGES.md and PRODUCT-PHOTO-CHECKLIST.csv.

Retailer: sign in → Menu Management → Edit product → choose its actual PNG, JPEG or WebP photo (maximum 600 KB) → Save. A retailer can change only its own outlet. The image is stored in the database, so a Render restart does not erase it. Add ingredient descriptions only after confirming them with the outlet. Missing ingredient/allergen certifications are not invented.

## Deploy this upgrade to your existing Render service

1. Extract the ZIP. Replace the application source in the GitHub repository already connected to your service, preserving this folder structure. Do not upload node_modules or the ZIP itself. Keep a backup of the existing database before the schema upgrade.
2. Keep the existing DATABASE_URL, RETAILER_ACCOUNTS and Gmail configuration. Build: `npm ci --include=dev && npm run build:render`. Start: `npm run start:render`. Health check: `/healthz`. Choose a Node web service, not a static site.
3. Commit/push, then Render → your web service → Manual Deploy → Deploy latest commit. Startup applies the migrations. Check `/healthz`, then test a real customer email link and each retailer's credentials.

Required mail variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN and EMAIL_FROM. All OAuth values must belong to the same client; EMAIL_FROM must be the authorized sender or a configured Gmail alias. The user's intended sender is `Campus Eats <rishabh.kaktan.25bb@bmu.edu.in>` only when that mailbox authorized the token. No secrets are included. SMTP and Resend are not required by this Gmail API implementation. Real delivery cannot be guaranteed by this package and must be checked on the deployed service.

PUBLIC_ORIGIN is optional for the Render-generated URL. For a custom domain, set its full HTTPS origin only after the domain is configured. Keep the existing database rather than creating a new one.

Optional COURSE_OPTIONS: JSON array such as `[{"id":"btech","name":"B.Tech","years":[1,2,3,4]}]`. This overrides the default programme list. Default names/durations were based on BMU's published courses; the campus administrator should maintain the exact active list. Sources: https://www.bmu.edu.in/courses/ and https://admissions.bmu.edu.in/.

## Validation completed

- Production Vite/server build and frontend TypeScript checks passed.
- SQLite and embedded PostgreSQL (PGlite) integration tests passed, including idempotent migration, per-account meme rotation/retry/wraparound, profile enforcement, five retailer logins, outlet isolation, authoritative prices, stale-price rejection, unavailable products, photo validation and retrieval, order lifecycle, feedback and analytics.
- Chef query tests and Render origin/config tests passed.
- Browser checks covered desktop/mobile layout, logos, product variants/cart, Chef results, mandatory profile saving and returning users. Final desktop page had no broken images or horizontal page overflow.

Live Render networking, a hosted PostgreSQL connection, actual Gmail delivery and real outlet photos were not verified. The QA email sender captures mail locally; it does not send real messages. Preview data is explicitly labeled and is separate from production data. Retailers currently authenticate with username/password and do not receive email verification emails; the email rotation applies to university-email sign-in.

## Image provenance and prompt summary

The five supplied JPG brand logos are preserved in public/assets/logos, with cropped/contained lossless WebP derivatives. Brand art was not recreated by AI.

Built-in image generation created the hero, five outlet banners and transparent Chef mascot. Optimized WebP files are shipped locally. These are illustrative marketing assets, not verified photos of the campus dishes. Prompts used a warm premium food-photography style, natural lighting and no embedded text or logos:

- Hero: wide warm burger, fries and cola composition on the right, light ivory copy space on the left.
- Kathi: paneer wraps and Indian street-food presentation.
- GreeNox: fresh green vegetarian salad bowl in natural light.
- Café: white cappuccino with latte art and coffee beans.
- Burger Singh: vegetarian burger and fries, golden warm lighting.
- Domino's: Margherita-style mozzarella/basil pizza by a warm oven.
- Mascot: friendly white/emerald 3D robot chef, cyan eyes, chef hat and spoon, transparent background.

Generated dish illustrations are now included under the user's later authorization. They are clearly labeled and are not presented as verified outlet photos. See PRODUCT-IMAGES.md for the updated prompt set and replacement workflow.
