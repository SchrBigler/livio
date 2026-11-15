import {z} from 'zod';
import type {LivioElement} from './livio';
export const SupplierSource=z.object({schema:z.literal('isn-source/1'),supplier:z.string(),source:z.string(),priceEdition:z.string(),validFrom:z.string(),validityConfirmed:z.boolean(),status:z.string(),roundingRule:z.literal('next-upper-width-and-height'),tables:z.array(z.object({id:z.string(),title:z.string(),codes:z.array(z.string()),pdfPage:z.number(),printedPage:z.number(),widths:z.array(z.number()),cells:z.array(z.object({width:z.number().positive(),height:z.number().positive(),net:z.number().nonnegative()}))})),frameMeshSurcharges:z.object({areaUpperM2:z.array(z.number()),TTA:z.array(z.number()),TFP:z.array(z.number()),FA:z.array(z.number()),pdfPage:z.number(),printedPage:z.number()}),notes:z.array(z.string())});
export type Source=z.infer<typeof SupplierSource>;
export function supplierLookup(source:Source,e:LivioElement){
  const table=source.tables.find(t=>t.codes.includes(e.internalCode));if(!table)return {ok:false as const,reason:'Exakte Variante nicht in den importierten Tabellen enthalten.'};
  const m=e.orderMeasurement||e.measurement||{width:e.width,height:e.height},w=Math.min(...table.cells.filter(c=>c.width>=m.width).map(c=>c.width)),h=Math.min(...table.cells.filter(c=>c.height>=m.height).map(c=>c.height));
  const cell=table.cells.find(c=>c.width===w&&c.height===h);if(!cell)return {ok:false as const,reason:'Kein belegtes Preisfeld für diese Abmessungen. Manuelle Prüfung erforderlich.'};
  if(e.internalCode.startsWith('LI')){if(e.mesh!=='V2MG'||!['MG','DG','E1'].includes(e.color))return {ok:false as const,reason:'Lichtschacht-Zuschläge für diese Ausführung separat prüfen.'};return {ok:true as const,base:cell.net,meshSurcharge:0,listNet:cell.net,widthBand:w,heightBand:h,source:source.source,edition:source.priceEdition,pdfPage:table.pdfPage,printedPage:table.printedPage,validityConfirmed:source.validityConfirmed,notice:'Standard Robustec V2A, Original-Tabellenwert. Kein Verkaufspreis.'};}
  if(!e.internalCode.startsWith('SP')&&e.mesh!=='FA')return {ok:false as const,reason:'Gewebezuschlag dieser Produktfamilie muss anhand der Originalunterlagen geprüft werden.',base:cell.net};
  const area=m.width*m.height/1e6,index=source.frameMeshSurcharges.areaUpperM2.findIndex(x=>area<=x),tiers=source.frameMeshSurcharges[e.mesh as 'TTA'|'TFP'|'FA'];
  if(index<0||!tiers)return {ok:false as const,reason:'Gewebe- oder Flächengrenze nicht vollständig belegt.'};
  const standardColors=['W1','G3','G4','B4','B5','B6','E1'];
  if(!standardColors.includes(e.color))return {ok:false as const,reason:'Sonderfarbe oder besonderer Zubehörzuschlag noch zu prüfen.'};
  const surcharge=e.internalCode.startsWith('SP')?tiers[index]:0;
  return {ok:true as const,base:cell.net,meshSurcharge:surcharge,listNet:cell.net+surcharge,widthBand:w,heightBand:h,source:source.source,edition:source.priceEdition,pdfPage:table.pdfPage,printedPage:table.printedPage,validityConfirmed:source.validityConfirmed,notice:'Lieferanten-Tabellenwert vor Prüfung der Konditionen und Zusatzkosten. Kein Verkaufspreis und keine technische Freigabe.'};
}
