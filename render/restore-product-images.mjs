import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const pack=JSON.parse(gunzipSync(await readFile(resolve(root,'render/product-images.pack.json.gz'))));
if(pack.version!==1||!Array.isArray(pack.images))throw Error('Invalid product image pack');
let restored=0;
for(const image of pack.images){
 if(!/^assets\/illustrations\/(?:contact-sheets-2026|menu-2026)\/[a-f0-9]{16}\.webp$/.test(image.path))throw Error('Invalid image pack path');
 const bytes=Buffer.from(image.data,'base64');
 const hash=data=>createHash('sha256').update(data).digest('hex');
 if(hash(bytes)!==image.sha256)throw Error('Corrupt packed image: '+image.path);
 const file=resolve(root,'public',image.path);
 let existing;try{existing=await readFile(file)}catch{}
 if(existing&&hash(existing)===image.sha256)continue;
 await mkdir(dirname(file),{recursive:true});await writeFile(file,bytes);restored++;
}
console.log(`Product image pack: ${pack.images.length} verified, ${restored} restored.`);
