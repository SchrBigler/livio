// IndexedDB retains original photo bytes. It is a device draft, not a submitted request.
function open():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{
  const r=indexedDB.open('bigler-livio',1);
  r.onupgradeneeded=()=>r.result.createObjectStore('drafts');
  r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
});}
export async function readDraft<T>(key:string):Promise<T|undefined>{
  const db=await open();try{return await new Promise((resolve,reject)=>{const r=db.transaction('drafts').objectStore('drafts').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}finally{db.close();}
}
export async function writeDraft(key:string,value:unknown):Promise<void>{
  const db=await open();try{await new Promise<void>((resolve,reject)=>{const t=db.transaction('drafts','readwrite');t.objectStore('drafts').put(value,key);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});}finally{db.close();}
}
export async function photoData(file:File){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10_000_000)throw new Error('Bitte JPG, PNG oder WebP bis 10 MB wählen. HEIC bitte als JPG exportieren.');
  const url=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(r.error);r.readAsDataURL(file);});
  return {name:file.name,size:file.size,url,uploadId:crypto.randomUUID()};
}
