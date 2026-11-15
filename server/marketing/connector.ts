import {createHash} from 'node:crypto';
import {Event,type MarketingEvent} from '../../lib/marketing/contract';
export function connectorConfig(){
 if(process.env.BIGLER_MARKETING_ENABLED!=='true')return {enabled:false as const,reason:'disabled'};
 try{const endpoint=new URL(process.env.BIGLER_MARKETING_ENDPOINT||''),origin=new URL(process.env.BIGLER_MARKETING_ALLOWED_ORIGIN||'');const token=process.env.BIGLER_MARKETING_TOKEN||'';
 if(endpoint.protocol!=='https:'||endpoint.origin!==origin.origin||endpoint.username||endpoint.password||endpoint.hash||endpoint.search||token.length<32||!endpoint.hostname.includes('.')||/^[\d.]+$/.test(endpoint.hostname)||endpoint.hostname.includes(':')||/\.(local|localhost|internal)$/.test(endpoint.hostname))throw new Error();
 return {enabled:true as const,endpoint:endpoint.href,token};
 }catch{return {enabled:false as const,reason:'configuration_incomplete'};}
}
export function referralOrigins(){return ['https://bigler-schreinerei.ch','https://bigler-kreativ.ch','https://storycut.bigler-kreativ.ch'];}
export function stableEventId(key:string){const hash=createHash('sha256').update('livio-marketing:'+key).digest('hex');return `${hash.slice(0,8)}-${hash.slice(8,12)}-5${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;}
export async function deliver(event:MarketingEvent,fetcher:typeof fetch=fetch){
 const config=connectorConfig();if(!config.enabled)return {ok:false as const,code:config.reason,retryable:false};
 const payload=Event.parse(event);try{const response=await fetcher(config.endpoint,{method:'POST',redirect:'error',signal:AbortSignal.timeout(5000),headers:{Authorization:'Bearer '+config.token,'Content-Type':'application/json','Idempotency-Key':payload.event_id,'X-BIGLER-Event-Version':payload.event_version},body:JSON.stringify(payload)});
 if(!response.ok)return {ok:false as const,code:'http_'+response.status,retryable:response.status===429||response.status>=500};
 // A 200 or login page is NOT proof of ingestion. The central contract must acknowledge this exact ID.
 const length=Number(response.headers.get('content-length')||0);if(length>8192)return {ok:false as const,code:'ack_invalid',retryable:false};
 const reader=response.body?.getReader();let raw='',bytes=0;if(reader){while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.length;if(bytes>8192){await reader.cancel();return {ok:false as const,code:'ack_invalid',retryable:false};}raw+=new TextDecoder().decode(value);}}
 const ack=JSON.parse(raw);if(ack.schema_version!=='1.0'||!Array.isArray(ack.accepted_event_ids)||!ack.accepted_event_ids.includes(payload.event_id))return {ok:false as const,code:'ack_invalid',retryable:false};
 return {ok:true as const,code:'accepted',retryable:false};
 }catch{return {ok:false as const,code:'network_error',retryable:true};}
}
