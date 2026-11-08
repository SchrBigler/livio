import {z} from 'zod';
import {database} from '../../../../../server/db';
import {hash,owner,staff} from '../../../../../server/auth';
import {body,failure,json,sameOrigin} from '../../../../../server/http';
import {Project,Measurement,PriceTable,Economics,calculate,orderReady} from '../../../../../lib/livio';
export const dynamic='force-dynamic';
type Context={params:{id:string}};
export async function GET(r:Request,{params}:Context){try{
  const id=z.uuid().parse(params.id);
  // Customer responses contain only deliberately public progress information.
  if(r.headers.has('authorization')){
    const row=(await database().query('SELECT id,status,public_message,updated_at FROM livio_projects WHERE id=$1 AND owner_hash=$2',[id,owner(r)])).rows[0];
    if(!row)throw new Error('not_found');return json(row);
  }
  staff(r);const row=(await database().query('SELECT * FROM livio_projects WHERE id=$1',[id])).rows[0];if(!row)throw new Error('not_found');
  delete row.owner_hash;const audit=(await database().query('SELECT actor,action,created_at FROM livio_audit WHERE project_id=$1 ORDER BY id',[id])).rows;
  return json({...row,audit});
}catch(e){return failure(e);}}
const Update=z.object({revision:z.number().int().positive(),action:z.enum(['correct','check','release','calculate','status']),elementId:z.string().optional(),
  data:Project.optional(),measurement:Measurement.optional(),note:z.string().max(4000).default(''),
  status:z.enum(['received','review','needs-info','site-measure','ready-for-quote']).optional(),publicMessage:z.string().max(4000).default('')});
export async function PATCH(r:Request,{params}:Context){let client;try{
  sameOrigin(r);const actor=staff(r),id=z.uuid().parse(params.id),input=Update.parse(await body(r));
  client=await database().connect();await client.query('BEGIN');
  const row=(await client.query('SELECT * FROM livio_projects WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!row)throw new Error('not_found');if(row.revision!==input.revision)throw new Error('stale');
  let p=Project.parse(row.data),calculation=row.calculation,status=row.status,publicMessage=row.public_message;
  const e=p.elements.find(x=>x.id===input.elementId),now=new Date().toISOString();
  if(input.action==='correct'){
    if(!input.data||input.data.id!==p.id)throw new Error('invalid_input');
    const next=input.data;
    next.elements=next.elements.map(item=>{
      const prior=p.elements.find(x=>x.id===item.id);
      // Never trust approval metadata from a form or imported project.
      const clean={...item,technicalStatus:prior?.technicalStatus||'unreviewed',orderMeasurement:prior?.orderMeasurement,reviewNote:prior?.reviewNote||''};
      const unchanged=prior&&JSON.stringify({...clean,technicalStatus:null,orderMeasurement:null,reviewNote:null,price:null})===JSON.stringify({...prior,technicalStatus:null,orderMeasurement:null,reviewNote:null,price:null});
      return unchanged?clean:{...clean,technicalStatus:'review' as const,orderMeasurement:undefined,reviewNote:input.note};
    });p=next;calculation=null;status='review';
  }
  if(input.action==='check'){
    if(!e||!input.measurement||!input.note.trim())throw new Error('invalid_input');
    e.orderMeasurement=Measurement.parse({...input.measurement,kind:'order',source:'on-site',status:'checked',checkedBy:actor,checkedAt:now,releasedBy:undefined,releasedAt:undefined});
    e.technicalStatus='review';e.reviewNote=input.note;calculation=null;
  }
  if(input.action==='release'){
    if(!e||!e.orderMeasurement||e.orderMeasurement.status!=='checked'||e.internalCode==='Prüfen'||input.note.trim().length<3)throw new Error('not_ready');
    e.orderMeasurement=Measurement.parse({...e.orderMeasurement,status:'released',releasedBy:actor,releasedAt:now});
    e.technicalStatus='released';e.reviewNote=input.note;
  }
  if(input.action==='calculate'){
    const settings=(await client.query("SELECT key,value FROM livio_settings WHERE key IN ('supplier-table','economics')")).rows;
    const table=PriceTable.parse(settings.find(x=>x.key==='supplier-table')?.value),basis=Economics.parse(settings.find(x=>x.key==='economics')?.value);
    calculation=calculate(p.elements,table,basis);if(!calculation)throw new Error('not_ready');
    // Retain the exact tables and economics so subsequent updates cannot change this result.
    calculation={...calculation,tableSnapshot:table,basisSnapshot:basis,sourceHash:hash(JSON.stringify(p))};
  }
  if(input.action==='status'){
    if(!input.status)throw new Error('invalid_input');
    if(input.status==='ready-for-quote'&&(!calculation||calculation.sourceHash!==hash(JSON.stringify(p))))throw new Error('not_ready');
    status=input.status;publicMessage=input.publicMessage;
  }
  await client.query('UPDATE livio_projects SET data=$2,calculation=$3,status=$4,public_message=$5,revision=revision+1,updated_at=now() WHERE id=$1',[id,JSON.stringify(p),calculation?JSON.stringify(calculation):null,status,publicMessage]);
  await client.query('INSERT INTO livio_audit(project_id,actor,action,snapshot) VALUES($1,$2,$3,$4)',[id,actor,input.action,JSON.stringify({data:p,note:input.note,status,calculation})]);
  await client.query('COMMIT');return json({ok:true,revision:row.revision+1,allReleased:p.elements.every(orderReady)});
}catch(e){if(client)await client.query('ROLLBACK');return failure(e);}finally{client?.release();}}
