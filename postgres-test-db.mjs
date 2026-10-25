import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {postgresAdapter,postgresSql,migratePostgres} from '../render/postgres.mjs';
export async function testDatabase(){
 const engine=new PGlite();
 const client={async query(sql,args=[]){if(sql.includes('pg_advisory_xact_lock'))return {rows:[]};if(sql.includes('CREATE TABLE challenges')){await engine.exec(sql);return {rows:[]};}return engine.query(sql,args);},end:()=>engine.close()};
 await migratePostgres(client);await migratePostgres(client);
 assert.equal((await client.query('SELECT COUNT(*)::int AS n FROM campus_pg_migrations')).rows[0].n,1);
 assert.equal(postgresSql("SELECT '?' AS literal, ? AS value, 'it''s?' AS quoted"),"SELECT '?' AS literal, $1 AS value, 'it''s?' AS quoted");
 const db=postgresAdapter(client);
 return {db,sqlite:{prepare(sql){let stmt=db.prepare(sql);return {get:async(...args)=>stmt.bind(...args).first(),run:async(...args)=>stmt.bind(...args).run()};},close:()=>engine.close()}};
}
