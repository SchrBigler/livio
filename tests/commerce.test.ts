import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHmac} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {receiveLivio,type CommerceSnapshot} from '../integration/commerce-core/receiver';
import {hash} from '../server/auth';
const secret='test-bridge-secret-not-for-production-0123456789';
function request(s:CommerceSnapshot,invalid=false){const raw=JSON.stringify(s),time=String(Math.floor(Date.now()/1000)),nonce=randomUUID(),path='/api/integrations/livio/intakes';const signature=createHmac('sha256',secret).update(['POST',path,time,nonce,hash(raw)].join('\n')).digest('hex');return new Request('https://commerce.example.org'+path,{method:'POST',headers:{'Content-Type':'application/json','x-livio-time':time,'x-livio-nonce':nonce,'x-livio-signature':invalid?'0'.repeat(64):signature},body:raw});}
test('signed Commerce import reuses mapped customers, central cases and drafts; rejects replay conflicts',async()=>{
  const db=new PGlite();
  // Minimal existing Commerce tables plus the exact additive migration. Full Core
  // document workflow is outside this receiver test and is explicitly not claimed.
  await db.exec(`CREATE TABLE cc_applications(id text PRIMARY KEY,name text,enabled boolean);
    CREATE TABLE cc_product_series(id text PRIMARY KEY,app_id text,name text);
    CREATE TABLE cc_customers(id uuid PRIMARY KEY);
    CREATE TABLE cc_staff_grants(customer_id uuid,app_id text,role text);
    CREATE TABLE cc_cases(id uuid PRIMARY KEY,customer_id uuid,title text);
    CREATE TABLE cc_drafts(id uuid PRIMARY KEY,app_id text,customer_id uuid,title text,config jsonb,version integer DEFAULT 1,updated_at timestamptz DEFAULT now());
    CREATE TABLE cc_audit(id uuid,actor_id uuid,app_id text,entity_id text,action text,evidence jsonb);
    CREATE FUNCTION cc_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'immutable'; END $$;`);
  await db.exec(await readFile('integration/commerce-core/004_livio.sql','utf8'));
  const customerId=randomUUID(),actorId=randomUUID();
  await db.query('INSERT INTO cc_customers VALUES($1),($2)',[customerId,actorId]);
  await db.query("INSERT INTO cc_staff_grants VALUES($1,'livio','reviewer')",[actorId]);
  await db.exec("UPDATE cc_applications SET enabled=true WHERE id='livio'");
  const store={query:(sql:string,args?:unknown[])=>db.query<any>(sql,args),transaction:async<T>(fn:(q:any)=>Promise<T>)=>{await db.exec('BEGIN');try{const result=await fn({query:(sql:string,args?:unknown[])=>db.query(sql,args)});await db.exec('COMMIT');return result;}catch(e){await db.exec('ROLLBACK');throw e;}}};
  const s:CommerceSnapshot={schema:'livio-commerce/1',sourceId:randomUUID(),sourceRevision:1,customerId,actorId,title:'LIVIO Test',customer:{firstName:'Test',lastName:'Kunde',email:'test@example.org',phone:'0310000000',billing:{street:'Test 1',country:'CH'},site:{street:'Test 1',country:'CH'}},elements:[{id:randomUUID(),product:'Spannrahmen'}],technicalHash:'a'.repeat(64)};
  assert.equal((await receiveLivio(request(s,true),store,secret)).status,401);
  const first=await receiveLivio(request(s),store,secret);assert.equal(first.status,200,JSON.stringify(await first.clone().json()));const a=await first.json();
  const b=await (await receiveLivio(request(s),store,secret)).json();assert.equal(a.caseId,b.caseId);assert.equal(b.alreadyReceived,true);
  assert.equal((await db.query('SELECT * FROM cc_customers')).rows.length,2);
  assert.equal((await db.query('SELECT * FROM cc_cases')).rows.length,1);
  assert.equal((await db.query('SELECT * FROM cc_drafts')).rows.length,1);
  assert.equal((await receiveLivio(request({...s,title:'conflicting retry'}),store,secret)).status,409);
  assert.equal((await receiveLivio(request({...s,sourceRevision:2,title:'new source version'}),store,secret)).status,200);
  const retry=await receiveLivio(request(s),store,secret);assert.equal(retry.status,200);
  assert.equal((await db.query<any>('SELECT source_revision FROM cc_livio_intakes')).rows[0].source_revision,2);
  assert.equal((await receiveLivio(request({...s,customerId:randomUUID(),sourceRevision:3}),store,secret)).status,409);
  await db.close();
});
