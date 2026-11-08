import {get,head} from '@vercel/blob';
import {z} from 'zod';
import {database} from '../../../../../server/db';
import {owner,staff} from '../../../../../server/auth';
import {failure,json} from '../../../../../server/http';
export const dynamic='force-dynamic';
export async function GET(r:Request,{params}:{params:{id:string}}){try{
  const id=z.uuid().parse(params.id),row=(await database().query('SELECT * FROM livio_photos WHERE id=$1',[id])).rows[0];if(!row)throw new Error('not_found');
  if(r.headers.has('authorization')){if(owner(r)!==row.owner_hash)throw new Error('not_found');}else staff(r);
  if(new URL(r.url).searchParams.get('metadata')==='1'){const meta=await head(row.pathname);return json({uploaded:true,size:meta.size,contentType:meta.contentType});}
  const file=await get(row.pathname,{access:'private'});if(!file||file.statusCode!==200)return json({error:'Originalfoto nicht gefunden.'},404);
  return new Response(file.stream,{headers:{'Content-Type':row.content_type,'Content-Disposition':`inline; filename*=UTF-8''${encodeURIComponent(row.original_name)}`,'Cache-Control':'private,no-store','X-Content-Type-Options':'nosniff'}});
}catch(e){return failure(e);}}
