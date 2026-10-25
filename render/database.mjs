import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
export function openDatabase(filename){
 mkdirSync(dirname(resolve(filename)),{recursive:true});
 const sqlite=new DatabaseSync(filename);
 sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS campus_migrations (name TEXT PRIMARY KEY)');
 for(const name of readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort()){
  if(sqlite.prepare('SELECT name FROM campus_migrations WHERE name=?').get(name))continue;
  sqlite.exec('BEGIN IMMEDIATE');
  try{sqlite.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8').replaceAll('--> statement-breakpoint',''));sqlite.prepare('INSERT INTO campus_migrations VALUES (?)').run(name);sqlite.exec('COMMIT');}
  catch(error){sqlite.exec('ROLLBACK');throw error;}
 }
 return {close:()=>sqlite.close(),prepare(sql){let args=[];return {bind(...values){args=values;return this;},async first(){return sqlite.prepare(sql).get(...args)||null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){return sqlite.prepare(sql).run(...args);}};}};
}
