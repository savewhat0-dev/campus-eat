import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {build} from 'esbuild';
import {menu,outlets} from '../lib/catalog.ts';
await build({entryPoints:['lib/catalog-store.ts'],bundle:true,platform:'node',format:'esm',outfile:'outputs/menu-import-test.mjs'});
const {initializeProducts,storedProducts}=await import('../outputs/menu-import-test.mjs');
const sql=new DatabaseSync(':memory:');sql.exec('CREATE TABLE products(id TEXT PRIMARY KEY,outlet TEXT,data TEXT,updated INTEGER)');
const DB={prepare(q){let args=[];return {bind(...a){args=a;return this},async all(){return {results:sql.prepare(q).all(...args)}},async run(){return sql.prepare(q).run(...args)}}}};
const imported=menu.filter(p=>p.sourceRevision);assert.equal(imported.length,397);assert.equal(new Set(menu.map(p=>p.id)).size,menu.length);
for(const p of imported){assert.ok(outlets.some(o=>o.id===p.outlet));if(p.priceReview){assert.equal(p.available,false);assert.equal(p.price,null)}else assert.ok(Number.isSafeInteger(p.price)&&p.price>0)}
assert.equal(imported.filter(p=>p.outlet==='maggi').length,19);assert.equal(imported.filter(p=>p.outlet==='cafe'&&/Maggi/.test(p.name)).length,0);
assert.ok(imported.some(p=>p.outlet==='greenox'&&p.name==='Mushroom Cheese Omelette'&&p.price===119));
assert.ok(imported.some(p=>p.name==='Margherita'&&p.variant==='Large'&&p.priceReview));
const old=imported.find(p=>p.id.startsWith('m'));sql.prepare('INSERT INTO products VALUES (?,?,?,?)').run(old.id,old.outlet,JSON.stringify({...old,sourceRevision:undefined,price:999,photoApproved:true,image:'/api/campus/product-images/'+old.id}),0);
await initializeProducts(DB);let rows=await storedProducts(DB);let updated=rows.find(p=>p.id===old.id);assert.equal(updated.price,old.price);assert.equal(updated.photoApproved,true);
sql.prepare('UPDATE products SET data=? WHERE id=?').run(JSON.stringify({...updated,price:321,available:true,priceReview:false}),old.id);
await initializeProducts(DB);assert.equal((await storedProducts(DB)).find(p=>p.id===old.id).price,321);
console.log('PASS: 397 imported variants; positive confirmed prices; disputed prices disabled; Maggi/CCD separation; stable IDs; photo preservation; retailer changes survive restart.');
