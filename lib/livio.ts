import { z } from 'zod';

export const money = (value:number) => Math.round((value + Number.EPSILON) * 100) / 100;
const mm = z.number().finite().positive().max(20000);
export const Measurement = z.object({
  width:mm, height:mm,
  kind:z.enum(['opening','frame','order']).default('opening'),
  source:z.enum(['manual','reference-photo','on-site']).default('manual'),
  status:z.enum(['approximate','estimated','checked','released']).default('approximate'),
  reference:z.string().max(1000).default(''),
  checkedBy:z.string().max(120).optional(), checkedAt:z.string().optional(),
  releasedBy:z.string().max(120).optional(), releasedAt:z.string().optional(),
}).superRefine((m,c)=>{
  if(m.source==='reference-photo'&&!m.reference.trim()) c.addIssue({code:'custom',message:'Eine nachgewiesene Grössenreferenz fehlt.'});
  if(['checked','released'].includes(m.status)&&(!m.checkedBy||!m.checkedAt)) c.addIssue({code:'custom',message:'Aufmassprüfung fehlt.'});
  if(m.status==='released'&&(m.kind!=='order'||!m.releasedBy||!m.releasedAt)) c.addIssue({code:'custom',message:'Bestellmassfreigabe fehlt.'});
});
export type MeasurementValue = z.infer<typeof Measurement>;
export const Photo = z.object({name:z.string().max(200),size:z.number().int().min(1).max(4_000_000),url:z.string().max(5_400_000).regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)});
export const Element = z.object({
  id:z.string().min(1).max(100),area:z.string().min(1).max(120),type:z.enum(['Fenster','Balkontüre','Schiebetüre','Dachfenster','Lichtschacht']),
  location:z.string().max(200).default(''),note:z.string().max(4000).default(''),count:z.number().int().min(1).max(100),
  product:z.string().min(1).max(60),productLabel:z.string().max(120),internalCode:z.string().max(60),
  width:mm,height:mm,material:z.string().max(100),shading:z.string().max(100),mesh:z.string().max(30),color:z.string().max(60),
  status:z.enum(['estimated','manual-review']),statusNote:z.string().max(1000).optional(),price:z.number().nullable().default(null),
  photos:z.array(Photo).max(6),measurement:Measurement.optional(),
  analysis:z.unknown().optional(),analysisConfirmed:z.boolean().default(false),
  technicalStatus:z.enum(['unreviewed','needs-info','site-measure','review','released']).default('unreviewed'),
  orderMeasurement:Measurement.optional(),reviewNote:z.string().max(4000).default(''),
});
export type LivioElement = z.infer<typeof Element>;
export const Project = z.object({
  id:z.uuid(),schema:z.literal('livio/1.0').default('livio/1.0'),
  project:z.object({projectType:z.string().max(100),address:z.string().max(200),zip:z.string().max(16),city:z.string().max(100),
    objectAddress:z.object({address:z.string().max(200),zip:z.string().max(16),city:z.string().max(100)}).optional(),
    standard:z.unknown().optional(),customer:z.object({projectName:z.string().max(200),firstName:z.string().max(100),lastName:z.string().max(100),email:z.string().max(200),phone:z.string().max(100),timeframe:z.string().max(200),note:z.string().max(4000)}),
    created:z.string().max(40).optional(),calculationStandards:z.unknown().optional()}),
  elements:z.array(Element).min(1).max(100),
});
export type LivioProject = z.infer<typeof Project>;
export function intake(raw:unknown):LivioProject {
  const p=Project.parse(raw);
  if(!p.project.customer.firstName.trim()||!p.project.customer.lastName.trim()||!z.email().safeParse(p.project.customer.email).success||!p.project.customer.phone.trim()) throw new Error('Bitte vollständige Kontaktdaten angeben.');
  if(new Set(p.elements.map(e=>e.id)).size!==p.elements.length) throw new Error('Element-IDs sind nicht eindeutig.');
  p.elements=p.elements.map(e=>({...e,price:null,technicalStatus:'unreviewed',reviewNote:'',orderMeasurement:undefined,
    measurement:{width:e.width,height:e.height,kind:e.measurement?.kind==='frame'?'frame':'opening',source:e.measurement?.source==='reference-photo'?'reference-photo':'manual',status:e.measurement?.source==='reference-photo'?'estimated':'approximate',reference:e.measurement?.reference||''}}));
  return p;
}
export function orderReady(e:LivioElement):boolean {
  const m=e.orderMeasurement;
  return e.technicalStatus==='released'&&!!m&&Measurement.safeParse(m).success&&m.kind==='order'&&m.status==='released'&&e.internalCode!=='Prüfen';
}

