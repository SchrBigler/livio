// Copy this additive receiver into Commerce Core src/server/livio.ts.
// It creates central cases/drafts only. All quotes, orders, documents and payments
// continue through Commerce Core's existing reviewed workflow.
import {createHash,createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
type DB={query(sql:string,args?:unknown[]):Promise<{rows:any[]}>};
type Store=DB&{transaction<T>(fn:(db:DB)=>Promise<T>):Promise<T>};
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
export const BridgeSnapshot=z.object({
  schema:z.literal('livio-commerce/1'),sourceId:z.uuid(),sourceRevision:z.number().int().positive(),
  customerId:z.uuid(),actorId:z.uuid(),title:z.string().min(1).max(160),
  customer:z.object({firstName:z.string(),lastName:z.string(),email:z.email(),phone:z.string(),billing:z.record(z.string(),z.string()),site:z.record(z.string(),z.string())}),
  elements:z.array(z.record(z.string(),z.unknown())).min(1).max(100),
  price:z.unknown().optional(),technicalHash:z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
export type CommerceSnapshot=z.infer<typeof BridgeSnapshot>;
export async function receiveLivio(r:Request,store:Store,secret=process.env.LIVIO_BRIDGE_SECRET){
  try{
    if(!secret||secret.length<32)return Response.json({error:'bridge_not_configured'},{status:503});
    const reader=r.body?.getReader(),parts:Uint8Array[]=[];let size=0;
    if(reader)while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>250000){await reader.cancel();return Response.json({error:'payload_too_large'},{status:413});}parts.push(value);}
    const raw=Buffer.concat(parts).toString('utf8'),time=r.headers.get('x-livio-time')||'',nonce=r.headers.get('x-livio-nonce')||'',signature=r.headers.get('x-livio-signature')||'';
    if(r.method!=='POST'||!/^\d{10}$/.test(time)||Math.abs(Date.now()/1000-Number(time))>300||!z.uuid().safeParse(nonce).success||!/^[a-f0-9]{64}$/.test(signature))return Response.json({error:'unauthorized'},{status:401});
    const expected=createHmac('sha256',secret).update([r.method,new URL(r.url).pathname,time,nonce,hash(raw)].join('\n')).digest();
    if(!timingSafeEqual(expected,Buffer.from(signature,'hex')))return Response.json({error:'unauthorized'},{status:401});
    const s=BridgeSnapshot.parse(JSON.parse(raw)),snapshotHash=hash(JSON.stringify(s));
    const result=await store.transaction(async db=>{
      const allowed=(await db.query("SELECT 1 FROM cc_staff_grants WHERE customer_id=$1 AND app_id='livio' AND role IN ('system_admin','management','sales','reviewer')",[s.actorId])).rows.length;
      if(!allowed)throw new Error('forbidden');
      if(!(await db.query("SELECT 1 FROM cc_applications WHERE id='livio' AND enabled=true")).rows.length)throw new Error('disabled');
      if(!(await db.query('SELECT id FROM cc_customers WHERE id=$1',[s.customerId])).rows.length)throw new Error('customer_mapping_required');
      // Use an explicitly mapped central account. Never create customers from an email guess.
      await db.query('SELECT pg_advisory_xact_lock(hashtext($1))',['livio:'+s.sourceId]);
      let row=(await db.query('SELECT * FROM cc_livio_intakes WHERE source_project_id=$1 FOR UPDATE',[s.sourceId])).rows[0];
      if(row&&row.customer_id!==s.customerId)throw new Error('customer_mapping_conflict');
      const known=(await db.query('SELECT snapshot_hash FROM cc_livio_snapshots WHERE source_project_id=$1 AND source_revision=$2',[s.sourceId,s.sourceRevision])).rows[0];
      if(known){if(known.snapshot_hash!==snapshotHash)throw new Error('revision_conflict');return {caseId:row.case_id,draftId:row.draft_id,snapshotHash,alreadyReceived:true};}
      if(row&&row.source_revision>s.sourceRevision)throw new Error('stale_source');
      if(!row){row={case_id:randomUUID(),draft_id:randomUUID()};
        await db.query('INSERT INTO cc_cases(id,customer_id,title) VALUES($1,$2,$3)',[row.case_id,s.customerId,s.title]);
        await db.query("INSERT INTO cc_drafts(id,app_id,customer_id,title,config) VALUES($1,'livio',$2,$3,$4)",[row.draft_id,s.customerId,s.title,JSON.stringify({livio:s})]);
        await db.query('INSERT INTO cc_livio_intakes(source_project_id,customer_id,case_id,draft_id,source_revision,snapshot_hash) VALUES($1,$2,$3,$4,$5,$6)',[s.sourceId,s.customerId,row.case_id,row.draft_id,s.sourceRevision,snapshotHash]);
      }else{
        await db.query('UPDATE cc_livio_intakes SET source_revision=$2,snapshot_hash=$3,updated_at=now() WHERE source_project_id=$1',[s.sourceId,s.sourceRevision,snapshotHash]);
        await db.query('UPDATE cc_drafts SET title=$2,config=$3,version=version+1,updated_at=now() WHERE id=$1',[row.draft_id,s.title,JSON.stringify({livio:s})]);
      }
      await db.query('INSERT INTO cc_livio_snapshots(source_project_id,source_revision,snapshot_hash,snapshot,actor_id) VALUES($1,$2,$3,$4,$5)',[s.sourceId,s.sourceRevision,snapshotHash,JSON.stringify(s),s.actorId]);
      await db.query("INSERT INTO cc_audit(id,actor_id,app_id,entity_id,action,evidence) VALUES($1,$2,'livio',$3,'livio.received',$4)",[randomUUID(),s.actorId,row.case_id,JSON.stringify({sourceId:s.sourceId,revision:s.sourceRevision,snapshotHash})]);
      return {caseId:row.case_id,draftId:row.draft_id,snapshotHash,alreadyReceived:false};
    });
    return Response.json(result,{headers:{'Cache-Control':'no-store'}});
  }catch(e){return Response.json({error:e instanceof z.ZodError?'invalid_snapshot':e instanceof Error?e.message:'bridge_failed'},{status:409,headers:{'Cache-Control':'no-store'}});}
}
