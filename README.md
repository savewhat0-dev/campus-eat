# BMU Eats Expo app — Windows and Android

This is an Expo SDK 58 React Native project based on the official blank TypeScript template. It uses a WebView to run your hosted BMU Eats website and existing backend. It includes safe areas, an app icon, persistent website cookies, Android Back/exit handling, offline recovery, and email-link return. Internet access is required.

For installed-app updates, follow **EAS-UPDATE.md** first. It contains the one-time updater APK setup and the PowerShell publishing command. Prepare the matching EAS environment before building.

## 1. Deploy the accompanying website update

Apply the website patch to your existing repository root and deploy the latest commit on Render. Keep the current database and environment values.

- Build: `npm ci --include=dev && npm run build:render`
- Start: `npm run start:render`

No new Render environment variable is required. Confirm that the website and its `/terms.html` and `/privacy.html` pages open on your phone. The app needs this update for app sign-in emails and native Back handling.

## 2. Extract the app separately

Extract the Expo ZIP into `C:\Users\risha\BMU-Eats-App`, outside OneDrive. `App.tsx` and the app's `package.json` should be directly inside that folder. Do not replace the website's package.json with this one.

Install a supported Node.js LTS version and Expo Go on your Android phone. This project was checked with Node 24. Open PowerShell:

```powershell
cd C:\Users\risha\BMU-Eats-App
npm.cmd ci
Copy-Item .env.example .env
notepad .env
```

In `.env`, set your exact live HTTPS website origin:

```text
EXPO_PUBLIC_SITE_URL=https://campus-eat-v6je.onrender.com
```

Use your working URL if it differs. Do not include a path. This URL is public configuration. Never put Gmail secrets, refresh tokens, database URLs, retailer hashes or Groq keys in the app or in an `EXPO_PUBLIC_` variable. All server secrets stay in Render.

## 3. Open the development app on your phone

```powershell
npx.cmd expo start --clear
```

Keep phone and laptop on the same network. Open Expo Go and scan the terminal QR. This is Expo's development QR. The hosted BMU Eats website must already be reachable from the phone.

If LAN discovery fails, try `npx.cmd expo start --tunnel`. If Expo Go reports an SDK mismatch, update Expo Go or use a compatible Expo development build. Windows can develop Android and use EAS cloud builds; no Android Studio is required for the phone/Expo Go path.

## 4. Sign in and return from your email

Use your own `@bmu.edu.in` mailbox. For an installed standalone APK, the app-originated sign-in email includes **Open in BMU Eats app**.

If your mail client blocks the app link, or you are using Expo Go:

1. Copy the normal **Verify email and sign in** button link from the email.
2. Return to BMU Eats and tap **Open sign-in link** in its top bar.
3. Paste the link and choose **Verify and continue**.

The app accepts only its configured HTTPS origin or its own `bmueats://verify` callback, and validates the token format. The backend still performs real one-time verification. Do not first consume the link in another browser. Request a fresh link if it has expired or was already used.

Retailers use their existing assigned username/password. No additional Google OAuth client or Google redirect URI is needed for this app; Gmail remains a server-side sender.

## 5. Build an installable Android APK

Create/sign in to your own Expo account. Keep its password private.

Before the first published build, edit `app.json`: choose permanent unique identifiers you control for `android.package` and `ios.bundleIdentifier`. They currently read `com.bmueats.campus`.

Edit `eas.json` and set `EXPO_PUBLIC_SITE_URL` under **both** `preview.env` and `production.env` to the same HTTPS URL as `.env`.

```powershell
npx.cmd eas-cli@latest login
npx.cmd eas-cli@latest init
npx.cmd eas-cli@latest build:configure
npx.cmd eas-cli@latest build --platform android --profile preview
```

Select your account and project when prompted. `eas init` creates the real project ID; none was invented in this source. If prompted, EAS can manage the Android keystore. Retain signing access for later updates. Download the APK from Expo's build details page when it completes and install it on your own Android phone. The preview profile explicitly requests an APK for direct installation.

## 6. Store distribution later

```powershell
npx.cmd eas-cli@latest build --platform android --profile production
```

This creates the store-oriented Android build. Play Store publication needs your developer account, signing, store listing, data-safety declarations and review. A WebView app is not automatically approved. iOS distribution needs Apple signing and its own build/review; no iOS binary has been built here.

Use your hosted `/privacy.html` URL as the privacy policy URL after confirming its operator/contact details and actual data practices. Obtain permission for university/outlet marks before public release. The policies identify a project for the BMU community without claiming unconfirmed university endorsement. Confirm the contact address is monitored. Users retain rights to their personal information.

Verified Android App Links / iOS Universal Links are preferable before a broad release. The included custom scheme and paste flow support initial testing. Website updates appear in the WebView after deployment; compatible JavaScript changes, including the website URL, can be published through EAS Update after the updater APK is installed. Native code/configuration changes still need a new app build.

## 7. Checks before sharing

```powershell
npm.cmd run typecheck
npm.cmd run test:links
```

On a real phone, check first sign-in, email return/paste, retailer login, logout, restart, keyboard dismissal, Back through product/cart/menu, retailer exit confirmation, offline Retry, dietary filters, image replacement, ordering and tracking. Live email and intentional real orders need your own working deployment.

## What was verified here

- Official Expo SDK 58 dependency set installed with a package lock.
- TypeScript and Android Metro/Hermes JavaScript export passed.
- App URL/token validation tests passed.
- App email callback and single-use verification tested with mock email.
- Website build, auth/order tests and 265 static asset checks passed.
- No signed APK/AAB/IPA was built, no phone/emulator execution was verified, and no Render deployment or store submission was performed.
- Installation reported 11 moderate advisories in the Expo dependency tree. The website has a separate reported audit backlog. No breaking dependency upgrades were forced as part of this task.

## Official references

- https://docs.expo.dev/versions/latest/sdk/webview/
- https://docs.expo.dev/more/create-expo/
- https://docs.expo.dev/build/setup/
- https://docs.expo.dev/build-reference/apk/
- https://docs.expo.dev/linking/into-your-app/
- https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md

The template's 0BSD license applies to its starter material. Expo, React Native and dependencies have their own licenses. BMU and outlet marks remain their owners' property.
