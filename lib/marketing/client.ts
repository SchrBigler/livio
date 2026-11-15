'use client';
import {Attribution,BrowserInput,attributionFromUrl,campaignLink,type BrowserEvent} from './contract';
let allowed=false;let active=false;let session='';let attribution:ReturnType<typeof Attribution.parse>={};let lastPage='';
const KEY='bigler-marketing-session-v1';
export function clearMarketing(){allowed=false;session='';attribution={};lastPage='';try{sessionStorage.removeItem(KEY);}catch{}}
export function setMarketing(enabled:boolean,granted:boolean){active=enabled;if(!enabled||!granted){clearMarketing();return;}allowed=true;
 try{const stored=JSON.parse(sessionStorage.getItem(KEY)||'null');if(stored&&stored.expires>Date.now()){session=stored.id;attribution=Attribution.parse(stored.attribution);}else{session=crypto.randomUUID();attribution={};}}catch{session=crypto.randomUUID();attribution={};}
 const incoming=attributionFromUrl(window.location.href);if(Object.keys(incoming).length)attribution=incoming;
 try{sessionStorage.setItem(KEY,JSON.stringify({id:session,attribution,expires:Date.now()+30*60000}));}catch{}
 const page=window.location.pathname==='/'?'home':window.location.pathname==='/planen'?'planen':null;
 if(page&&lastPage!==page){lastPage=page;trackMarketing('page_viewed',{page});if(Object.keys(attribution).length)trackMarketing('campaign_landing_viewed',{page});}
}
export function marketingContext(){return active&&allowed?{session_id:session,attribution}:undefined;}
export function trackMarketing(name:BrowserEvent['event_name'],properties:BrowserEvent['properties'],refs:Pick<BrowserEvent,'product_id'|'configuration_ref'>={}){
 try{if(!active||!allowed)return;const input=BrowserInput.parse({event_id:crypto.randomUUID(),event_name:name,occurred_at:new Date().toISOString(),session_id:session,attribution,properties:{...properties,trigger:name==='page_viewed'||name==='campaign_landing_viewed'?'page_load':'user_action'},...refs});
 void fetch('/api/marketing/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),keepalive:true,signal:AbortSignal.timeout(4000)}).catch(()=>{});
 }catch{/* Tracking must never interrupt planning. */}
}
export function marketingLink(url:string,origins:string[]){try{return campaignLink(url,attribution,active&&allowed,origins);}catch{return url;}}
