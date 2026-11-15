import {BrowserInput,CONTEXT,EVENT_VERSION} from '../../../../lib/marketing/contract';
import {boundedBody,json,sameOrigin,failure} from '../../../../server/http';
import {validConsent} from '../../../../server/marketing/consent';
import {connectorConfig} from '../../../../server/marketing/connector';
import {enqueue} from '../../../../server/marketing/outbox';
export const dynamic='force-dynamic';
export async function POST(r:Request){try{sameOrigin(r);if(!connectorConfig().enabled)return json({status:'disabled'},202);const consent=validConsent(r);if(!consent)return json({status:'consent_required'},403);
 const input=BrowserInput.parse(JSON.parse((await boundedBody(r,8192)).toString('utf8')));if(Math.abs(Date.now()-Date.parse(input.occurred_at))>86400000)return json({status:'invalid_time'},422);
 const {attribution,...data}=input;const result=await enqueue({...data,...attribution,...CONTEXT,event_version:EVENT_VERSION,consent_state:consent});return json({status:result.reason},202);
}catch(e){return failure(e);}}
