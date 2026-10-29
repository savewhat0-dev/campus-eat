import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {openPostgres} from './postgres.mjs';
import {publicOrigin} from './config.mjs';
import {createGmailSender} from './gmail.mjs';
const origin=publicOrigin();

const db=await openPostgres(process.env.DATABASE_URL);
const googleMailConfig={clientId:process.env.GOOGLE_CLIENT_ID,clientSecret:process.env.GOOGLE_CLIENT_SECRET,refreshToken:process.env.GOOGLE_OAUTH_REFRESH_TOKEN};
const gmailConfigured=Object.values(googleMailConfig).every(value=>typeof value==='string'&&value.trim());
const gmailSender=gmailConfigured?createGmailSender(googleMailConfig):null;
globalThis.__campusRuntime={DB:db,...googleMailConfig,EMAIL_FROM:process.env.EMAIL_FROM,sendEmail:gmailSender,RETAILER_ACCOUNTS:process.env.RETAILER_ACCOUNTS};
const {handle}=await import('../dist-render/api.mjs');
const root=resolve('dist-render/public');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,origin);
  if(url.pathname==='/healthz'){await db.prepare('SELECT 1').first();res.writeHead(200,{'Content-Type':'application/json'});res.end('{"ok":true}');return;}
  if(url.pathname.startsWith('/api/campus/')){
   let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>65536){res.writeHead(413);res.end();return;}chunks.push(chunk);}
   const headers=new Headers();for(const [key,value]of Object.entries(req.headers)){if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(', '):value);}
   const response=await handle(new Request(new URL(url.pathname+url.search,origin),{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})}),url.pathname.slice('/api/campus/'.length).split('/'));
   res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const candidate=resolve(root,'.'+decodeURIComponent(url.pathname));
  if(candidate!==root&&!candidate.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  let file=candidate;try{if(!(await stat(file)).isFile())file=resolve(root,'index.html');}catch{if(extname(url.pathname)){res.writeHead(404);res.end();return;}file=resolve(root,'index.html');}
  const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':file.endsWith('index.html')?'no-cache':'public, max-age=3600'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(500,{'Content-Type':'application/json'});res.end('{"error":"Request could not be processed."}');}
});
server.requestTimeout=15000;server.headersTimeout=10000;
server.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Campus Eats server ready'));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(async()=>{await db.close();process.exit(0);}));
