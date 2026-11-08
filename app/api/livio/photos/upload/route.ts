import {handleUpload,type HandleUploadBody} from '@vercel/blob/client';
import {z} from 'zod';
import {database} from '../../../../../server/db';
import {hash} from '../../../../../server/auth';
import {body,failure,json,sameOrigin} from '../../../../../server/http';
const Upload=z.object({id:z.uuid(),projectId:z.uuid(),ownerToken:z.string().regex(/^[a-f0-9]{64}$/),name:z.string().min(1).max(200),size:z.number().int().positive().max(10_000_000),contentType:z.enum(['image/jpeg','image/png','image/webp'])});
export async function POST(r:Request){try{
  const input=await body(r) as HandleUploadBody;
  const response=await handleUpload({request:r,body:input,
    onBeforeGenerateToken:async(pathname,payload)=>{
      sameOrigin(r);const p=Upload.parse(JSON.parse(payload||'null')),ownerHash=hash(p.ownerToken);
      if(pathname!==`livio/${p.projectId}/${p.id}`)throw new Error('forbidden');
      const previous=(await database().query('SELECT owner_hash FROM livio_projects WHERE id=$1',[p.projectId])).rows[0];
      if(previous&&previous.owner_hash!==ownerHash)throw new Error('forbidden');
      const count=(await database().query('SELECT count(*)::int AS n FROM livio_photos WHERE project_id=$1',[p.projectId])).rows[0]?.n||0;
      if(count>=600)throw new Error('invalid_input');
      await database().query('INSERT INTO livio_photos(id,project_id,owner_hash,pathname,original_name,size_bytes,content_type) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO NOTHING',[p.id,p.projectId,ownerHash,pathname,p.name,p.size,p.contentType]);
      return {allowedContentTypes:[p.contentType],maximumSizeInBytes:p.size,addRandomSuffix:false,allowOverwrite:false,validUntil:Date.now()+10*60_000,tokenPayload:JSON.stringify({id:p.id,pathname})};
    },
    onUploadCompleted:async({blob,tokenPayload})=>{
      const p=z.object({id:z.uuid(),pathname:z.string()}).parse(JSON.parse(tokenPayload||'null'));
      if(blob.pathname!==p.pathname)throw new Error('forbidden');
      await database().query("UPDATE livio_photos SET state='uploaded' WHERE id=$1 AND pathname=$2",[p.id,p.pathname]);
    }
  });return json(response);
}catch(e){return failure(e);}}
