# CampusEats — Render upgrade

Read PRODUCT-IMAGES.md for the latest AI product artwork and actual-photo replacement update. Start with UPGRADE-REPORT.md for the changes, verification results, actual-product-photo workflow and instructions for updating your existing service. DEPLOY-RENDER.md contains the full Render setup reference.

This is a complete source package. Upload the extracted source folders to your connected GitHub repository, preserving their structure. No credentials, customer database or node_modules are included.

| Path | Purpose |
| --- | --- |
| app/page.tsx | Customer UI, authentication, booking, cart and tracking |
| app/redesign.css | Responsive green visual redesign |
| components/product-card.tsx | Shared menu/Chef cards and real variant dialog |
| components/chef-ai.tsx | Chef AI chat and catalogue result UI |
| components/profile-gate.tsx | Mandatory first-login profile |
| components/retailer-dashboard.tsx | Outlet-scoped orders, menu, analytics, feedback and settings |
| components/menu-food.tsx | Actual outlet photo, with labeled AI illustration as fallback |
| components/outlet-logo.tsx | Supplied brand logo display |
| components/feedback-form.tsx | Collected-order feedback |
| lib/api.ts | Authentication, profile, catalogue, image, order and retailer APIs |
| lib/catalog.ts | Original seed menu and prices |
| lib/catalog-store.ts | Persisted products and validated raster photo uploads |
| lib/profile.ts | Programme/year options and profile validation |
| lib/wash-chat.ts | Chef catalogue matching; historical internal filename |
| render/server.mjs | Production Node server |
| render/gmail.mjs | Gmail API transport |
| render/mail-runtime.mjs | Runtime mail configuration |
| render/postgres.mjs | PostgreSQL adapter and migrations |
| render/migrations | Idempotent schema upgrades |
| scripts/setup-retailers.ps1 | Interactive five-account hash generator |
| scripts/provision-retailers.mjs | Hash generation implementation |
| scripts/*test*.mjs | Automated regression checks |
| scripts/preview-ui.mjs | Local QA only, captures mail without sending |
| public/assets/logos | Original supplied JPG logos and cropped WebP derivatives |
| public/assets/banners | Illustrative generated marketing banners |
| public/assets/products/image-manifest.json | Product photo supply checklist |
| public/assets/sign-in-memes | Fifteen supplied memes used in the rotating sign-in email |
| PRODUCT-PHOTO-CHECKLIST.csv | Outlet photo checklist for every menu option |
| SIGN-IN-MEMES.md | Meme email sequence, retry behavior and optional order configuration |
| package.json / package-lock.json | Dependency lock, build/start/test commands |
| render.yaml | Render web-service blueprint |
| FILES.csv | Complete package file inventory |

Commands: `npm ci --include=dev`, `npm test`, `npm run build:render`, `npm run start:render`.

The source and local tests are complete. Live Gmail delivery still requires valid matching OAuth credentials and a deployed-service test. Every seed menu option has a labeled AI illustration. Retailers may replace it with an actual outlet photo.

