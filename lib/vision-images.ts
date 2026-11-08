// Prepare a temporary, bounded analysis copy. Original photos remain untouched.
export async function analysisCopy(file:Blob):Promise<Blob>{
  const bitmap=await createImageBitmap(file);try{
    let scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
    for(let attempt=0;attempt<6;attempt++){
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
      const context=canvas.getContext('2d');if(!context)throw new Error('Bild konnte nicht vorbereitet werden.');context.drawImage(bitmap,0,0,canvas.width,canvas.height);
      const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Bild konnte nicht vorbereitet werden.')),'image/jpeg',.8));
      if(blob.size<=580000)return blob;scale*=.75;
    }throw new Error('Bitte für die Analyse einen kleineren Bildausschnitt wählen.');
  }finally{bitmap.close();}
}
