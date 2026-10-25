import assert from 'node:assert/strict';
import { menu,outlets } from '../lib/catalog.ts';
assert.equal(outlets.length,5);
assert.equal(new Set(menu.map(m=>m.id)).size,menu.length);
assert.ok(menu.every(m=>outlets.some(o=>o.id===m.outlet)&&m.price>0&&Number.isInteger(m.price)));
assert.equal(menu.find(m=>m.name==='Nikku Singh Veg')?.price,39);
assert.equal(menu.find(m=>m.name==='Original Masala Maggi')?.price,44);
assert.equal(menu.find(m=>m.name==='Aloo Roll')?.price,50);
const base=process.env.TEST_ORIGIN||'http://127.0.0.1:5173';
for(const email of ['test@gmail.com','test@bmu.edu.in.attacker.com','test@notbmu.edu.in','@bmu.edu.in']){
 const r=await fetch(base+'/api/campus/auth/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});assert.equal(r.status,400,email);
}
for(const path of ['orders','settings']){const r=await fetch(base+'/api/campus/'+path,{method:path==='orders'?'GET':'PATCH',headers:{'Content-Type':'application/json'},...(path==='settings'?{body:JSON.stringify({address:'Unauthorised edit'})}:{})});assert.equal(r.status,401,path);}
const origin=await fetch(base+'/api/campus/auth/send',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://wrong.example'},body:JSON.stringify({email:'test@bmu.edu.in'})});assert.equal(origin.status,403);
const r=await fetch(base+'/api/campus/auth/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'test@bmu.edu.in'})});assert.equal(r.status,503,'Unconfigured email must fail without claiming a code was sent');
console.log(`PASS: ${menu.length} menu variants, five outlets, photo price checks, email domain restrictions, authenticated data boundary, origin check and explicit email-setup failure.`);
