import pg from 'pg';
import {readFile} from 'node:fs/promises';

// Only application-authored SQL reaches this adapter. Values stay parameterized.
export function postgresSql(sql){
 const ignore=/^INSERT OR IGNORE INTO /i.test(sql);
 let index=0;
 let result=sql.replace(/^INSERT OR IGNORE INTO /i,'INSERT INTO ');
 result=result.replace(/'(?:''|[^'])*'|\?/g,token=>token==='?'?'$'+(++index):token);
 return ignore?result.replace(/;?\s*$/,' ON CONFLICT DO NOTHING'):result;
}
export function postgresAdapter(pool){
 return {close:()=>pool.end(),prepare(sql){let values=[];const text=postgresSql(sql);return {bind(...args){values=args;return this;},async first(){return (await pool.query(text,values)).rows[0]||null;},async all(){return {results:(await pool.query(text,values)).rows};},async run(){const r=await pool.query(text,values);return {success:true,meta:{changes:r.rowCount}};}};}};
}
export async function migratePostgres(client){
 await client.query('BEGIN');
 try{
  // Serializes startup migrations when multiple processes are deployed together.
  await client.query('SELECT pg_advisory_xact_lock(724204251)');
  await client.query('CREATE TABLE IF NOT EXISTS campus_pg_migrations (name TEXT PRIMARY KEY)');
  const name='0001_initial';
  const prior=await client.query('SELECT name FROM campus_pg_migrations WHERE name=$1',[name]);
  if(!prior.rows.length){await client.query(await readFile(new URL('./migrations/0001_initial.sql',import.meta.url),'utf8'));await client.query('INSERT INTO campus_pg_migrations (name) VALUES ($1)',[name]);}
  const upgraded=await client.query('SELECT name FROM campus_pg_migrations WHERE name=$1',['0002_catalog']);
  if(!upgraded.rows.length){await client.query(await readFile(new URL('./migrations/0002_catalog.sql',import.meta.url),'utf8'));await client.query('INSERT INTO campus_pg_migrations (name) VALUES ($1)',['0002_catalog']);}
  await client.query('COMMIT');
 }catch(error){await client.query('ROLLBACK');throw error;}
}
export async function openPostgres(connectionString){
 if(!connectionString)throw Error('Set DATABASE_URL to your PostgreSQL connection URL');
 // Epoch milliseconds are safely below Number.MAX_SAFE_INTEGER.
 pg.types.setTypeParser(20,value=>{const n=Number(value);if(!Number.isSafeInteger(n))throw Error('Database integer exceeds safe range');return n;});
 const pool=new pg.Pool({connectionString,max:5,connectionTimeoutMillis:15000,idleTimeoutMillis:30000,statement_timeout:15000});
 pool.on('error',()=>console.error('PostgreSQL pool connection error'));
 let client;
 try{client=await pool.connect();await migratePostgres(client);}catch(error){client?.release();client=null;await pool.end();throw error;}finally{client?.release();}
 return postgresAdapter(pool);
}
