import {staff} from '../../../../server/auth';
import {json,failure} from '../../../../server/http';
import {database} from '../../../../server/db';
import {connectorConfig} from '../../../../server/marketing/connector';
import {EVENT_VERSION,POLICY_VERSION} from '../../../../lib/marketing/contract';
export const dynamic='force-dynamic';
export async function GET(r:Request){try{staff(r);const config=connectorConfig();let queue:any={schema:'not-checked',pending:null,last_success:null,last_error:null};
 try{const rows=await database().query("SELECT count(*) FILTER(WHERE status IN ('pending','sending'))::int AS pending,max(delivered_at) AS last_success FROM livio_marketing_outbox");const error=await database().query("SELECT last_error FROM livio_marketing_outbox WHERE last_error IS NOT NULL ORDER BY created_at DESC LIMIT 1");queue={schema:'ready',...rows.rows[0],last_error:error.rows[0]?.last_error||null};}catch{queue.schema='not-installed-or-unavailable';}
 return json({connector:'present',source_module:'livio',schema_version:EVENT_VERSION,api:config.enabled?(queue.last_success?'verified':'configured-unverified'):'prepared-disabled',configuration:config.enabled?'complete':config.reason,queue,consent:{state:'connected-opt-in',policy_version:POLICY_VERSION},commerce_core:process.env.LIVIO_COMMERCE_ENABLED==='true'?'configured-unverified':'not-connected',calculation_basis:'not-connected',redaktionsatelier:'not-connected',marketing_assistant:'central-api-required',market_radar:'not-active',last_checked_at:new Date().toISOString()});
}catch(e){return failure(e);}}
