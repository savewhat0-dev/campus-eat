import {menu} from '../lib/catalog.ts';
import {productIllustration} from '../lib/product-illustrations.ts';
import {writeFileSync,mkdirSync} from 'node:fs';
const rows=menu.map(item=>({productId:item.id,outlet:item.outlet,name:item.name,variant:item.variant||'',price:item.price,illustration:productIllustration(item),photoSource:'Retailer Menu Management upload; stored in database and shown instead of illustration',status:'AI_illustration_actual_outlet_photo_optional',displayPolicy:'AI illustration is labeled. An actual outlet photo uploaded through Menu Management takes priority.'}));
mkdirSync('public/assets/products',{recursive:true});
writeFileSync('public/assets/products/image-manifest.json',JSON.stringify(rows,null,2)+'\n');
writeFileSync('PRODUCT-PHOTO-CHECKLIST.csv','Product ID,Outlet,Product,Variant,Status\r\n'+rows.map(r=>[r.productId,r.outlet,r.name,r.variant,r.status].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n'));
console.log(JSON.stringify({productOptions:rows.length,distinctProducts:new Set(rows.map(r=>r.outlet+':'+r.name)).size,actualProductPhotos:0}));
