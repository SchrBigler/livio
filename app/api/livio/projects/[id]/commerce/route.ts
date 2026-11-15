import {z} from 'zod';
import {staff} from '../../../../../../server/auth';
import {database} from '../../../../../../server/db';
import {body,failure,json,sameOrigin} from '../../../../../../server/http';
import {snapshot,sendCommerce} from '../../../../../../server/commerce';
export async function POST(r:Request,{params}:{params:{id:string}}){try{
  sameOrigin(r);const actor=staff(r),id=z.uuid().parse(params.id),input=z.object({customerId:z.uuid(),revision:z.number().int().positive()}).parse(await body(r));
  const row=(await database().query('SELECT * FROM livio_projects WHERE id=$1',[id])).rows[0];if(!row)throw new Error('not_found');if(row.revision!==input.revision)throw new Error('stale');
  const result=await sendCommerce(snapshot(row,input.customerId,actor));
  await database().query('UPDATE livio_projects SET commerce_id=$2,commerce_snapshot_hash=$3 WHERE id=$1',[id,result.caseId,result.snapshotHash]);
  await database().query('INSERT INTO livio_audit(project_id,actor,action,snapshot) VALUES($1,$2,$3,$4)',[id,actor,'commerce-synced',JSON.stringify({...result,customerId:input.customerId,revision:row.revision})]);
  return json(result);
}catch(e){return failure(e);}}
