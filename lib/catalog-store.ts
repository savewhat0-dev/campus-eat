import {menu,outlets,type Item} from './catalog';
export async function initializeProducts(db:any){
 const existing=await db.prepare('SELECT id FROM products').all();const ids=new Set(existing.results.map((r:any)=>r.id));
 for(const item of menu)if(!ids.has(item.id))await db.prepare('INSERT INTO products (id,outlet,data,updated) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(item.id,item.outlet,JSON.stringify({...item,available:true}),Date.now()).run();
}
const seedOrder=new Map(menu.map((item,index)=>[item.id,index]));
export async function storedProducts(db:any):Promise<Item[]>{const r=await db.prepare('SELECT data FROM products ORDER BY updated,id').all();return r.results.map((row:any)=>JSON.parse(row.data)).sort((a:Item,b:Item)=>(seedOrder.get(a.id)??Number.MAX_SAFE_INTEGER)-(seedOrder.get(b.id)??Number.MAX_SAFE_INTEGER));}
export function validateProduct(input:any,outlet:string,id:string):Item{
 const name=String(input?.name||'').trim(),category=String(input?.category||'').trim(),description=String(input?.description||'').trim(),price=Number(input?.price),variant=String(input?.variant||'').trim(),image=String(input?.image||outlet);
 if(!outlets.some(o=>o.id===outlet)||name.length<2||name.length>120||!category||category.length>60||description.length>1200||variant.length>100)throw Error('Enter a product name, category and valid description.');
 if(!Number.isSafeInteger(price)||price<1||price>50000)throw Error('Enter a whole-rupee price between ₹1 and ₹50,000.');
 if(typeof input.veg!=='boolean'||typeof input.available!=='boolean')throw Error('Select the dietary classification and availability.');
 const ownPhoto=image.split('?')[0]==='/api/campus/product-images/'+id&&/^\/api\/campus\/product-images\/[a-zA-Z0-9-]+(?:\?v=\d+)?$/.test(image);
 if(image.length>850000||!(/^[a-z]+$/.test(image)||ownPhoto||/^\/assets\/[a-zA-Z0-9_./-]+$/.test(image)||/^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(image)))throw Error('Choose a JPEG, PNG or WebP image under 600 KB.');
 const prepMinutes=input.prepMinutes===''||input.prepMinutes==null?undefined:Number(input.prepMinutes);
 if(prepMinutes!==undefined&&(!Number.isInteger(prepMinutes)||prepMinutes<1||prepMinutes>180))throw Error('Preparation time must be between 1 and 180 minutes.');
 return {id,outlet,name,category,description,price,variant,veg:input.veg,available:input.available,image,prepMinutes,photoApproved:input.photoApproved===true&&(ownPhoto||image.startsWith('data:image/'))};
}
export async function saveProductPhoto(db:any,product:Item):Promise<Item>{
 if(!product.image.startsWith('data:image/'))return product;
 const match=product.image.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/)!;
 const signature=atob(match[2].slice(0,24));
 const valid=match[1]==='image/png'?signature.startsWith('\x89PNG\r\n\x1a\n'):match[1]==='image/jpeg'?signature.startsWith('\xff\xd8\xff'):signature.startsWith('RIFF')&&signature.slice(8,12)==='WEBP';
 if(!valid)throw Error('The uploaded file is not a valid JPEG, PNG or WebP image.');
 const now=Date.now();await db.prepare('INSERT INTO product_images (product_id,data,mime,updated) VALUES (?,?,?,?) ON CONFLICT(product_id) DO UPDATE SET data=excluded.data,mime=excluded.mime,updated=excluded.updated').bind(product.id,match[2],match[1],now).run();
 return {...product,image:'/api/campus/product-images/'+product.id+'?v='+now,photoApproved:true};
}
