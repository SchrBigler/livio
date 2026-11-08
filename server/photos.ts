import {head} from '@vercel/blob';
import type {LivioProject} from '../lib/livio';
type DB={query(sql:string,args?:unknown[]):Promise<{rows:any[]}>};
export async function verifyProjectPhotos(db:DB,p:LivioProject,ownerHash:string){
  for(const e of p.elements)for(const photo of e.photos){
    if(!photo.storageId)continue;
    const row=(await db.query('SELECT * FROM livio_photos WHERE id=$1 AND project_id=$2 AND owner_hash=$3',[photo.storageId,p.id,ownerHash])).rows[0];
    if(!row||row.original_name!==photo.name||row.size_bytes!==photo.size)throw new Error('invalid_input');
    // The callback can arrive later than the customer submission; authenticated
    // Blob metadata is the source of truth, not a client-provided completion flag.
    const blob=await head(row.pathname);
    if(blob.pathname!==row.pathname||blob.size!==row.size_bytes||blob.contentType!==row.content_type)throw new Error('invalid_input');
    await db.query("UPDATE livio_photos SET state='uploaded' WHERE id=$1",[photo.storageId]);
  }
}
