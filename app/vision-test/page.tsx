'use client';
import { useMemo, useState } from 'react';

type Analysis = any;

export default function VisionTestPage(){
  const [slots,setSlots]=useState<(File|null)[]>([null,null,null,null]);
  const files=useMemo(()=>slots.filter((x):x is File=>Boolean(x)),[slots]);
  const [note,setNote]=useState('');
  const [width,setWidth]=useState('');
  const [height,setHeight]=useState('');
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState<Analysis|null>(null);
  const [error,setError]=useState('');
  const previews=useMemo(()=>files.map(f=>({name:f.name,url:URL.createObjectURL(f)})),[files]);

  function setSlot(index:number,list:FileList|null){
    const file=list?.[0]||null;
    setSlots(prev=>prev.map((old,i)=>i===index?file:old));
    setResult(null); setError('');
  }

  async function analyze(){
    setLoading(true); setError(''); setResult(null);
    try{
      const fd=new FormData();
      files.forEach(f=>fd.append('images',f));
      fd.append('note',`${note}\nGemessene Breite mm: ${width||'nicht angegeben'}\nGemessene Höhe mm: ${height||'nicht angegeben'}`);
      const res=await fetch('/api/vision-analyze',{method:'POST',body:fd});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error+(data.detail?` - ${data.detail}`:''));
      setResult(data);
    }catch(e:any){ setError(e.message||'Fehler'); }
    finally{ setLoading(false); }
  }

  return <main className="vision-wrap">
    <header className="vision-brand">
      <a className="vision-logo" href="/">BIGLER</a>
      <div>
        <b>LIVIO Vision Lab</b><br/>
        <span>Interner Tester für KI-Fotoanalyse</span>
      </div>
    </header>

    <section className="card hero">
      <h1>Fensterfoto analysieren</h1>
      <p>Testversion: Bilder hochladen, KI-Einschätzung prüfen, Regeln verbessern. Noch keine automatische Offerte.</p>
      <div className="hint">
        <b>Empfohlene Fotos:</b> 1× ganzes Fenster von innen, 1× Flügel geöffnet/Bandseite, 1× Detail Flügelecke/Glasleiste, 1× Aussen/Beschattung. Dazu Breite und Höhe als Richtmass eingeben.
      </div>
    </section>

    <section className="vision-grid">
      <div className="card">
        <h2>Bilder und Masse</h2>
        <div className="photo-slots">{['Ganzes Fenster innen','Flügel geöffnet / Bandseite','Detail Ecke / Glasleiste','Aussen / Beschattung'].map((label,i)=><label className="photo-slot" key={label}><b>{i+1}</b><span>{label}</span><input type="file" accept="image/*" capture="environment" onChange={e=>setSlot(i,e.target.files)}/></label>)}</div>
        <div className="measure-grid"><label><span>Breite mm</span><input value={width} onChange={e=>setWidth(e.target.value)} inputMode="numeric" placeholder="z.B. 900"/></label><label><span>Höhe mm</span><input value={height} onChange={e=>setHeight(e.target.value)} inputMode="numeric" placeholder="z.B. 1200"/></label></div>
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Optionale Notiz, z.B. Schlafzimmer, Baujahr 2018, Raffstore vorhanden..." />
        <button className="vision-button" disabled={!files.length||loading} onClick={analyze}>{loading?'Analysiere...':'Analyse starten'}</button>
        {error&&<div className="err">{error}</div>}
        <div className="previews">{previews.map(p=><figure key={p.url}><img src={p.url} alt={p.name}/><figcaption>{p.name}</figcaption></figure>)}</div>
      </div>

      <div className="card">
        <h2>Ergebnis</h2>
        {!result&&!loading&&<p className="muted">Noch keine Analyse.</p>}
        {result&&<Result data={result}/>}        
      </div>
    </section>

    <section className="card rules">
      <h2>Aktuelle Bigler-Erkennungsregeln</h2>
      <ul>
        <li>Flügelecken auf Gehrung → Kunststoff sehr wahrscheinlich.</li>
        <li>Stumpfe Ecken + sichtbare Glasleisten innen → Holz sehr wahrscheinlich.</li>
        <li>Stumpfe Ecken + keine Glasleisten / Aluschale sichtbar → Holz-Alu sehr wahrscheinlich.</li>
        <li>Deutliche Stufe zwischen Flügel und Blendrahmen → flächenversetzt.</li>
        <li>Flügel und Blendrahmen fast in einer Ebene → flächenbündig, eher selten und modern.</li>
        <li>Standardgewebe Bigler: Transpatec TTA; Polltec TFP als Schlaf-/Allergikerhinweis.</li>
      </ul>
    </section>
  </main>
}

function pct(n:any){const v=Number(n)||0; return v<=1?Math.round(v*100):Math.round(v)}
function Confidence({n}:{n:number}){const v=pct(n);return <span className={v>=90?'ok':v>=70?'mid':'low'}>{v}%</span>}
function Row({label,obj}:{label:string,obj:any}){return <div className="row"><span>{label}</span><b>{obj?.value||'-'} {typeof obj?.confidence==='number'&&<Confidence n={obj.confidence}/>}</b>{obj?.evidence&&<small>{obj.evidence}</small>}</div>}
function Result({data}:{data:any}){
  return <div className="result">
    <h3>{data.summary}</h3>
    <Row label="Element" obj={data.detections?.element}/>
    <Row label="Material" obj={data.detections?.material}/>
    <Row label="Geometrie" obj={data.detections?.geometry}/>
    <Row label="Beschattung" obj={data.detections?.shading}/>
    <h3>Empfehlung</h3>
    <div className="recommend"><b>{data.recommendation?.customerProduct}</b><span>Interner Vorschlag: {data.recommendation?.internalVariant}</span><span>Gewebe: {data.recommendation?.mesh}</span><p>{data.recommendation?.reason}</p></div>
    <Block title="Fehlende Fotos" items={data.missingPhotos}/>
    <Block title="Offene Fragen" items={data.openQuestions}/>
    <Block title="Warnungen" items={data.warnings}/>
    <details><summary>JSON anzeigen</summary><pre>{JSON.stringify(data,null,2)}</pre></details>
  </div>
}
function Block({title,items}:{title:string,items?:string[]}){ if(!items?.length)return null; return <div className="block"><b>{title}</b><ul>{items.map((x,i)=><li key={i}>{x}</li>)}</ul></div> }
