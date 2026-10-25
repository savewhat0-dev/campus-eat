# Campus Eats

A compact, responsive campus ordering site based on the supplied BMU documents, menu photographs and Campus Eats design reference.

## Current behaviour

Customers browse five outlets, build a single-outlet cart, choose pickup time and provide full name, enrollment number or faculty ID, and phone number. Customer sign-in is passwordless with a six-digit code delivered only to an @bmu.edu.in address. Dotted addresses such as firstname.lastname.25bb@bmu.edu.in are supported.

Authenticated customers can place an actual **pay-at-pickup order**. No online payment is taken. The server validates customer details, menu items and quantities, calculates the price and keeps retries idempotent. Orders start Pending. The assigned retailer accepts or denies each one. Denial reasons and acceptance updates appear in customer notifications and order history, with a five-second refresh. Accepted orders proceed through Preparing, Ready and Collected.

Retailer sign-in opens an isolated order desk for one assigned outlet. It contains incoming, in-progress, history and all-order filters, counts, search, student contact details, ordered items, pickup information, and Accept/Deny actions. Customer outlet browsing, other outlet selection and the customer navigation are not shown in retailer mode. Every retailer API request is scoped to the server-assigned outlet.

The sample preview remains separate from live records. It uses browser-local sample data and two clearly labelled example customers. Preview decisions never update real orders. The small sample-mode control replaces the former full-width preview strip.

## Run and test

Run `npm run dev` with Node 22.13 or newer. Run `node scripts/order-flow-test.mjs` for the deterministic API integration suite. It uses an in-memory SQLite database and a stub email transport: no real emails are sent. The test covers dotted email send/verify, wrong/expired/reused OTPs, all five retailer logins, required customer details, authoritative pricing, idempotency, outlet isolation, acceptance, denial reasons and customer-visible status updates. Run `node scripts/smoke-test.mjs` against an unconfigured local preview for additional route-boundary checks.

## Secure email configuration

The published site currently has no email credentials configured. Real delivery requires a verified Resend sender. Store the following as production runtime secrets in Sites, never in chat or source control:

- `RESEND_API_KEY`: a Resend API key authorised to send from the verified domain.
- `EMAIL_FROM`: for example `Campus Eats <orders@your-verified-domain>` using a sender on that verified domain.

After configuration, deploy to apply the environment revision. Test with an actual @bmu.edu.in recipient: request a code, verify it, check expiry and verify that replay is rejected. The UI only reports that a code was sent after the email service accepts it. Inbox delivery still needs a real recipient test.

Official transport reference: https://resend.com/docs/api-reference/emails/send-email

## Five retailer accounts

Set `RETAILER_ACCOUNTS` as a secret JSON array of exactly five objects with `username`, `outlet`, `salt` and `hash`. The outlet values must each occur once: `kathi`, `greenox`, `cafe`, `burger`, `dominos`. There is no public retailer registration. Use `node scripts/provision-retailers.mjs` with five plaintext account objects through stdin to generate PBKDF2 hash-only account records; do not persist plaintext passwords in this repository. Each password must be at least 12 characters. Retailer passwords and email delivery are independent configurations.

## Data and security

D1 stores hashed OTP challenges, hashed session tokens, customer profiles, outlet settings and orders. Session cookies are HttpOnly, SameSite Strict and Secure on HTTPS. OTPs expire after ten minutes, allow five attempts and have a sixty-second resend cooldown. Order decisions use conditional updates to avoid accepting and denying the same order concurrently. Each record retains the customer information supplied at checkout and immutable item/price snapshots. Real customer profiles are loaded from the authenticated server account and are not saved as preview profiles in browser storage.

The existing private Sites access gate remains separate from application OTP sign-in. Its audience has not changed.

## Images and design

Outlet banners and item thumbnails now display the original supplied Campus Eats mockup through precise SVG view windows with preserved aspect ratio. They are never stretched to fill an unrelated shape. Hero photography remains the existing generated image. The original reference image is encoded as `public/assets/reference.webp` (about 304 KB instead of 2,153 KB), and the hero as `public/assets/hero.webp` (about 288 KB instead of 2,393 KB). This is format compression with dimensions preserved. Top and bottom chrome use translucent backgrounds and subtle backdrop blur without hard dividing borders. Spacing and image heights are reduced throughout.

The original hero was made with the built-in image tool using the prompt: premium photorealistic paneer burger, fries and takeaway iced coffee on a forest-green backdrop, warm editorial food photography, no text or logos. No new generated imagery was required for this revision.

## Campus content to confirm

Menu names and photographed prices are transcribed, not guarantees of current retailer pricing. Confirm prices, any taxes, opening hours and the café/Maggi ownership arrangement with the campus outlets before operating live. Kathi Junction uses its photographed name; the visual reference spells Carter Junction. Maggi items remain grouped under Café Coffee Day to preserve the requested five retailer accounts. Pickup-time estimates are illustrative. There is no automatic security deduction, online payment, refund charge or AI forecast.

## Chef revision

Chef is a typing-only corner food finder grounded in this campus catalogue. It uses deterministic natural-language matching and a conservative food-domain gate, not an external language model or external website search. No AI API key is required. It recognises common English/Hindi food names, budget caps, vegetarian preferences, preparation-time limits and simple follow-up filters. Food results show actual catalogue items, outlet, price and estimated preparation time, with View menu and Add to bag controls. Disabled outlets and sold-out items are excluded. Missing food returns a no-match response. Off-topic messages are silently ignored and never appended to the conversation. Unverified opening hours, ingredient lists, nutrition and allergy suitability are not invented.

Run `node scripts/wash-chat-test.mjs` to check the scope, food retrieval and filters. Deployment of this revision was authorised in the following user request. Outlet banners now use clipped reference windows with aspect-ratio-preserving letterboxing; adjacent screenshot labels cannot bleed into a banner. Cards use equal rows and heart buttons use zero-padding flex centering. At the tested narrow viewport all five cards measured the same height, and heart SVG centre offsets were below 0.01 CSS pixels.

