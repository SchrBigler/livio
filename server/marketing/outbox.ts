import {database} from '../db';
import {Event,type MarketingEvent} from '../../lib/marketing/contract';
import {connectorConfig,deliver} from './connector';
export type QueueDB={query(sql:string,values?:any[]):Promise<{rows:any[]}>};
export async function enqueue(event:MarketingEvent,db?:QueueDB){
 if(!connectorConfig().enabled)return {queued:false,reason:'disabled'};
 db=db||database();const value=Event.parse(event);if(value.consent_state.expires_at<=Date.now())return {queued:false,reason:'consent_expired'};
 const result=await db.query('INSERT INTO livio_marketing_outbox(event_id,consent_id,event_name,payload) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING event_id',[value.event_id,value.consent_state.consent_id,value.event_name,JSON.stringify(value)]);
 return {queued:result.rows.length>0,reason:result.rows.length?'queued':'duplicate'};
}
export async function revoke(consentId:string,db?:QueueDB){db=db||database();await db.query("UPDATE livio_marketing_outbox SET payload=NULL,status='dead',last_error='consent_revoked' WHERE consent_id=$1 AND status IN ('pending','sending')",[consentId]);}
export async function flush(db?:QueueDB,fetcher:typeof fetch=fetch){
 if(!connectorConfig().enabled)return {sent:0,failed:0,state:'disabled'};
 db=db||database();await db.query("DELETE FROM livio_marketing_outbox WHERE expires_at<now() OR (status='delivered' AND delivered_at<now()-interval '30 days')");
 const {rows}=await db.query("WITH jobs AS (SELECT event_id FROM livio_marketing_outbox WHERE payload IS NOT NULL AND attempts<3 AND expires_at>now() AND (status='pending' AND next_attempt_at<=now() OR status='sending' AND lease_until<now()) ORDER BY created_at LIMIT 5 FOR UPDATE SKIP LOCKED) UPDATE livio_marketing_outbox q SET status='sending',attempts=q.attempts+1,lease_until=now()+interval '2 minutes' FROM jobs WHERE q.event_id=jobs.event_id RETURNING q.*");
 let sent=0,failed=0;for(const row of rows){
  // Recheck consent immediately before transfer; revoked pending messages cannot be sent.
  const current=(await db.query("SELECT payload FROM livio_marketing_outbox WHERE event_id=$1 AND status='sending'",[row.event_id])).rows[0];if(!current?.payload)continue;
  const parsed=Event.safeParse(current.payload);const result=!parsed.success?{ok:false,code:'schema_invalid',retryable:false}:parsed.data.consent_state.expires_at<=Date.now()?{ok:false,code:'consent_expired',retryable:false}:await deliver(parsed.data,fetcher);
  if(result.ok){sent++;await db.query("UPDATE livio_marketing_outbox SET status='delivered',payload=NULL,delivered_at=now(),lease_until=NULL,last_error=NULL,expires_at=now()+interval '30 days' WHERE event_id=$1",[row.event_id]);}
  else{failed++;const terminal=!result.retryable||row.attempts>=3;await db.query("UPDATE livio_marketing_outbox SET status=$2,last_error=$3,lease_until=NULL,next_attempt_at=now()+($4*interval '1 second'),payload=CASE WHEN $5 THEN NULL ELSE payload END WHERE event_id=$1",[row.event_id,terminal?'dead':'pending',result.code,60*Math.pow(5,row.attempts-1),terminal]);}
 }return {sent,failed,state:'checked'};
}
