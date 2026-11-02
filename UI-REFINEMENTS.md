# UI, search and notification update — 30 October 2026

This complete source package includes the existing product illustrations, outlet photo replacement and database meme rotation, plus these changes:

- Scrollable outer sign-in overlay on mobile and short screens. Panels grow with their content; form buttons remain reachable. Student/Faculty and Retailer share readable labels, input text, stronger errors and consistent green controls.
- Full-height backgrounds, subtle background glows, rounded cards and controls, light fade/slide transitions and reduced-motion support.
- Shared ranked product matcher: partial and reordered words, one-character spelling mistakes and BBQ/barbecue normalization, using only menu names/categories and outlet descriptions. All three search inputs offer keyboard navigation. Selection opens the real product options without adding to cart.
- Chef no longer has the large divider/banner; chat history scrolls independently of the input.
- Notification inbox for signed-in customers and retailers, populated from saved orders and order events. Acceptance and Ready have distinct messages; pickup is requested only for Ready. Dismissals are stored per account. In-app notifications remain available without browser permission. Browser notification permission is requested only by the user's Enable control.
- The email meme is a linked inline image, with no file attachment or app-created download button. Gmail's own image save/download controls belong to Gmail and cannot be reliably disabled by email HTML.

Render: replace repository source with these files, keep existing secrets, commit and deploy the latest commit. Migration 0004_notifications runs automatically on startup. No new required environment variables. Existing Gmail API credentials still must be valid for actual mail delivery.

Verified: production build; existing regression suite; SQLite and embedded PostgreSQL notification routing/dismissal and Ready-only collection message tests; spelling/reordered/BBQ search checks. Browser checks at 390×640 and 1280×800 covered sign-in contrast, overflow and role switch; reaching retailer preview from the form bottom; keyboard selection of a typo search result. Live Render deployment, hosted network behavior and actual Gmail rendering/delivery were not performed.
