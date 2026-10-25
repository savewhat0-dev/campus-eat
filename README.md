# Campus Eats upload guide

Upload every file and folder in this directory to the ROOT of your GitHub repository. Preserve folders; do not flatten files into one directory. Upload the extracted contents, not the ZIP. package.json and render.yaml must appear immediately on the repository homepage.

This folder contains only the standalone Render application. The Chef assistant is included. No account credentials or database records are included. The current render.yaml uses a PAID Starter instance and persistent disk. A free external database is not connected yet.

| File / folder | Purpose |
| --- | --- |
| index.html | Browser entry page |
| package.json | Dependencies and build/start/test commands |
| package-lock.json | Exact dependency versions; required for npm ci |
| vite.render.config.mjs | Frontend production build configuration |
| postcss.config.mjs | CSS processing |
| render.yaml | Render hosting, environment and persistent disk configuration |
| app/page.tsx | Customer home, menus, login, cart and orders |
| app/globals.css | All website layout and styling |
| components/retailer-workspace.tsx | Retailer orders and accept/deny controls |
| components/wash-chat.tsx | Chef assistant interface; historical filename retained |
| lib/api.ts | Server authentication, OTP and order APIs |
| lib/catalog.ts | Outlet catalogue and menu prices |
| lib/order-flow.ts | Validation and allowed order status changes |
| lib/wash-chat.ts | Chef food matching logic |
| render/client.tsx | Starts React in the browser |
| render/build.mjs | Builds the standalone backend |
| render/env.mjs | Connects environment variables to the backend |
| render/database.mjs | SQLite adapter and automatic migrations |
| render/server.mjs | Node HTTP server, API and static file hosting |
| drizzle/*.sql | Required database table migrations |
| public/favicon.svg | Browser tab icon |
| public/assets/* | Images used by the website and supplied menu references |
| scripts/provision-retailers.mjs | Generates the five retailer password hashes |
| scripts/order-flow-test.mjs | Authentication and order lifecycle tests |
| scripts/wash-chat-test.mjs | Chef food search tests |
| DEPLOY-RENDER.md | Hosting and secure environment setup instructions |
| .gitignore | Prevents local dependencies, secrets and database files being committed |
| FILES.csv | Exact upload inventory with byte sizes |
| README.md | This guide |

GitHub upload: repository > Add file > Upload files. Drag all the files AND folders from this directory into the upload area, then Commit changes. If you already uploaded part of the old package, use a new empty repository for this clean package so old conflicting configuration is not retained.
