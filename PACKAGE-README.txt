CUMULATIVE CHANGED FILES
Extract into the existing project root, preserving paths and overwriting matching files. Includes all new or modified files compared with BMU-Eats-FULL-Fixed-2026-11-03.zip, including the latest image update. PACKAGE-FILES.csv lists the full current source snapshot for reference. Use the FULL ZIP for a clean installation.

Read IMAGE-PACK-FIX.txt first. Upload package.json at repository root and all three included render files inside render/. Product images restore automatically from the .gz pack before Vite builds. No environment change required. Includes latest menu, campus hero, Chef, retailer and payment UI changes, and 203 cropped product images. Retailer photos keep priority.

Render: push to the connected GitHub repository, then deploy the latest commit. Build: npm ci && npm run build:render. Start: npm run start:render. Preserve existing Render environment values and PostgreSQL database. Credentials, local databases, node_modules and generated builds are excluded.

See UPDATE-INSTRUCTIONS.txt for runtime configuration. Groq needs a server API key. Payment QR remains demo until the outlet payee is verified. Conflicting menu prices need retailer confirmation. Nothing was deployed while packaging.