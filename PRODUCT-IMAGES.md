# Product images update — 2 November 2026

The 22 supplied food contact sheets are now cropped into 203 separate product images and mapped to exact catalog products. The crops omit the sheet numbers, product names and outlet captions. Domino’s, GreeNox, Café Coffee Day Xpress, Burger Singh and Maggi Point items use the matching dish shown in the supplied sheets. Existing artwork fills products not shown there. Paneer Roll keeps its dedicated generated image. These are AI illustrations, not claims about a specific outlet's ingredients, portion or presentation.

Customer menus, product details and Chef AI use the same image resolver. Illustrations carry an “AI illustration” label. A retailer-uploaded product photo takes priority and carries an “Outlet photo” label. Product details explain this difference.

To replace an image: Retailer sign in → Menu Management → Edit the product → “Replace illustration with actual outlet photo” → select the real JPEG, PNG or WebP (under 600 KB) → Save product. This updates that product option everywhere it appears. Each size/variant is editable separately. Photos are saved to the database and survive Render restarts. Retailers can access only their own outlet's products.

No email, AI or image-hosting API key is needed to display these files. They ship inside public/assets/illustrations. Existing Gmail authentication settings stay unchanged. Upload the extracted source package to the connected GitHub repository and deploy the latest commit on Render using the existing build/start commands.

Image processing: the supplied contact sheets were cropped locally into one image per mapped dish; no new image-generation job was used for these 203 crops. Earlier generated illustrations continue to cover additional catalogue items. The five brand logos remain separate from product imagery.

Files: lib/contact-sheet-product-art.ts maps the supplied crops; lib/generated-product-art.ts retains earlier generated artwork; components/menu-food.tsx selects an approved actual outlet photo before the matching illustration. docs/CONTACT-SHEET-IMAGE-MAP.json records the sheet and tile for every crop. Retailers may replace any illustration with the actual outlet photo for that product. PRODUCT-PHOTO-CHECKLIST.csv lists the catalogue and tracks that optional replacement workflow.
