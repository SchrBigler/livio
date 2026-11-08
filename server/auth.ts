import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
export const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
const equal=(a:string,b:string)=>a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
function secret(){const s=process.env.LIVIO_SESSION_SECRET;if(!s||s.length<32)throw new Error('unauthorized');return s;}
export function login(username:string,password:string){
  const accounts=JSON.parse(process.env.LIVIO_STAFF_ACCOUNTS||'[]') as {id:string;username:string;tokenSha256:string}[];
  const actor=accounts.find(a=>a.username===username&&equal(a.tokenSha256,hash(password)));
  if(!actor)throw new Error('unauthorized');
  const payload=Buffer.from(JSON.stringify({id:actor.id,expires:Date.now()+8*3600000})).toString('base64url');
  return payload+'.'+createHmac('sha256',secret()).update(payload).digest('hex');
}
export function staff(r:Request){
  const token=r.headers.get('cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith('livio_staff='))?.slice(12)||'';
  const [payload,signature]=token.split('.');
  if(!payload||!signature||!equal(createHmac('sha256',secret()).update(payload).digest('hex'),signature))throw new Error('unauthorized');
  const actor=JSON.parse(Buffer.from(payload,'base64url').toString('utf8')) as {id:string;expires:number};
  if(actor.expires<Date.now())throw new Error('unauthorized');return actor.id;
}
export function owner(r:Request){const token=r.headers.get('authorization')?.replace(/^Bearer /,'')||'';if(!/^[a-f0-9]{64}$/.test(token))throw new Error('unauthorized');return hash(token);}
