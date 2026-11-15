'use client';
import {analysisCopy} from '../lib/vision-images';
import {useState} from 'react';
import {Analysis,type VisionResult} from '../lib/vision';
type Photo={name:string;url:string;size:number};
export default function ElementVision({photos,note,shaft,onConfirm,onResult}:{photos:Photo[];note:string;shaft:boolean;onConfirm:(material:string,shading:string)=>void;onResult:(r:VisionResult)=>void}){
  const [result,setResult]=useState<VisionResult|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState('');
  const [material,setMaterial]=useState('unklar'),[shading,setShading]=useState('unklar');
  async function analyze(){setLoading(true);setError('');setResult(null);try{
    const fd=new FormData();
    for(const p of photos){const blob=await (await fetch(p.url)).blob();fd.append('images',await analysisCopy(blob),p.name+'.jpg');}
    fd.append('note',`${shaft?'Lichtschacht: keine Fenstertypfrage. ':''}${note}`);
    const response=await fetch('/api/vision-analyze',{method:'POST',body:fd});const data=await response.json();if(!response.ok)throw new Error(data.error);
    const parsed=Analysis.parse(data);setResult(parsed);onResult(parsed);setMaterial(parsed.detections.material.value);setShading(parsed.detections.shading.value);
  }catch(e){setError(e instanceof Error?e.message:'Analyse fehlgeschlagen.');}finally{setLoading(false);}}
  return <div className="vision-assist"><h3>Was zeigen Ihre Fotos?</h3><p>Ein Vorschlag hilft beim Erfassen. Sie entscheiden, welche Angaben stimmen. Ohne Fotos können Sie manuell weiterfahren.</p><div className="actions"><button type="button" className="secondary" disabled={!photos.length||loading} onClick={analyze}>{loading?'Fotos werden geprüft …':'Fotos analysieren'}</button></div>
    {error&&<p role="alert" className="warn-box">{error}</p>}
    {result&&<div className="vision-result"><span className="eyebrow">Vorschlag · bitte prüfen</span><p>{result.summary}</p>
      <div className="grid">{!shaft&&<label className="field">Fenstermaterial<select value={material} onChange={e=>setMaterial(e.target.value)}>{['unklar','Holz','Holz-Alu','Kunststoff'].map(v=><option key={v}>{v}</option>)}</select><small>{result.detections.material.evidence}</small></label>}
      <label className="field">Sichtbare Beschattung<select value={shading} onChange={e=>setShading(e.target.value)}>{['unklar','keine','Raffstore','Rollladen','Jalousie'].map(v=><option key={v}>{v}</option>)}</select><small>{result.detections.shading.evidence}</small></label></div>
      <p>Erkannter Elementtyp: {result.detections.element.value}. Den gewählten Elementtyp können Sie mit «Zurück» ändern.</p>
      {result.detections.obstacles.length>0&&<p>Hindernisse: {result.detections.obstacles.join(' · ')}</p>}
      {[...result.openQuestions,...result.missingPhotos,...result.warnings].length>0&&<ul>{[...result.openQuestions,...result.missingPhotos,...result.warnings].map((q,i)=><li key={i}>{q}</li>)}</ul>}
      <button className="secondary" onClick={()=>onConfirm(material==='unklar'?'Weiss ich nicht':material,shading==='keine'?'Keine':shading==='unklar'?'Weiss ich nicht':shading)}>Diese Angaben bestätigen</button>
    </div>}
  </div>;
}
