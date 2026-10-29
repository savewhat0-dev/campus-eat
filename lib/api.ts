import { env } from 'cloudflare:workers';
import { menu, outlets } from './catalog';
import { validUniversityEmail,validateCustomerDetails,nextOrderStatus } from './order-flow';
const enc=new TextEncoder();
const json=(data:unknown,status=200,headers:Record<string,string>={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
async function hash(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
function randomToken(){return crypto.randomUUID()+crypto.randomUUID();}
const emailValid=validUniversityEmail;
function retailerConfigurationReady(){try{const accounts=JSON.parse(env.RETAILER_ACCOUNTS||'null');const ids=outlets.map(o=>o.id);return Array.isArray(accounts)&&accounts.length===5&&new Set(accounts.map((a:any)=>String(a.username||'').trim().toLowerCase())).size===5&&new Set(accounts.map((a:any)=>a.outlet)).size===5&&ids.every(id=>accounts.filter((a:any)=>a.outlet===id).length===1)&&accounts.every((a:any)=>typeof a.username==='string'&&a.username.trim().length>0&&typeof a.salt==='string'&&/^[\da-f]{48}$/i.test(a.salt)&&typeof a.hash==='string'&&/^[\da-f]{64}$/i.test(a.hash));}catch{return false;}}
async function passwordHash(p:string,salt:string){const key=await crypto.subtle.importKey('raw',enc.encode(p),'PBKDF2',false,['deriveBits']);return Array.from(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations:100000},key,256))).map(x=>x.toString(16).padStart(2,'0')).join('');}
function equal(a:string,b:string){let d=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0;}
const db=()=>{if(!env.DB)throw Error('Database unavailable');return env.DB;};
function clientAddress(req:Request){return (req.headers.get('cf-connecting-ip')||req.headers.get('x-real-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown').trim().slice(0,200);}
async function takeRateLimit(key:string,limit:number,windowMs:number){const now=Date.now();await db().prepare("DELETE FROM challenges WHERE email LIKE 'rl:%' AND expires<=?").bind(now).run();const row=await db().prepare('INSERT INTO challenges (email,hash,expires,sent,attempts) VALUES (?,\'\',?,?,1) ON CONFLICT(email) DO UPDATE SET attempts=CASE WHEN challenges.expires<=? THEN 1 ELSE challenges.attempts+1 END,expires=CASE WHEN challenges.expires<=? THEN excluded.expires ELSE challenges.expires END,sent=excluded.sent RETURNING attempts').bind(key,now+windowMs,now,now,now).first<any>();return Number(row?.attempts||0)<=limit;}
function senderAddress(value:string){const match=value.match(/<([^<>]+)>/);return (match?.[1]||value).trim().toLowerCase();}
function emailConfigurationReady(){const from=String(env.EMAIL_FROM||'').trim(),address=senderAddress(from);return !!(from&&!/[\r\n]/.test(from)&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(address)&&env.GOOGLE_CLIENT_ID&&env.GOOGLE_CLIENT_SECRET&&env.GOOGLE_OAUTH_REFRESH_TOKEN&&typeof env.sendEmail==='function');}
async function sendSignInLink(to:string,link:string){
 if(typeof env.sendEmail!=='function')throw Object.assign(new Error('Gmail API is not configured'),{emailCode:'gmail_api_not_configured'});
 const body=`Sign in to Campus Eats by opening this one-time link:\n\n${link}\n\nThis link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.`;
 const html=`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#18372a"><h1>Sign in to Campus Eats</h1><p>Click below to verify your university email and sign in.</p><p><a href="${link}" style="display:inline-block;background:#176446;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Verify email and sign in</a></p><p>This one-time link expires in 15 minutes.</p><p>If the button does not work, copy this link into your browser:<br><a href="${link}">${link}</a></p><small>If you did not request this link, ignore this email.</small></div>`;
 await env.sendEmail({from:String(env.EMAIL_FROM).trim(),to,subject:'Your Campus Eats sign-in link',text:body,html});
}
async function session(req:Request){const token=req.headers.get('cookie')?.match(/(?:^|; )campus_session=([^;]+)/)?.[1];if(!token)return null;return await db().prepare('SELECT * FROM sessions WHERE token=? AND expires>?').bind(await hash(token),Date.now()).first<any>();}
async function getProfile(subject:string){const p=await db().prepare('SELECT details FROM profiles WHERE email=?').bind(subject).first<any>();return p?JSON.parse(p.details):null;}
async function makeSession(subject:string,role:string,outlet:string|null,req:Request){const token=randomToken();await db().prepare('INSERT INTO sessions (token,subject,role,outlet,expires) VALUES (?,?,?,?,?)').bind(await hash(token),subject,role,outlet,Date.now()+86400000).run();return json({user:{subject,role,outlet},profile:role==='customer'?await getProfile(subject):null},200,{'Set-Cookie':`campus_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${new URL(req.url).protocol==='https:'?'; Secure':''}`});}
function orderDto(o:any){return {...o,items:JSON.parse(o.items),customerDetails:JSON.parse(o.customer_details||'{}'),decisionNote:o.decision_note||'',paymentMethod:'Pay at pickup'};}
async function allSettings(){const r=await db().prepare('SELECT * FROM settings').all<any>();return Object.fromEntries(r.results.map((x:any)=>[x.outlet,JSON.parse(x.data)]));}
export async function handle(req:Request,path:string[]){try{
 const route=path.join('/');const method=req.method;
 if(method!=='GET'){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return json({error:'Invalid request origin.'},403);if(!req.headers.get('content-type')?.includes('application/json'))return json({error:'JSON required'},415);}
 if(route==='config')return json({emailReady:emailConfigurationReady(),retailReady:retailerConfigurationReady(),paymentsReady:false,payAtPickup:true});
 if(route==='outlets'&&method==='GET')return json({settings:await allSettings()});
 if(route==='me'&&method==='GET'){const s=await session(req);return json({user:s?{subject:s.subject,role:s.role,outlet:s.outlet}:null,profile:s?.role==='customer'?await getProfile(s.subject):null});}
 if(route==='auth/send'&&method==='POST'){
  const {email:raw}=await req.json() as any;const email=String(raw||'').toLowerCase().trim();if(!emailValid(email))return json({error:'Use your university email ending in @bmu.edu.in.'},400);
   if(!emailConfigurationReady())return json({error:'Email sign-in is not configured. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN and EMAIL_FROM to the Render service environment.'},503);
  const ipKey=`rl:send:ip:${await hash(clientAddress(req))}`;const emailKey=`rl:send:email:${await hash(email)}`;if(!await takeRateLimit(ipKey,30,3600000)||!await takeRateLimit(emailKey,6,3600000))return json({error:'Too many sign-in link requests. Try again later.'},429);
  const old=await db().prepare('SELECT sent FROM challenges WHERE email=?').bind(email).first<any>();if(old&&Date.now()-old.sent<60000)return json({error:'Please wait 60 seconds before requesting another link.'},429);
  const token=randomToken();
  await db().prepare('INSERT INTO challenges (email,hash,expires,sent,attempts) VALUES (?,?,?,?,0) ON CONFLICT(email) DO UPDATE SET hash=excluded.hash,expires=excluded.expires,sent=excluded.sent,attempts=0').bind(email,await hash(token),Date.now()+900000,Date.now()).run();
  const link=`${new URL(req.url).origin}/#verify=${encodeURIComponent(token)}`;
  try{await sendSignInLink(email,link);return json({sent:true});}
  catch(error:any){await db().prepare('DELETE FROM challenges WHERE email=?').bind(email).run();const code=typeof error?.code==='string'?error.code:typeof error?.emailCode==='string'?error.emailCode:error instanceof Error?error.name:'unknown';console.error('[auth/send] email delivery failed',{code,responseCode:Number.isInteger(error?.responseCode)?error.responseCode:undefined});return json({error:`Could not deliver the sign-in link (${code}). Check the Gmail API credentials, sender account and Google Cloud API status.`},502);}
 }
 if(route==='auth/verify-link'&&method==='POST'){
  const b=await req.json() as any;const token=String(b.token||'');if(!/^[\da-f-]{64,80}$/i.test(token))return json({error:'This sign-in link is invalid. Request a new one.'},400);
  if(!await takeRateLimit(`rl:verify:ip:${await hash(clientAddress(req))}`,20,3600000))return json({error:'Too many sign-in attempts. Try again later.'},429);
  const tokenHash=await hash(token);const row=await db().prepare('SELECT email FROM challenges WHERE hash=? AND expires>? AND email NOT LIKE ?').bind(tokenHash,Date.now(),'rl:%').first<any>();if(!row||!emailValid(row.email))return json({error:'This sign-in link has expired or was already used. Request a new one.'},400);
  const consumed=await db().prepare('DELETE FROM challenges WHERE hash=? AND expires>? RETURNING email').bind(tokenHash,Date.now()).first<any>();if(!consumed)return json({error:'This sign-in link has expired or was already used. Request a new one.'},400);return makeSession(consumed.email,'customer',null,req);
 }
 if(route==='auth/retailer'&&method==='POST'){
  if(!retailerConfigurationReady())return json({error:'Retailer sign-in is not configured correctly. Recreate the five hashed accounts and save the full JSON in Render RETAILER_ACCOUNTS.'},503);
  const b=await req.json() as any;const username=String(b.username||'').trim();const password=String(b.password||'');if(username.length>100||password.length>256)return json({error:'Invalid credentials.'},400);
  const key='retailer:'+username;const rate=await db().prepare('SELECT * FROM challenges WHERE email=?').bind(key).first<any>();if(rate&&rate.expires>Date.now()&&rate.attempts>=5)return json({error:'Too many attempts. Try again in 15 minutes.'},429);
  await db().prepare('INSERT INTO challenges (email,hash,expires,sent,attempts) VALUES (?, ?, ?, ?,1) ON CONFLICT(email) DO UPDATE SET attempts=CASE WHEN challenges.expires<? THEN 1 ELSE challenges.attempts+1 END,expires=CASE WHEN challenges.expires<? THEN excluded.expires ELSE challenges.expires END').bind(key,'',Date.now()+900000,Date.now(),Date.now(),Date.now()).run();
  const accounts=JSON.parse(env.RETAILER_ACCOUNTS);
  const a=accounts.find((a:any)=>String(a.username).trim().toLowerCase()===username.toLowerCase());const digest=await passwordHash(password,a?.salt||'unknown-account');if(!a||!equal(digest,a.hash))return json({error:'Username or password is incorrect.'},401);
  await db().prepare('DELETE FROM challenges WHERE email=?').bind(key).run();return makeSession(username,'retailer',a.outlet,req);
 }
 if(route==='auth/logout'&&method==='POST'){const s=await session(req);if(s)await db().prepare('DELETE FROM sessions WHERE token=?').bind(s.token).run();return json({ok:true},200,{'Set-Cookie':'campus_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});}
 const s=await session(req);if(!s)return json({error:'Sign in to continue.'},401);
 if(route==='profile'&&method==='POST'&&s.role==='customer'){let details;try{details=validateCustomerDetails(await req.json());}catch(e:any){return json({error:e.message},400);}await db().prepare('INSERT INTO profiles (email,details) VALUES (?,?) ON CONFLICT(email) DO UPDATE SET details=excluded.details').bind(s.subject,JSON.stringify(details)).run();return json({profile:details});}
 if(route==='orders'&&method==='GET'){const r=await db().prepare(`SELECT * FROM orders WHERE ${s.role==='retailer'?'outlet':'customer'}=? ORDER BY created DESC LIMIT 200`).bind(s.role==='retailer'?s.outlet:s.subject).all<any>();return json({orders:r.results.map(orderDto)});}
 if(route==='orders'&&method==='POST'){
  if(s.role!=='customer')return json({error:'Customer account required.'},403);
  const b=await req.json() as any;let details;try{details=validateCustomerDetails(b.customerDetails);}catch(e:any){return json({error:e.message},400);}
  if(typeof b.requestId!=='string'||!/^[\da-f-]{36}$/i.test(b.requestId))return json({error:'A valid order request ID is required.'},400);
  const prior=await db().prepare('SELECT * FROM orders WHERE request_id=? AND customer=?').bind(b.requestId,s.subject).first<any>();if(prior)return json({order:orderDto(prior)});
  const entries=Object.entries(b.items||{});if(!entries.length||entries.length>40)return json({error:'Add between 1 and 40 menu items.'},400);
  const items:any[]=[];let outlet='',total=0;
  for(const [id,qty]of entries){const item=menu.find(m=>m.id===id);if(!item||!Number.isInteger(qty)||Number(qty)<1||Number(qty)>20)return json({error:'Your cart contains an invalid item or quantity.'},400);if(outlet&&item.outlet!==outlet)return json({error:'Place one outlet’s order at a time.'},400);outlet=item.outlet;items.push({id,qty,name:item.name,price:item.price});total+=item.price*Number(qty);}
  const all=await allSettings();const store=all[outlet];if(store?.open===false||items.some(i=>store?.unavailable?.includes(i.id)))return json({error:'An item is unavailable. Please update your cart.'},409);
  const pickupAt=Number(b.pickupAt);if(!Number.isFinite(pickupAt)||pickupAt<Date.now()+5*60000||pickupAt>Date.now()+24*3600000)return json({error:'Choose a pickup time between 5 minutes and 24 hours from now.'},400);
  const pickup=new Date(pickupAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});const id='CE-'+crypto.randomUUID().slice(0,8).toUpperCase();const note=String(b.note||'').slice(0,300);const now=Date.now();
  await db().prepare('INSERT OR IGNORE INTO orders (id,customer,outlet,items,total,status,pickup,note,created,customer_details,decision_note,request_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,s.subject,outlet,JSON.stringify(items),total,'Pending',pickup,note,now,JSON.stringify({...details,email:s.subject}),'',b.requestId).run();
  await db().prepare('INSERT INTO profiles (email,details) VALUES (?,?) ON CONFLICT(email) DO UPDATE SET details=excluded.details').bind(s.subject,JSON.stringify(details)).run();
  const saved=await db().prepare('SELECT * FROM orders WHERE request_id=? AND customer=?').bind(b.requestId,s.subject).first<any>();if(!saved)return json({error:'Could not create this order. Please retry.'},409);return json({order:orderDto(saved)},201);
 }
 if(route.startsWith('orders/')&&method==='PATCH'){
  const b=await req.json() as any;const id=path[1];const o=await db().prepare('SELECT * FROM orders WHERE id=?').bind(id).first<any>();if(!o||((s.role==='retailer'?o.outlet:o.customer)!==(s.role==='retailer'?s.outlet:s.subject)))return json({error:'Order not found.'},404);
  const next=nextOrderStatus(s.role,o.status,b.status);if(!next)return json({error:'This order has changed or that action is no longer available.'},409);
  const reason=next==='Denied'?String(b.reason||'The outlet is unable to fulfil this order.').trim().slice(0,250):'';if(next==='Denied'&&!reason)return json({error:'Please give a short reason so the customer knows why.'},400);
  const result=await db().prepare('UPDATE orders SET status=?,decision_note=? WHERE id=? AND status=? RETURNING *').bind(next,reason,id,o.status).first<any>();if(!result)return json({error:'The order was already updated. Please refresh.'},409);return json({order:orderDto(result)});
 }
 if(route==='settings'&&s.role==='retailer'&&method==='PATCH'){
  const b=await req.json() as any;const address=String(b.address||'').trim();const hours=String(b.hours||'').trim();if(!address||address.length>300||hours.length>80)return json({error:'Enter a store address (up to 300 characters) and valid hours.'},400);
  const unavailable=Array.isArray(b.unavailable)?b.unavailable.filter((id:string)=>menu.some(m=>m.id===id&&m.outlet===s.outlet)):[];
  const data={address,hours,open:b.open===true,unavailable};await db().prepare('INSERT INTO settings (outlet,data) VALUES (?,?) ON CONFLICT(outlet) DO UPDATE SET data=excluded.data').bind(s.outlet,JSON.stringify(data)).run();return json({ok:true,settings:data});
 }
 return json({error:'Not found.'},404);
}catch{return json({error:'The service is temporarily unavailable. Please try again shortly.'},503);}}
