import {createHmac,randomUUID} from 'node:crypto';
import {z} from 'zod';
import {hash} from './auth';
import {Project} from '../lib/livio';
import {BridgeSnapshot} from '../integration/commerce-core/receiver';
export function snapshot(row:any,customerId:string,actorId:string){
  const p=Project.parse(row.data),c=p.project.customer;
  return BridgeSnapshot.parse({schema:'livio-commerce/1',sourceId:p.id,sourceRevision:row.revision,customerId,actorId,title:(c.projectName||`${c.lastName} – Insektenschutz`).slice(0,160),
    customer:{firstName:c.firstName,lastName:c.lastName,email:c.email,phone:c.phone,billing:{name:c.firstName+' '+c.lastName,street:p.project.address,postalCode:p.project.zip,city:p.project.city,country:'CH'},site:p.project.objectAddress?{street:p.project.objectAddress.address,postalCode:p.project.objectAddress.zip,city:p.project.objectAddress.city,country:'CH'}:{street:p.project.address,postalCode:p.project.zip,city:p.project.city,country:'CH'}},
    elements:p.elements.map(({photos,...element})=>({...element,photos:photos.map(photo=>({name:photo.name,bytes:photo.size,sha256:hash(photo.url),sourceProjectId:p.id,sourceElementId:element.id}))})),
    ...(row.calculation&&row.calculation.sourceHash===hash(JSON.stringify(p))?{price:row.calculation}:{}),technicalHash:hash(JSON.stringify(p))});
}
export async function sendCommerce(payload:ReturnType<typeof snapshot>){
  if(process.env.LIVIO_COMMERCE_ENABLED!=='true'||!process.env.LIVIO_COMMERCE_URL||!process.env.LIVIO_BRIDGE_SECRET||process.env.LIVIO_BRIDGE_SECRET.length<32)throw new Error('commerce_unavailable');
  const target=new URL('/api/integrations/livio/intakes',process.env.LIVIO_COMMERCE_URL);if(target.protocol!=='https:'&&target.hostname!=='localhost')throw new Error('commerce_unavailable');
  const raw=JSON.stringify(payload),time=String(Math.floor(Date.now()/1000)),nonce=randomUUID();
  const signature=createHmac('sha256',process.env.LIVIO_BRIDGE_SECRET).update(['POST',target.pathname,time,nonce,hash(raw)].join('\n')).digest('hex');
  const r=await fetch(target,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json','x-livio-time':time,'x-livio-nonce':nonce,'x-livio-signature':signature},body:raw,signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw new Error('commerce_unavailable');
  return z.object({caseId:z.uuid(),draftId:z.uuid(),snapshotHash:z.string().regex(/^[a-f0-9]{64}$/),alreadyReceived:z.boolean()}).parse(await r.json());
}
