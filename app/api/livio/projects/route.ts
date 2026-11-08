import {z} from 'zod';
import {intake,Project} from '../../../../lib/livio';
import {database} from '../../../../server/db';
import {hash,owner,staff} from '../../../../server/auth';
import {body,failure,json,sameOrigin} from '../../../../server/http';
export const dynamic='force-dynamic';
export async function POST(r:Request){let client;try{
  sameOrigin(r);const ownerHash=owner(r),p=intake(await body(r));
  client=await database().connect();await client.query('BEGIN');
  const added=await client.query('INSERT INTO livio_projects(id,owner_hash,data) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING id',[p.id,ownerHash,JSON.stringify(p)]);
  const row=(await client.query('SELECT id,owner_hash,status,revision FROM livio_projects WHERE id=$1',[p.id])).rows[0];
  if(row.owner_hash!==ownerHash)throw new Error('not_found');
  if(!added.rows.length){const prior=(await client.query("SELECT snapshot FROM livio_audit WHERE project_id=$1 AND action='submitted' ORDER BY id LIMIT 1",[p.id])).rows[0]?.snapshot;const digest=(x:unknown)=>{const value=Project.parse(x);return hash(JSON.stringify({...value,project:{...value.project,created:undefined}}));};if(prior&&digest(prior)!==digest(p))throw new Error('already_received_changed');}
  if(added.rows.length)await client.query('INSERT INTO livio_audit(project_id,actor,action,snapshot) VALUES($1,$2,$3,$4)',[p.id,'customer','submitted',JSON.stringify(p)]);
  await client.query('COMMIT');return json({id:row.id,status:row.status,revision:row.revision,alreadyReceived:!added.rows.length},201);
}catch(e){if(client)await client.query('ROLLBACK');return failure(e);}finally{client?.release();}}
export async function GET(r:Request){try{
  staff(r);const items=(await database().query("SELECT id,revision,status,updated_at,data->'project'->'customer' AS customer,jsonb_array_length(data->'elements') AS elements FROM livio_projects ORDER BY updated_at DESC LIMIT 200")).rows;
  return json({items});
}catch(e){return failure(e);}}
