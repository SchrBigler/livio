import {z} from 'zod';
import {boundedBody,json,sameOrigin,failure} from '../../../../server/http';
import {consentCookie,readPreference,validConsent} from '../../../../server/marketing/consent';
import {connectorConfig,referralOrigins} from '../../../../server/marketing/connector';
import {revoke} from '../../../../server/marketing/outbox';
import {POLICY_VERSION} from '../../../../lib/marketing/contract';
export const dynamic='force-dynamic';
export async function GET(r:Request){const config=connectorConfig();return json({enabled:config.enabled,consent_state:readPreference(r)?.analytics===true?'granted':readPreference(r)?.analytics===false?'denied':'unknown',policy_version:POLICY_VERSION,referral_origins:referralOrigins()});}
export async function POST(r:Request){try{sameOrigin(r);const input=z.object({analytics:z.boolean()}).strict().parse(JSON.parse((await boundedBody(r,1024)).toString('utf8')));if(input.analytics&&!connectorConfig().enabled)return json({error:'Statistik ist derzeit deaktiviert.'},409);
 const old=validConsent(r);if(!input.analytics&&old){try{await revoke(old.consent_id);}catch{return json({error:'Einwilligung konnte noch nicht vollständig widerrufen werden. Bitte erneut versuchen.'},503);}}
 const response=json({consent_state:input.analytics?'granted':'denied'});response.headers.set('Set-Cookie',consentCookie(input.analytics));return response;
}catch(e){return failure(e);}}
