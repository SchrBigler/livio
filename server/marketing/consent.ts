import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import {Consent,POLICY_VERSION} from '../../lib/marketing/contract';
const COOKIE='bigler_livio_statistics';
export const PREFERENCE_DAYS=180;
function secret(){const value=process.env.LIVIO_SESSION_SECRET;return value&&value.length>=32?value:null;}
export function consentCookie(choice:boolean,now=Date.now()){
 const key=secret();if(!key)throw new Error('consent_unavailable');
 const payload={analytics:choice,policy_version:POLICY_VERSION,consent_id:randomUUID(),granted_at:new Date(now).toISOString(),expires_at:now+PREFERENCE_DAYS*86400000};
 const data=Buffer.from(JSON.stringify(payload)).toString('base64url');const value=data+'.'+createHmac('sha256',key).update(data).digest('hex');
 return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${PREFERENCE_DAYS*86400}${process.env.NODE_ENV==='production'?'; Secure':''}`;
}
export function readPreference(r:Request,now=Date.now()){
 try{const key=secret();if(!key)return null;const token=r.headers.get('cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!token)return null;
 const [payload,signature]=token.split('.');if(!/^[a-f0-9]{64}$/.test(signature||''))return null;const expected=createHmac('sha256',key).update(payload).digest();if(!timingSafeEqual(expected,Buffer.from(signature,'hex')))return null;
 const value=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));if(typeof value.analytics!=='boolean'||value.policy_version!==POLICY_VERSION||value.expires_at<=now)return null;
 const consent=Consent.parse({state:'granted',purpose:'analytics',policy_version:value.policy_version,consent_id:value.consent_id,granted_at:value.granted_at,expires_at:value.expires_at});return {analytics:value.analytics as boolean,consent};
 }catch{return null;}
}
export function validConsent(r:Request){const preference=readPreference(r);return preference?.analytics?preference.consent:null;}
