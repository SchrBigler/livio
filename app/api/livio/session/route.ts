import {z} from 'zod';
import {login} from '../../../../server/auth';
import {body,failure,json,sameOrigin} from '../../../../server/http';
export async function POST(r:Request){try{
  sameOrigin(r);const input=z.object({username:z.string().max(120),password:z.string().max(256)}).parse(await body(r));
  const token=login(input.username,input.password),response=json({ok:true});
  response.headers.set('Set-Cookie',`livio_staff=${token}; HttpOnly; SameSite=Strict; Path=/api/livio; Max-Age=28800${process.env.NODE_ENV==='production'?'; Secure':''}`);return response;
}catch(e){return failure(e);}}
export async function DELETE(r:Request){try{sameOrigin(r);const response=json({ok:true});response.headers.set('Set-Cookie','livio_staff=; HttpOnly; SameSite=Strict; Path=/api/livio; Max-Age=0');return response;}catch(e){return failure(e);}}
