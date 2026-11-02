import {generatedProductArt} from '../lib/generated-product-art.ts';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {menu} from '../lib/catalog.ts';
import {productIllustration} from '../lib/product-illustrations.ts';
import {build} from 'esbuild';
await build({entryPoints:['lib/product-images.ts','lib/catalog-store.ts'],bundle:true,platform:'node',format:'esm',outdir:'outputs/image-test'});
const {productImage}=await import('../outputs/image-test/product-images.js');
const {validateProduct}=await import('../outputs/image-test/catalog-store.js');
for(const p of menu){if(p.illustrationApproved===false)continue;const illustration=productIllustration(p);assert.ok(illustration,'Missing illustration: '+p.name);assert.ok(existsSync('public'+illustration.src),'Missing file: '+illustration.src);if(illustration.tile!==undefined)assert.ok(Number.isInteger(illustration.tile)&&illustration.tile>=0&&illustration.tile<16);}
const paneer=menu.find(p=>p.name==='Paneer Roll');
assert.equal(productIllustration(paneer).src,'/assets/illustrations/paneer-roll.webp');
assert.equal(productImage(paneer),undefined);
const uploaded={...paneer,image:'/api/campus/product-images/'+paneer.id+'?v=123',photoApproved:true};
assert.equal(productImage(uploaded),uploaded.image);
assert.equal(productImage({...paneer,image:'/assets/illustrations/paneer-roll.webp',photoApproved:true}),undefined);
assert.equal(validateProduct({...paneer,available:true,image:'/assets/illustrations/paneer-roll.webp',photoApproved:true},paneer.outlet,paneer.id).photoApproved,false);
assert.equal(validateProduct({...uploaded,available:true},paneer.outlet,paneer.id).photoApproved,true);
console.log(`PASS: existing approved mappings have valid artwork; new products use explicit placeholders; Paneer Roll mapping, actual-photo priority and approval boundaries verified.`);

assert.equal(new Set(Object.values(generatedProductArt)).size,Object.keys(generatedProductArt).length,'Distinct new product images must not share a generic asset');for(const [key,src] of Object.entries(generatedProductArt)){assert.ok(menu.some(p=>p.outlet+'|'+p.name===key),'Unmatched generated image: '+key);assert.ok(existsSync('public'+src),'Missing generated image: '+src);}
