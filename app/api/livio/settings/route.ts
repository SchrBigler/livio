import {staff} from '../../../../server/auth';
import {database} from '../../../../server/db';
import {body,failure,json,sameOrigin} from '../../../../server/http';
import {PriceTable,Economics} from '../../../../lib/livio';
import {z} from 'zod';
export const dynamic='force-dynamic';
export async function GET(r:Request){try{staff(r);return json({items:(await database().query('SELECT * FROM livio_settings')).rows});}catch(e){return failure(e);}}
export async function PUT(r:Request){let c;try{
  sameOrigin(r);const actor=staff(r),input=z.object({key:z.enum(['supplier-table','economics']),value:z.unknown()}).parse(await body(r));
  const value=input.key==='supplier-table'?PriceTable.parse(input.value):Economics.parse(input.value);
  c=await database().connect();await c.query('BEGIN');
  if(input.key==='supplier-table'){
    const prior=(await c.query("SELECT value FROM livio_settings WHERE key='supplier-table'")).rows[0]?.value;
    if(prior&&prior.id===(value as any).id&&prior.version===(value as any).version)throw new Error('invalid_input');
    Object.assign(value,{approvedBy:actor,approvedAt:new Date().toISOString()});
  }
  await c.query('INSERT INTO livio_settings(key,value,updated_by) VALUES($1,$2,$3) ON CONFLICT(key) DO UPDATE SET value=$2,updated_by=$3,updated_at=now()',[input.key,JSON.stringify(value),actor]);
  await c.query('INSERT INTO livio_setting_history(key,value,actor) VALUES($1,$2,$3)',[input.key,JSON.stringify(value),actor]);
  await c.query('COMMIT');return json({ok:true});
}catch(e){if(c)await c.query('ROLLBACK');return failure(e);}finally{c?.release();}}
