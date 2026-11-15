export const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export function sameOrigin(r:Request){if(r.headers.get('origin')!==new URL(r.url).origin)throw new Error('forbidden');}
export async function boundedBody(r:Request,limit=4_000_000){
  const reader=r.body?.getReader(),parts:Uint8Array[]=[];let size=0;
  if(reader)while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw new Error('payload_too_large');}parts.push(value);}
  return Buffer.concat(parts);
}
export async function body(r:Request){if(!r.headers.get('content-type')?.startsWith('application/json'))throw new Error('invalid_input');return JSON.parse((await boundedBody(r)).toString('utf8'));}
export function failure(e:unknown){
  const code=e instanceof Error?e.message:'';
  const messages:Record<string,[number,string]>={forbidden:[403,'Zugriff nicht erlaubt.'],unauthorized:[401,'Bitte anmelden.'],not_found:[404,'Anfrage nicht gefunden.'],stale:[409,'Inzwischen geändert. Bitte neu laden.'],already_received_changed:[409,'Diese Anfrage ist bereits mit einem anderen Stand eingegangen. Bitte Änderungen über die fachliche Prüfung abstimmen.'],database_unavailable:[503,'Die zentrale Anfrageablage ist noch nicht eingerichtet. Ihr Entwurf bleibt auf diesem Gerät gespeichert.'],payload_too_large:[413,'Die Anfrage enthält mehr als 4 MB. Bitte Projektdatei mit Originalfotos exportieren und BIGLER übermitteln.'],not_ready:[409,'Geprüfte und freigegebene Bestellmasse fehlen.'],commerce_unavailable:[503,'Commerce-Verknüpfung ist noch nicht eingerichtet.'],invalid_input:[422,'Bitte Eingaben prüfen.']};
  const [status,error]=messages[code]||[422,'Bitte Eingaben und Konfiguration prüfen.'];return json({error},status);
}
