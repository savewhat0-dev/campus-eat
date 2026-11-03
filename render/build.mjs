import {build} from 'esbuild';
import {resolve} from 'node:path';
import {stat} from 'node:fs/promises';
import {contactSheetProductArt} from '../lib/contact-sheet-product-art.ts';
import {generatedProductArt} from '../lib/generated-product-art.ts';
import {menu} from '../lib/catalog.ts';
import {productIllustration} from '../lib/product-illustrations.ts';
const required=new Set([...Object.values(contactSheetProductArt),...Object.values(generatedProductArt),...menu.map(p=>p.illustrationApproved===false?undefined:productIllustration(p)?.src).filter(Boolean),'/assets/campus/bmu-campus.jpg','/assets/campus/bmu-logo.jpg']);
const missing=[];
for(const asset of required){for(const directory of ['public','dist-render/public']){try{if(!(await stat(resolve(directory,'.'+asset))).size)missing.push(directory+asset);}catch{missing.push(directory+asset);}}}
if(missing.length)throw Error('Required product/campus images missing. Upload the complete public/assets folder preserving subfolders, then rebuild. Missing: '+missing.join(', '));
console.log('Verified '+required.size+' required image assets in source and production output.');
await build({entryPoints:['lib/api.ts'],bundle:true,platform:'node',format:'esm',outfile:'dist-render/api.mjs',alias:{'cloudflare:workers':resolve('render/env.mjs')}});
