// Local QA only. Never used by start:render. Mail is captured, not sent.
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createServer} from 'node:http';
const sql=new DatabaseSync(':memory:');
for(const file of ['drizzle/0000_thin_earthquake.sql','drizzle/0001_thick_saracen.sql','render/migrations/0002_catalog.sql','render/migrations/0003_signin_meme_rotation.sql'])sql.exec(readFileSync(file,'utf8').replaceAll('--> statement-breakpoint',''));
const DB={prepare(text){let args=[];return {bind(...values){args=values;return this;},async first(){return sql.prepare(text).get(...args)||null;},async all(){return {results:sql.prepare(text).all(...args)};},async run(){return sql.prepare(text).run(...args);}};}};
let inbox='';
globalThis.__campusRuntime={DB,GOOGLE_CLIENT_ID:'local-qa',GOOGLE_CLIENT_SECRET:'local-qa',GOOGLE_OAUTH_REFRESH_TOKEN:'local-qa',EMAIL_FROM:'Campus Eats <qa@example.com>',sendEmail:async message=>{inbox=message.text.match(/http[^\s]+/)[0];},RETAILER_ACCOUNTS:''};
const {handle,initializeCatalog}=await import('../dist-render/api.mjs');await initializeCatalog();
const root=resolve('dist-render/public'),origin='http://127.0.0.1:4173';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
createServer(async(req,res)=>{try{const url=new URL(req.url,origin);if(url.pathname==='/__preview/inbox'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({link:inbox}));return;}
if(url.pathname.startsWith('/api/campus/')){const chunks=[];for await(const c of req)chunks.push(c);const response=await handle(new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})}),url.pathname.slice(12).split('/'));res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;}
let path=resolve(root,'.'+decodeURIComponent(url.pathname));if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}try{if(!(await stat(path)).isFile())path=resolve(root,'index.html');}catch{if(extname(path)){res.writeHead(404);res.end();return;}path=resolve(root,'index.html');}res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(await readFile(path));}catch{res.writeHead(500);res.end('Local QA server error');}}).listen(4173,'127.0.0.1',()=>console.log('Local QA preview: '+origin+' · no real email or payments'));