// Prices are explicit supplier cells: no interpolation, extrapolation, rotation or surface formula.
const Amount=z.number().finite().nonnegative().max(1_000_000);
export const PriceTable=z.object({
  id:z.string().min(1),version:z.string().min(1),supplier:z.string().min(1),source:z.string().min(1),
  validFrom:z.iso.date(),validTo:z.iso.date(),approvedBy:z.string().min(1),approvedAt:z.iso.datetime(),
  cells:z.array(z.object({code:z.string().min(1),mesh:z.string().min(1),color:z.string().min(1),maxWidth:mm,maxHeight:mm,saleNet:Amount,materialNet:Amount,sourcePage:z.string().min(1)})).min(1),
  rule:z.literal('next-upper-width-and-height'),
}).superRefine((t,c)=>{
  if(t.validTo<t.validFrom)c.addIssue({code:'custom',message:'Ungültiger Gültigkeitszeitraum.'});
  const keys=t.cells.map(x=>[x.code,x.mesh,x.color,x.maxWidth,x.maxHeight].join('|'));
  if(new Set(keys).size!==keys.length)c.addIssue({code:'custom',message:'Doppelte Preiszellen.'});
});
export type SupplierTable=z.infer<typeof PriceTable>;
export function tablePrice(table:SupplierTable,e:LivioElement,day=new Date().toISOString().slice(0,10)) {
  if(day<table.validFrom||day>table.validTo||e.technicalStatus==='needs-info'||e.status==='manual-review'||e.internalCode==='Prüfen')return null;
  const rows=table.cells.filter(c=>c.code===e.internalCode&&c.mesh===e.mesh&&c.color===e.color);
  const w=Math.min(...rows.filter(c=>c.maxWidth>=e.width).map(c=>c.maxWidth));
  const h=Math.min(...rows.filter(c=>c.maxHeight>=e.height).map(c=>c.maxHeight));
  const cell=rows.find(c=>c.maxWidth===w&&c.maxHeight===h);
  return cell?{saleNet:cell.saleNet,materialNet:cell.materialNet,tableId:table.id,version:table.version,source:table.source,page:cell.sourcePage,widthBand:w,heightBand:h}:null;
}
export const Economics=z.object({version:z.string().min(1),source:z.string().min(1),vatRate:z.number().min(0).max(1),
  hours:z.number().finite().min(0).max(10000),serviceNet:Amount,otherMaterialNet:Amount,
  services:z.array(z.object({label:z.string().min(1),saleNet:Amount,materialNet:Amount,hours:z.number().finite().nonnegative()})).default([])});
export function calculate(elements:LivioElement[],table:SupplierTable,basis:z.infer<typeof Economics>) {
  const prices=elements.map(e=>tablePrice(table,e));
  if(prices.some(p=>!p))return null;
  const net=money(prices.reduce((s,p,i)=>s+p!.saleNet*elements[i].count,0)+basis.serviceNet+basis.services.reduce((s,x)=>s+x.saleNet,0));
  const material=money(prices.reduce((s,p,i)=>s+p!.materialNet*elements[i].count,0)+basis.otherMaterialNet+basis.services.reduce((s,x)=>s+x.materialNet,0));
  const hours=basis.hours+basis.services.reduce((s,x)=>s+x.hours,0);
  const db2=money(net-material-hours*45),db2Percent=net>0?db2/net*100:0;
  return {net,material,hours,db2,db2Percent,belowTarget:db2Percent<43,tax:money(net*basis.vatRate),gross:money(net+money(net*basis.vatRate)),
    priceVersion:table.version,basisVersion:basis.version,basisSource:basis.source,prices,calculatedAt:new Date().toISOString()};
}

export function migrateLegacy(raw:unknown):LivioProject {
  const legacy=z.object({id:z.string().optional(),project:z.record(z.string(),z.unknown()),elements:z.array(z.record(z.string(),z.unknown()))}).parse(raw);
  return Project.parse({...legacy,id:legacy.id||crypto.randomUUID(),schema:'livio/1.0',elements:legacy.elements.map(e=>({...e,id:crypto.randomUUID(),price:null,
    // Old exports stored blob: links. Those are not original photos and cannot survive a reload.
    photos:Array.isArray(e.photos)?e.photos.filter((p:any)=>Photo.safeParse(p).success):[],
    note:String(e.note||'')+(Array.isArray(e.photos)&&e.photos.some((p:any)=>!Photo.safeParse(p).success)?' [Originalfotos aus Altdatei bitte erneut zuordnen.]':''),
    measurement:{width:e.width,height:e.height,kind:'opening',source:'manual',status:'approximate',reference:''},technicalStatus:'unreviewed',orderMeasurement:undefined,reviewNote:''}))});
}
