# BMU Eats: publish installed-app updates from PowerShell

The app is linked to Expo owner `bmu-eats`, project `6461c492-2711-44e4-83ea-345622255080`. Use the Expo account that has access to this project. Keep this app in `C:\Users\risha\BMU-Eats-App`, separate from the website.

## One-time setup: build an APK with the updater

The updater is a native dependency. An older APK without it cannot receive this feature remotely. Install a new APK once.

1. Apply the update ZIP inside `C:\Users\risha\BMU-Eats-App`, replacing matching files. Keep your `.env` and `.git`. Or extract the full app ZIP into that folder. Do not upload the app's package.json to your Render website repository.
2. Open PowerShell and run each line separately:

```powershell
cd C:\Users\risha\BMU-Eats-App
npm.cmd ci
npx.cmd eas-cli@latest login
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\risha\BMU-Eats-App\scripts\publish-update.ps1" -Channel preview -PrepareOnly
npx.cmd eas-cli@latest build --platform android --profile preview
```

The prepare command checks the app and sets only the public `EXPO_PUBLIC_SITE_URL` in the project's preview environment. It reads your existing `.env`, or defaults to `https://campus-eat-v6je.onrender.com`. To use another working HTTPS origin, add `-SiteUrl "https://your-working-domain.com"`. Do not enter any secrets here.

3. Open the APK download link provided by EAS on the phone and install it. Keep the same Android signing key when rebuilding; do not reset it. A cloud build may queue and is subject to Expo account limits. Expo Go does not test installed-app OTA delivery.

## Publish later changes

Make the app changes in this same folder. If package-lock.json changed, run `npm.cmd ci` in the app folder first. Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\risha\BMU-Eats-App\scripts\publish-update.ps1" -Channel preview -Message "Describe the app changes here"
```

This command can be run from any PowerShell folder. The script finds its app folder automatically, checks TypeScript and sign-in link handling, sets the public URL in the matching EAS environment, and publishes the Android update. If a check fails, publication stops.

For local checks only, with no remote writes:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\risha\BMU-Eats-App\scripts\publish-update.ps1" -Channel preview -ValidateOnly
```

## What users see

- A compatible installed release checks for updates on cold launch and downloads in the background. It uses the downloaded update on the following full close/reopen. It does not force a reload during ordering.
- A phone needs internet and an installed build on the matching channel and runtime. Preview updates reach preview builds; production updates reach production builds.
- The fingerprint runtime policy prevents updates from being delivered to incompatible native builds. SDK/native library, permission, icon or other native configuration changes require a new APK. If a published update does not reach an older build after native changes, rebuild instead of bypassing compatibility.
- This is a WebView app. Website menus, design and server changes still deploy through GitHub/Render and appear from the hosted website; they do not require EAS Update. Do not put backend secrets in the app.
- Uploading files alone does not publish an app update. Run the publishing command after reviewing the changes. No scheduled publishing job is installed.

## Production

When ready for a store release, prepare the production environment using `-Channel production -PrepareOnly`, then build with `--profile production`. That Android build is an AAB for Google Play, not a directly installable preview APK. Publish future production updates using `-Channel production`. Test on preview before publishing to production.

## Verify after the first APK

Install the new preview APK, then publish a small visible app change (for example, app-bar wording). Open the installed app online, allow the download, fully close it and reopen. Confirm the change and check sign-in, Back handling and ordering. Repeat on another phone. This device-level test has not been performed here; no cloud build or OTA update was published during preparation.

Official references: https://docs.expo.dev/eas-update/getting-started/ and https://docs.expo.dev/eas-update/download-updates/
