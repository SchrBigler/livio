import {z} from 'zod';
export const EVENT_VERSION='1.0' as const;
export const POLICY_VERSION='livio-statistik-2026-11-15' as const;
export const CONTEXT={source_module:'livio',brand:'schreinerei-bigler',product_family:'insektenschutz'} as const;
export const EVENTS=['page_viewed','product_viewed','content_viewed','campaign_landing_viewed','internal_referral_clicked','search_performed','category_selected','configuration_started','configuration_changed','configuration_saved','configuration_completed','configuration_abandoned','inquiry_started','inquiry_submitted','add_to_cart','checkout_started','order_completed','order_cancelled','refund_completed','repeat_purchase_completed','cross_product_purchase_completed','newsletter_opt_in_completed','unavailable_product_requested','customization_requested','new_design_requested','frequently_requested_feature_detected'] as const;
export const CLIENT_EVENTS=['page_viewed','content_viewed','campaign_landing_viewed','internal_referral_clicked','category_selected','configuration_started','configuration_saved','configuration_completed','inquiry_started'] as const;
// Deliberately exclude free text, room names, dimensions, photos, prompts and location.
const Choice=z.enum(['Fenster','Balkontüre','Schiebetüre','Dachfenster','Lichtschacht','Andere Öffnung','Terrassentüre']);
const Count=z.number().int().min(0).max(10000);
const common={trigger:z.enum(['user_action','page_load','server_confirmation']).optional(),help_topic:z.enum(['measurement']).optional(),position_count:Count.optional(),element_count:Count.optional(),review_required:z.boolean().optional()};
export const Properties=z.object({page:z.enum(['home','planen']).optional(),opening_type:Choice.optional(),
 mesh:z.enum(['TTA','TFP','FA','V2MG','V2','V4S']).optional(),
 measurement_source:z.enum(['manual','reference-photo']).optional(),
 target_module:z.enum(['schreinerei','kreativ','bernora','other-bigler']).optional(),...common}).strict();
export const PRODUCT_IDS=['SP1_41','SP1_43','SP5_10','SP6_51','RO4_2','RO5_2','PL2_5','ST3_1','ST3_4','PT2_10','PT2_71','DT3_1','LI1_2','LI1_1','ROOF_REVIEW','ISIFIX_REVIEW','CHECK'] as const;
export function campaignToken(value:string|undefined|null){if(!value||! /^[A-Za-z][A-Za-z0-9._-]{0,79}$/.test(value)||/\d{7}/.test(value))return undefined;return value;}
const CampaignToken=z.string().refine(v=>campaignToken(v)===v,'Nur freigegebene Kampagnenslugs ohne Personendaten verwenden.');
export const Attribution=z.object({campaign_id:CampaignToken.optional(),experiment_id:CampaignToken.optional(),utm_source:CampaignToken.optional(),utm_medium:CampaignToken.optional(),utm_campaign:CampaignToken.optional(),utm_content:CampaignToken.optional(),utm_term:CampaignToken.optional()}).strict();
export const Consent=z.object({state:z.literal('granted'),purpose:z.literal('analytics'),policy_version:z.literal(POLICY_VERSION),consent_id:z.uuid(),granted_at:z.iso.datetime(),expires_at:z.number().int().positive()}).strict();
export const BrowserInput=z.object({event_id:z.uuid(),event_name:z.enum(CLIENT_EVENTS),occurred_at:z.iso.datetime(),session_id:z.uuid(),configuration_ref:z.uuid().optional(),product_id:z.enum(PRODUCT_IDS).optional(),attribution:Attribution.optional(),properties:Properties}).strict();
export const Event=z.object({event_id:z.uuid(),event_name:z.enum(EVENTS),event_version:z.literal(EVENT_VERSION),occurred_at:z.iso.datetime(),source_module:z.literal(CONTEXT.source_module),brand:z.literal(CONTEXT.brand),product_family:z.literal(CONTEXT.product_family),product_id:z.enum(PRODUCT_IDS).optional(),session_id:z.uuid().optional(),customer_ref:z.uuid().optional(),project_ref:z.uuid().optional(),configuration_ref:z.uuid().optional(),order_ref:z.uuid().optional(),...Attribution.shape,consent_state:Consent,properties:Properties}).strict();
export type MarketingEvent=z.infer<typeof Event>;
export type BrowserEvent=z.infer<typeof BrowserInput>;
export function attributionFromUrl(url:string){const params=new URL(url).searchParams;const result:Record<string,string>={};for(const key of Object.keys(Attribution.shape)){// Search terms can include private text; do not capture them automatically.
 if(key==='utm_term')continue;const value=campaignToken(params.get(key));if(value)result[key]=value;
}return Attribution.parse(result);}
export function campaignLink(url:string,attribution:z.infer<typeof Attribution>,granted:boolean,origins:string[]){const target=new URL(url);if(!granted||target.protocol!=='https:'||!origins.includes(target.origin))return url;for(const [key,value] of Object.entries(Attribution.parse(attribution)))if(value&&!target.searchParams.has(key))target.searchParams.set(key,value);return target.href;}
