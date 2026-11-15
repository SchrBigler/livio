import {z} from 'zod';
import {staff,hash} from '../../../../../../server/auth';
import {database} from '../../../../../../server/db';
import {failure,json} from '../../../../../../server/http';
import {Project,orderReady} from '../../../../../../lib/livio';
export const dynamic='force-dynamic';
export async function GET(r:Request,{params}:{params:{id:string}}){try{
  const actor=staff(r),id=z.uuid().parse(params.id),row=(await database().query('SELECT data,revision FROM livio_projects WHERE id=$1',[id])).rows[0];if(!row)throw new Error('not_found');
  const p=Project.parse(row.data);if(!p.elements.length||!p.elements.every(orderReady))throw new Error('not_ready');
  const pack={schema:'livio-supplier-basis/1',projectId:id,project:p.project,revision:row.revision,elements:p.elements.map(e=>({id:e.id,room:e.area,label:e.location,notes:e.note,quantity:e.count,productCode:e.internalCode,mesh:e.mesh,color:e.color,orderMeasurement:e.orderMeasurement,technicalDetails:e.technicalDetails,photos:e.photos})),createdAt:new Date().toISOString(),createdBy:actor,mode:'controlled-manual-submission'};
  await database().query('INSERT INTO livio_audit(project_id,actor,action,snapshot) VALUES($1,$2,$3,$4)',[id,actor,'supplier-basis-exported',JSON.stringify({hash:hash(JSON.stringify(pack)),revision:row.revision})]);
  const response=json(pack);response.headers.set('Content-Disposition','attachment; filename="BIGLER_LIVIO_Bestellgrundlage.json"');return response;
}catch(e){return failure(e);}}
