# Product images update — 30 October 2026

Every existing menu option now has representative AI artwork. Paneer Roll has a dedicated generated image. Related recipes and sizes share illustrations where appropriate; these are not claims about a specific outlet's ingredients, portion or presentation.

Customer menus, product details and Chef AI use the same image resolver. Illustrations carry an “AI illustration” label. A retailer-uploaded product photo takes priority and carries an “Outlet photo” label. Product details explain this difference.

To replace an image: Retailer sign in → Menu Management → Edit the product → “Replace illustration with actual outlet photo” → select the real JPEG, PNG or WebP (under 600 KB) → Save product. This updates that product option everywhere it appears. Each size/variant is editable separately. Photos are saved to the database and survive Render restarts. Retailers can access only their own outlet's products.

No email, AI or image-hosting API key is needed to display these files. They ship inside public/assets/illustrations. Existing Gmail authentication settings stay unchanged. Upload the extracted source package to the connected GitHub repository and deploy the latest commit on Render using the existing build/start commands.

Artwork provenance: built-in image-generation tool. New prompts requested a single square photorealistic food catalogue illustration of the named food, neutral ceramic tableware, warm ivory tabletop, soft natural light, centered framing and generous margins; no text, logos, packaging, people or extra sides. New subjects include Paneer Roll, aloo/egg/mushroom/soya/mutton rolls, paneer/chicken/mutton/egg/vegetable/soya curries, two lentil dishes, roti, paratha, rice bowls, coffee, almond milk, milk, milkshake, corn, batata vada, cheese coins, chicken bites, potato wedges, upma, bun muska, vanilla ice cream, waffle cone, dip, red/white pasta, cheesy fries, falafel salad/wrap, vegetable sub/wrap, chicken sandwich and chicken taco. Existing generated food artwork supplies additional representative salads, pizzas, burgers, noodles, momos, drinks and sides. The five brand logos remain the user's supplied originals.

Files: lib/product-illustrations.ts contains the mapping; components/menu-food.tsx selects actual photos before AI artwork; scripts/product-images-test.mjs checks complete coverage, file existence and photo priority. PRODUCT-PHOTO-CHECKLIST.csv lists the full catalogue and tracks the optional replacement workflow. Real hosted email delivery is not covered by these image tests.
