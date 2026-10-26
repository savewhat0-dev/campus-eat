import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { pbkdf2Sync,createHash } from 'node:crypto';
import { build } from 'esbuild';
import { validUniversityEmail,nextOrderStatus,validateCustomerDetails } from '../lib/order-flow.ts';
import { menu } from '../lib/catalog.ts';
let sqlite,database;
if(process.env.TEST_POSTGRES==='1')({sqlite,db:database}=await (await import('./postgres-test-db.mjs')).testDatabase());
else{
 sqlite=new DatabaseSync(':memory:');
 for(const f of ['0000_thin_earthquake.sql','0001_thick_saracen.sql'])sqlite.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8').replaceAll('--> statement-breakpoint',''));
 database={prepare(sql){let args=[];return {bind(...values){args=values;return this;},async first(){return sqlite.prepare(sql).get(...args)||null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){return sqlite.prepare(sql).run(...args);}};}};
}
const ids=['kathi','greenox','cafe','burger','dominos'];const password='Test-only-password-2026';
const accounts=ids.map(outlet=>{const salt=createHash('sha256').update('test-salt-'+outlet).digest('hex').slice(0,48);return {username:'test-'+outlet,outlet,salt,hash:pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex')};});
globalThis.__testEnv={DB:database,SMTP_HOST:'smtp.test.invalid',SMTP_PORT:587,SMTP_USER:'test@bmu.edu.in',SMTP_PASS:'test-smtp-secret',EMAIL_FROM:'Campus Eats <test@bmu.edu.in>',sendEmail:async message=>delivered.push({to:[message.to],text:message.text}),RETAILER_ACCOUNTS:JSON.stringify(accounts)};
await build({entryPoints:['lib/api.ts'],bundle:true,platform:'node',format:'esm',outfile:'outputs/api-under-test.mjs',plugins:[{name:'cloudflare-env-stub',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const env=globalThis.__testEnv;'}));}}]});
let delivered=[];
const {handle}=await import('../outputs/api-under-test.mjs');
async function call(path,method='GET',body,cookie='',origin='https://campus.test'){const req=new Request('https://campus.test/api/campus/'+path,{method,headers:{'Content-Type':'application/json',Origin:origin,...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});const res=await handle(req,path.split('/'));const data=await res.json();return {status:res.status,data,cookie:res.headers.get('set-cookie')?.split(';')[0]};}
try{
 for(const email of ['rishabh.rishabh.kaktan.25bb@bmu.edu.in','Rishabh.Kaktan.25BB@bmu.edu.in'])assert.ok(validUniversityEmail(email));
 for(const email of ['person@gmail.com','person@bmu.edu.in.attacker.com','a..b@bmu.edu.in'])assert.ok(!validUniversityEmail(email));
 assert.throws(()=>validateCustomerDetails({name:'A',enrollment:'',phone:'123'}));
 assert.equal(nextOrderStatus('retailer','Pending','Accepted'),'Accepted');assert.equal(nextOrderStatus('retailer','Pending','Denied'),'Denied');assert.equal(nextOrderStatus('customer','Pending','Accepted'),null);
 const dotted='rishabh.rishabh.kaktan.25bb@bmu.edu.in';
 assert.equal((await call('auth/send','POST',{email:'person@gmail.com'})).status,400);
 let r=await call('auth/send','POST',{email:dotted});assert.equal(r.status,200);assert.equal(delivered.length,1);assert.deepEqual(delivered[0].to,[dotted]);const link=delivered[0].text.match(/https:\/\/campus\.test\/#verify=[\da-f-]{64,80}/i)[0];const token=new URLSearchParams(new URL(link).hash.slice(1)).get('verify');
 const challenge=await sqlite.prepare('SELECT hash FROM challenges WHERE email=?').get(dotted);assert.equal(challenge.hash,createHash('sha256').update(token).digest('hex'));assert.ok(!challenge.hash.includes(token));
 assert.equal((await call('auth/send','POST',{email:dotted})).status,429);
 assert.equal((await call('auth/verify-link','POST',{token:token+'a'})).status,400);
 r=await call('auth/verify-link','POST',{token});assert.equal(r.status,200);const customer=r.cookie;assert.ok(customer);assert.equal((await call('auth/verify-link','POST',{token})).status,400);
 assert.equal((await call('orders')).status,401);assert.equal((await call('orders','POST',{},customer,'https://other.example')).status,403);
 assert.equal((await call('auth/retailer','POST',{username:'test-kathi',password:'wrong'})).status,401);
 r=await call('auth/retailer','POST',{username:'test-kathi',password});assert.equal(r.status,200);const retailer=r.cookie;
 r=await call('auth/retailer','POST',{username:'test-greenox',password});assert.equal(r.status,200);const otherRetailer=r.cookie;
 for(const id of ids)assert.equal((await call('auth/retailer','POST',{username:'test-'+id,password})).status,200);
 const item=menu.find(m=>m.outlet==='kathi');const details={name:'Test Student',enrollment:'25-BBA-TEST',phone:'9000000001'};
 const payload={items:{[item.id]:2},pickupAt:Date.now()+20*60000,customerDetails:details,requestId:crypto.randomUUID(),total:1,note:'Less spicy'};
 assert.equal((await call('orders','POST',{...payload,customerDetails:{}},customer)).status,400);
 r=await call('orders','POST',payload,customer);assert.equal(r.status,201);const order=r.data.order;assert.equal(order.total,item.price*2);assert.equal(order.status,'Pending');assert.deepEqual(order.customerDetails,{...details,email:dotted});assert.equal((await call('orders','POST',payload,customer)).data.order.id,order.id);
 r=await call('orders','GET',undefined,retailer);assert.equal(r.data.orders.length,1);assert.equal(r.data.orders[0].customerDetails.enrollment,details.enrollment);assert.equal((await call('orders','GET',undefined,otherRetailer)).data.orders.length,0);
 assert.equal((await call('orders/'+order.id,'PATCH',{status:'Accepted'},otherRetailer)).status,404);assert.equal((await call('orders/'+order.id,'PATCH',{status:'Accepted'},customer)).status,409);
 assert.equal((await call('orders/'+order.id,'PATCH',{status:'Accepted'},retailer)).status,200);assert.equal((await call('orders','GET',undefined,customer)).data.orders[0].status,'Accepted');assert.equal((await call('orders/'+order.id,'PATCH',{status:'Denied'},retailer)).status,409);
 for(const status of ['Preparing','Ready','Collected'])assert.equal((await call('orders/'+order.id,'PATCH',{status},retailer)).status,200);
 const second=(await call('orders','POST',{...payload,requestId:crypto.randomUUID()},customer)).data.order;
 assert.equal((await call('orders/'+second.id,'PATCH',{status:'Denied',reason:'Paneer rolls sold out'},retailer)).status,200);
 const customerOrders=(await call('orders','GET',undefined,customer)).data.orders;assert.equal(customerOrders.find(o=>o.id===second.id).decisionNote,'Paneer rolls sold out');assert.equal(customerOrders.find(o=>o.id===second.id).status,'Denied');
 assert.equal((await call('orders','GET',undefined,otherRetailer)).data.orders.length,0);
 // Expired sign-in links cannot be used.
 await call('auth/send','POST',{email:'expiry.test@bmu.edu.in'});const expLink=delivered.at(-1).text.match(/https:\/\/campus\.test\/#verify=[\da-f-]{64,80}/i)[0];const expToken=new URLSearchParams(new URL(expLink).hash.slice(1)).get('verify');await sqlite.prepare('UPDATE challenges SET expires=0 WHERE email=?').run('expiry.test@bmu.edu.in');assert.equal((await call('auth/verify-link','POST',{token:expToken})).status,400);
 delete globalThis.__testEnv.SMTP_PASS;assert.equal((await call('auth/send','POST',{email:'missing.sender@bmu.edu.in'})).status,503);
 console.log('PASS: dotted email magic-link sign-in using a stub SMTP transport, invalid/expired/reused link rejection, five retailer logins, customer details, server-priced idempotent orders, outlet isolation, accept/deny reasons, customer-visible updates, and complete pickup lifecycle. No real emails sent.');
}finally{await sqlite.close();}
