'use client';
import { useMemo, useState } from 'react';

type Step = 'welcome' | 'projectType' | 'location' | 'area' | 'component' | 'count' | 'photo' | 'situation' | 'material' | 'shutter' | 'measure' | 'summary';

type ElementItem = {
  id: string;
  area: string;
  type: string;
  count: number;
  product: string;
  price: number;
};

const PLZ: Record<string, string[]> = {
  '3127': ['Muehlethurnen', 'Lohnstorf'],
  '3123': ['Belp'],
  '3600': ['Thun'],
  '3011': ['Bern'],
  '3007': ['Bern'],
  '3145': ['Niederscherli']
};

function chf(n: number) {
  return `CHF ${n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Page() {
  const [step, setStep] = useState<Step>('welcome');
  const [history, setHistory] = useState<Step[]>([]);
  const [projectType, setProjectType] = useState('');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [customArea, setCustomArea] = useState('');
  const [componentType, setComponentType] = useState('Fenster');
  const [count, setCount] = useState(1);
  const [elements, setElements] = useState<ElementItem[]>([]);

  function nav(next: Step) { setHistory(h => [...h, step]); setStep(next); }
  function back() { setHistory(h => { const prev = h[h.length - 1]; if (prev) setStep(prev); return h.slice(0, -1); }); }

  const cities = PLZ[zip] || [];
  const subtotal = elements.reduce((sum, e) => sum + e.price * e.count, 0);
  const smallOrder = subtotal > 0 && subtotal < 1000;
  const fees = smallOrder ? 185 : 0;
  const net = subtotal + fees;
  const vat = net * 0.081;
  const gross = net + vat;

  function currentArea() { return customArea || area; }
  function addElement(product = 'SP6') {
    const prefix = (currentArea().charAt(0) || 'B').toUpperCase();
    const nr = elements.filter(e => e.area === currentArea()).length + 1;
    const id = `${prefix}${String(nr).padStart(2, '0')}`;
    const price = componentType === 'Balkontuere' ? 1430 : componentType === 'Schiebetuere' ? 1850 : componentType === 'Lichtschacht' ? 290 : 385;
    setElements(e => [...e, { id, area: currentArea(), type: componentType, count, product, price }]);
  }

  const progress = useMemo(() => ({ welcome: 5, projectType: 12, location: 20, area: 30, component: 42, count: 50, photo: 58, situation: 68, material: 76, shutter: 84, measure: 92, summary: 100 }[step]), [step]);

  return (
    <main className="page">
      <section className="card">
        <Header progress={progress} />
        {history.length > 0 && step !== 'welcome' && <button className="back" onClick={back}>← Zurueck</button>}

        {step === 'welcome' && <>
          <h1>👋 Haerzlech wiukomme.</h1>
          <p>Lassen Sie uns gemeinsam durch Ihr Zuhause gehen. Wir erfassen Bereich fuer Bereich und erstellen eine erste Kostenschaetzung.</p>
          <div className="actions"><button className="primary" onClick={() => nav('projectType')}>Projekt starten</button></div>
        </>}

        {step === 'projectType' && <>
          <h2>Worum geht es?</h2>
          <p>Kurz zum Projekt. Danach starten wir den Rundgang.</p>
          <div className="grid">
            {['Bestehendes Zuhause verbessern', 'Umbau / Sanierung', 'Neubau', 'Geschaeft / Praxis'].map((x, i) => <button key={x} className={`choice ${projectType===x?'active':''}`} onClick={() => { setProjectType(x); setTimeout(() => nav('location'), 250); }}><span className="icon">{['🏠','🔨','🏗️','🏢'][i]}</span>{x}</button>)}
          </div>
        </>}

        {step === 'location' && <>
          <h2>Wo befindet sich das Projekt?</h2>
          <div className="field"><label>Adresse</label><input value={address} onChange={e=>setAddress(e.target.value)} placeholder="z.B. Bernstrasse 23" /></div>
          <div className="field"><label>PLZ</label><input value={zip} onChange={e=>{ setZip(e.target.value); const found = PLZ[e.target.value]; if (found?.length === 1) setCity(found[0]); }} placeholder="z.B. 3127" /></div>
          <div className="field"><label>Ort</label><input value={city} onChange={e=>setCity(e.target.value)} placeholder="z.B. Muehlethurnen" /></div>
          {cities.length > 1 && <div className="suggestions"><label><b>Ort auswaehlen</b></label>{cities.map(c => <button key={c} className="suggestion" onClick={() => setCity(c)}>{c}</button>)}</div>}
          <div className="actions"><button className="primary" onClick={() => nav('area')}>Weiter</button></div>
        </>}

        {step === 'area' && <>
          <h2>Welchen Bereich schauen wir an?</h2>
          <p>Sie koennen einen Vorschlag waehlen oder frei erfassen.</p>
          <div className="grid">{['Wohnzimmer','Schlafzimmer','Kueche','Bad','Terrasse','Keller'].map(x => <button key={x} className={`choice ${area===x?'active':''}`} onClick={() => { setArea(x); setCustomArea(''); nav('component'); }}>{x}</button>)}</div>
          <div className="field"><label>Anderer Bereich</label><input value={customArea} onChange={e=>setCustomArea(e.target.value)} placeholder="z.B. Wintergarten" /></div>
          <div className="actions"><button className="primary" disabled={!area && !customArea} onClick={() => nav('component')}>Bereich erfassen</button></div>
        </>}

        {step === 'component' && <>
          <h2>{currentArea()}: Was moechten Sie erfassen?</h2>
          <div className="grid">{['Fenster','Balkontuere','Schiebetuere','Lichtschacht'].map(x => <button key={x} className="choice" onClick={() => { setComponentType(x); nav('count'); }}>{x}</button>)}</div>
        </>}

        {step === 'count' && <>
          <h2>Wie viele gleiche Elemente sind es?</h2>
          <div className="actions"><button className="secondary" onClick={() => setCount(Math.max(1, count-1))}>−</button><div style={{fontSize:44, fontWeight:900, padding:'4px 28px'}}>{count}</div><button className="secondary" onClick={() => setCount(count+1)}>+</button></div>
          <p>Wenn die Elemente gleich aufgebaut sind, erfassen wir sie nur einmal.</p>
          <div className="actions"><button className="primary" onClick={() => nav('photo')}>Weiter</button></div>
        </>}

        {step === 'photo' && <>
          <h2>Foto zu {currentArea()}</h2>
          <p>Im Pilot wird das Foto nur simuliert. Spaeter wird es direkt dem Bauteil zugeordnet.</p>
          <div className="actions"><button className="primary" onClick={() => nav('situation')}>Foto simulieren</button><button className="secondary" onClick={() => nav('situation')}>Weiter ohne Foto</button></div>
        </>}

        {step === 'situation' && <>
          <h2>Welche Fenstersituation passt?</h2>
          <div className="grid">
            {['Normales Fenster','Stulpfenster','Flaechenbuendig','Weiss ich nicht'].map((x,i) => <button key={x} className="choice material-card" onClick={() => nav('material')}><span className="symbol">{['🪟','🪟','▣','?'][i]}</span><span>{x}</span></button>)}
          </div>
        </>}

        {step === 'material' && <>
          <h2>Aus welchem Material ist das Fenster?</h2>
          <div className="grid">
            <button className="choice material-card" onClick={() => nav('shutter')}><span className="symbol">🪵</span><span>Holz</span></button>
            <button className="choice material-card" onClick={() => nav('shutter')}><span className="symbol">□</span><span>Kunststoff<br/><small>Fluegelrahmen oft auf Gehrung sichtbar.</small></span></button>
            <button className="choice material-card" onClick={() => nav('shutter')}><span className="symbol">◩</span><span>Holz-Alu</span></button>
            <button className="choice" onClick={() => nav('shutter')}>Weiss ich nicht</button>
          </div>
        </>}

        {step === 'shutter' && <>
          <h2>Gibt es Rollladen, Raffstore oder Jalousie?</h2>
          <div className="grid">
            {['Nein','Ja, Rollladen','Ja, Raffstore','Ja, Jalousie','Weiss ich nicht'].map((x,i) => <button key={x} className="choice material-card" onClick={() => nav('measure')}><span className="symbol">{['—','▤','≋','▥','?'][i]}</span><span>{x}</span></button>)}
          </div>
        </>}

        {step === 'measure' && <>
          <h2>Masse erfassen</h2>
          <p>Fuer den Pilot reicht ein Richtwert. Vor Ort nehmen wir spaeter sauber Mass.</p>
          <div className="grid"><div className="field"><label>Breite mm</label><input placeholder="z.B. 900" /></div><div className="field"><label>Hoehe mm</label><input placeholder="z.B. 1200" /></div></div>
          <div className="actions"><button className="primary" onClick={() => { addElement('SP6'); nav('summary'); }}>Element speichern</button></div>
        </>}

        {step === 'summary' && <>
          <h2>Ihr Zuhause ist erfasst.</h2>
          <p>Hier ist die erste Kostenschaetzung.</p>
          <Estimate subtotal={subtotal} fees={fees} vat={vat} gross={gross} />
          <div className="note"><b>Naechster Schritt:</b><br/>Fuer eine verbindliche Offerte pruefen wir Ihr Projekt vor Ort. Fuer Beratung, Anfahrt und Aufmass verrechnen wir CHF 150.– exkl. MWST. Bei Auftragserteilung wird dieser Betrag vollstaendig angerechnet. Wenn das Projekt nicht ausgefuehrt wird, bleibt dieser Kostenanteil fuer die Beratung bestehen.</div>
          <div className="actions"><button className="primary">Beratung anfragen</button><button className="secondary" onClick={() => nav('area')}>Noch einen Bereich erfassen</button></div>
        </>}
      </section>
      <Sidebar elements={elements} subtotal={subtotal} fees={fees} vat={vat} gross={gross} />
    </main>
  );
}

function Header({progress}:{progress:number}) { return <><div className="logo">BIGLER</div><div className="claim">Wohnloesungen, die begeistern.</div><div className="progress" style={{'--value': `${progress}%`} as React.CSSProperties}><div /></div></>; }

function Sidebar({elements, subtotal, fees, vat, gross}:{elements:ElementItem[], subtotal:number, fees:number, vat:number, gross:number}) {
  return <aside className="card side"><h3>🏠 Ihr Projekt</h3><div className="line" />{elements.length===0 ? <p>Noch keine Bauteile erfasst.</p> : elements.map(e => <div className="item" key={e.id}><span><b>{e.area}</b><br/>{e.id} · {e.type} · {e.count} Stk.</span><span className="money">{chf(e.price*e.count)}</span></div>)}<div className="line"/><div className="item"><span>Zwischentotal exkl. MWST</span><b>{chf(subtotal+fees)}</b></div><div className="item"><span>MWST 8.1 %</span><b>{chf(vat)}</b></div><div className="line"/><div className="total"><span>Total inkl. MWST</span><span>{chf(gross)}</span></div></aside>
}

function Estimate({subtotal, fees, vat, gross}:{subtotal:number, fees:number, vat:number, gross:number}) {
  return <div className="card" style={{boxShadow:'none', padding:20}}><div className="item"><span>Produkte / Leistungen</span><b>{chf(subtotal)}</b></div>{fees>0 && <><div className="item"><span>Auftragspauschale</span><b>{chf(100)}</b></div><div className="item"><span>Lieferpauschale</span><b>{chf(85)}</b></div></>}<div className="line"/><div className="total"><span>Zwischentotal exkl. MWST</span><span>{chf(subtotal+fees)}</span></div><div className="item"><span>MWST 8.1 %</span><b>{chf(vat)}</b></div><div className="line"/><div className="total"><span>Geschaetzter Gesamtbetrag inkl. MWST</span><span>{chf(gross)}</span></div></div>
}
