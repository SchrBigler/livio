import {z} from 'zod';
import {Attribution,CONTEXT,EVENT_VERSION,type MarketingEvent} from '../../lib/marketing/contract';
import type {LivioProject} from '../../lib/livio';
import {validConsent} from './consent';
import {connectorConfig,stableEventId} from './connector';
export function inquiryEvent(request:Request,project:LivioProject,raw:unknown):MarketingEvent|null{
 if(!connectorConfig().enabled)return null;const consent=validConsent(request);if(!consent)return null;
 const context=z.object({session_id:z.uuid(),attribution:Attribution.optional()}).strict().safeParse(raw);if(!context.success)return null;
 return {event_id:stableEventId('inquiry-submitted:'+project.id),event_name:'inquiry_submitted',event_version:EVENT_VERSION,occurred_at:new Date().toISOString(),...CONTEXT,session_id:context.data.session_id,...context.data.attribution,project_ref:project.id,consent_state:consent,properties:{trigger:'server_confirmation',position_count:project.elements.length,element_count:project.elements.reduce((n,e)=>n+e.count,0),review_required:project.elements.some(e=>e.status==='manual-review')}};
}
