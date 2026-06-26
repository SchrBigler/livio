'use client';
import { useMemo, useState } from 'react';

type Step = 'welcome' | 'projectType' | 'location' | 'area' | 'component' | 'count' | 'photo' | 'situation' | 'material' | 'shutter' | 'measure' | 'saved' | 'summary';

type ElementStatus = 'estimated' | 'manual-review';

type ElementItem = {
  id: string;
  area: string;
  type: string;
  count: number;
  product: string;
  price: number;
  width: number;
  height: number;
  status: ElementStatus;
  note?: string;
};

const PLZ: Record<string, string[]> = {
  '3127': ['Mühlethurnen', 'Lohnstorf'],
  '3123': ['Belp'],
  '3132': ['Riggisberg'],
  '3600': ['Thun'],
  '3011': ['Bern'],
  '3007': ['Bern'],
  '3145': ['Niederscherli']
};

const PRODUCT_LIMITS = {
  SP6: {
    label: 'Spannrahmen SP6',
    maxWidth: 2000,
    maxHeight: 2200,
    source: 'ISN Spannrahmen Preisliste 3'
  },
  PL2: {
    label: 'Plissee',
    maxWidth: 1800,
    maxHeight: 2600,
    source: 'Pilot-Grenzwert, später aus ISN-Preisliste ersetzen'
  },
  LS: {
    label: 'Lichtschachtabdeckung',
    maxWidth: 2000,
    maxHeight: 1200,
    source: 'Pilot-Grenzwert, später aus ISN-Preisliste ersetzen'
  }
};

function chf(n: number) {
  return `CHF ${n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function slugType(t: string) {
  return t.replace('ü', 'ue').replace('ä', 'ae').replace('ö', 'oe');
}

function getRecommendation(type: string) {
  const normalized = slugType(type);
  if (normalized === 'Lichtschacht') return { product: 'LS', price: 290 };
  if (normalized === 'Balkontuere') return { product: 'PL2', price: 1430 };
  if (normalized === 'Schiebetuere') return { product: 'PL2', price: 1850 };
  return { product: 'SP6', price: 385 };
}

function checkLimit(product: string, width: number, height: number) {
  const limit = PRODUCT_LIMITS[product as keyof typeof PRODUCT_LIMITS] || PRODUCT_LIMITS.SP6;
  if (!width || !height) {
    return {
      ok: false,
      label: limit.label,
      text: 'Masse fehlen. Dieses Element wird für die Beratung markiert.'
    };
  }
  if (width > limit.maxWidth || height > limit.maxHeight) {
    return {
      ok: false,
      label: limit.label,
      text: `${limit.label}: ${width} × ${height} mm liegt ausserhalb der aktuell hinterlegten Maximalmasse (${limit.maxWidth} × ${limit.maxHeight} mm). Wir prüfen vor Ort eine passende Alternative.`
    };
  }
  return { ok: true, label: limit.label, text: `${limit.label}: innerhalb der hinterlegten Maximalmasse.` };
}

function Sketch({ type }: { type: string }) {
  return <span className="sketch" aria-hidden="true">
    {type === 'logo' && <svg viewBox="0 0 120 80"><path d="M16 52 C28 24 48 16 60 16 C72 16 92 24 104 52"/><path d="M26 55 C38 38 50 31 60 31 C70 31 82 38 94 55"/><path d="M39 58 C47 50 54 46 60 46 C66 46 73 50 81 58"/><path d="M47 66 H73"/></svg>}
    {type === 'home' && <svg viewBox="0 0 80 80"><path d="M14 42 L40 18 L66 42"/><path d="M22 40 V64 H58 V40"/><path d="M33 64 V49 H47 V64"/><path d="M28 45 H36"/><path d="M46 45 H54"/></svg>}
    {type === 'hammer' && <svg viewBox="0 0 80 80"><path d="M28 20 L48 40"/><path d="M44 18 L62 36"/><path d="M50 42 L28 64"/><path d="M23 59 L34 70"/></svg>}
    {type === 'newbuild' && <svg viewBox="0 0 80 80"><path d="M18 62 H62"/><path d="M24 62 V34 H52 V62"/><path d="M52 42 H63 V62"/><path d="M28 42 H36 M42 42 H49 M28 51 H36 M42 51 H49"/><path d="M60 28 V62"/><path d="M54 28 H66"/></svg>}
    {type === 'business' && <svg viewBox="0 0 80 80"><rect x="20" y="18" width="40" height="48"/><path d="M30 28 H36 M44 28 H50 M30 38 H36 M44 38 H50 M30 48 H36 M44 48 H50"/><path d="M35 66 V56 H45 V66"/></svg>}
    {type === 'window' && <svg viewBox="0 0 80 80"><rect x="20" y="14" width="40" height="52"/><path d="M40 14 V66 M20 40 H60"/><path d="M28 24 L36 36 M52 24 L44 36"/></svg>}
    {type === 'stulp' && <svg viewBox="0 0 80 80"><rect x="16" y="14" width="48" height="52"/><path d="M40 14 V66"/><path d="M36 39 H44"/><path d="M24 23 L36 36 M56 23 L44 36"/><path d="M38 14 V66 M42 14 V66"/></svg>}
    {type === 'flush' && <svg viewBox="0 0 80 80"><rect x="17" y="17" width="46" height="46"/><rect x="28" y="28" width="24" height="24"/><path d="M17 63 H63 M17 17 H63"/><path d="M63 17 V63"/></svg>}
    {type === 'unknown' && <svg viewBox="0 0 80 80"><path d="M31 29 C32 21 49 20 51 31 C53 41 40 41 40 50"/><path d="M40 59 L40 60"/></svg>}
    {type === 'wood' && <svg viewBox="0 0 80 80"><rect x="20" y="16" width="40" height="48"/><path d="M30 18 C24 31 35 42 28 63 M44 18 C55 34 38 43 50 63"/><path d="M28 26 H52 M28 55 H52"/></svg>}
    {type === 'plastic' && <svg viewBox="0 0 80 80"><rect x="20" y="16" width="40" height="48"/><path d="M20 16 L60 64 M60 16 L20 64"/><rect x="30" y="27" width="20" height="26"/><path d="M30 27 L50 53 M50 27 L30 53"/></svg>}
    {type === 'woodalu' && <svg viewBox="0 0 80 80"><rect x="18" y="18" width="44" height="44"/><path d="M18 18 H62 V30 H30 V62 H18 Z"/><path d="M34 36 L58 36 M34 44 L58 44 M34 52 L58 52"/></svg>}
    {type === 'none' && <svg viewBox="0 0 80 80"><rect x="22" y="18" width="36" height="44"/><path d="M22 18 L58 62"/></svg>}
    {type === 'rollladen' && <svg viewBox="0 0 80 80"><rect x="22" y="18" width="36" height="46"/><path d="M22 20 H58 M22 27 H58 M22 34 H58 M22 41 H58 M22 48 H58"/><path d="M20 13 H60"/></svg>}
    {type === 'raffstore' && <svg viewBox="0 0 80 80"><rect x="20" y="18" width="40" height="46"/><path d="M20 28 L60 23 M20 39 L60 34 M20 50 L60 45"/><path d="M24 15 H56"/></svg>}
    {type === 'jalousie' && <svg viewBox="0 0 80 80"><rect x="20" y="18" width="40" height="46"/><path d="M28 18 V64 M40 18 V64 M52 18 V64"/><path d="M20 28 H60 M20 42 H60 M20 56 H60"/></svg>}
    {type === 'door' && <svg viewBox="0 0 80 80"><rect x="24" y="12" width="32" height="56"/><path d="M49 40 L51 40"/><path d="M32 20 L48 34"/></svg>}
    {type === 'slider' && <svg viewBox="0 0 80 80"><rect x="14" y="18" width="52" height="44"/><path d="M40 18 V62"/><path d="M26 68 H54 M48 68 L56 62"/></svg>}
    {type === 'shaft' && <svg viewBox="0 0 80 80"><ellipse cx="40" cy="50" rx="27" ry="12"/><path d="M18 32 H62 M22 38 H58 M26 44 H54"/><path d="M18 32 L40 50 L62 32"/></svg>}
  </span>
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
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [lastElement, setLastElement] = useState<ElementItem | null>(null);
  const [elements, setElements] = useState<ElementItem[]>([]);

  function nav(next: Step) { setHistory(h => [...h, step]); setStep(next); }
  function back() { setHistory(h => { const prev = h[h.length - 1]; if (prev) setStep(prev); return h.slice(0, -1); }); }

  const cities = PLZ[zip] || [];
  const pricedElements = elements.filter(e => e.status === 'estimated');
  const manualElements = elements.filter(e => e.status === 'manual-review');
  const subtotal = pricedElements.reduce((sum, e) => sum + e.price * e.count, 0);
  const smallOrder = subtotal > 0 && subtotal < 1000;
  const fees = smallOrder ? 185 : 0;
  const net = subtotal + fees;
  const vat = net * 0.081;
  const gross = net + vat;

  function currentArea() { return customArea || area; }
  function resetElementInputs() { setCount(1); setWidth(''); setHeight(''); }
  function chooseComponent(type: string) { setComponentType(type); resetElementInputs(); nav('count'); }
  function addElement() {
    const prefix = (currentArea().charAt(0) || 'B').toUpperCase();
    const nr = elements.filter(e => e.area === currentArea()).length + 1;
    const id = `${prefix}${String(nr).padStart(2, '0')}`;
    const recommendation = getRecommendation(componentType);
    const widthNumber = Number(width);
    const heightNumber = Number(height);
    const limitCheck = checkLimit(recommendation.product, widthNumber, heightNumber);
    const item: ElementItem = {
      id,
      area: currentArea(),
      type: componentType,
      count,
      product: recommendation.product,
      price: limitCheck.ok ? recommendation.price : 0,
      width: widthNumber,
      height: heightNumber,
      status: limitCheck.ok ? 'estimated' : 'manual-review',
      note: limitCheck.ok ? undefined : limitCheck.text
    };
    setElements(e => [...e, item]);
    setLastElement(item);
    resetElementInputs();
  }
  function closeArea() { setArea(''); setCustomArea(''); resetElementInputs(); nav('area'); }

  const currentRecommendation = getRecommendation(componentType);
  const currentLimit = PRODUCT_LIMITS[currentRecommendation.product as keyof typeof PRODUCT_LIMITS] || PRODUCT_LIMITS.SP6;
  const liveLimit = checkLimit(currentRecommendation.product, Number(width), Number(height));

  const progress = useMemo(() => ({ welcome: 5, projectType: 12, location: 20, area: 30, component: 42, count: 50, photo: 58, situation: 68, material: 76, shutter: 84, measure: 90, saved: 94, summary: 100 }[step]), [step]);

  return (
    <main className="page">
      <section className="card">
        <Header progress={progress} />
        {history.length > 0 && step !== 'welcome' && <button className="back" onClick={back}>← Zurück</button>}

        {step === 'welcome' && <>
          <h1><Sketch type="logo" /> Härzlech willkomme.</h1>
          <p>Lassen Sie uns gemeinsam durch Ihr Zuhause gehen. Wir erfassen Bereich für Bereich und erstellen eine erste Kostenschätzung.</p>
          <div className="actions"><button className="primary" onClick={() => nav('projectType')}>Projekt starten</button></div>
        </>}

        {step === 'projectType' && <>
          <h2>Worum geht es?</h2>
          <p>Kurz zum Projekt. Danach starten wir den Rundgang.</p>
          <div className="grid">
            {[
              ['Bestehendes Zuhause verbessern','home'], ['Umbau / Sanierung','hammer'], ['Neubau','newbuild'], ['Geschäft / Praxis','business']
            ].map(([x, icon]) => <button key={x} className={`choice icon-choice ${projectType===x?'active':''}`} onClick={() => { setProjectType(x); setTimeout(() => nav('location'), 250); }}><Sketch type={icon} /><span>{x}</span></button>)}
          </div>
        </>}

        {step === 'location' && <>
          <h2>Wo befindet sich das Projekt?</h2>
          <div className="field"><label>Adresse</label><input value={address} onChange={e=>setAddress(e.target.value)} placeholder="z.B. Bernstrasse 23" /></div>
          <div className="field"><label>PLZ</label><input value={zip} onChange={e=>{ const value=e.target.value; setZip(value); const found = PLZ[value]; if (found?.length === 1) setCity(found[0]); if (!found) setCity(''); }} placeholder="z.B. 3127" /></div>
          <div className="field"><label>Ort</label><input value={city} onChange={e=>setCity(e.target.value)} placeholder="z.B. Mühlethurnen" /></div>
          {cities.length > 1 && <div className="suggestions"><label><b>Ort auswählen</b></label>{cities.map(c => <button key={c} className={`suggestion ${city===c?'selected':''}`} onClick={() => setCity(c)}>{c}</button>)}</div>}
          <div className="actions"><button className="primary" onClick={() => nav('area')}>Weiter</button></div>
        </>}

        {step === 'area' && <>
          <h2>Welchen Bereich schauen wir an?</h2>
          <p>Sie können einen Vorschlag wählen oder frei erfassen.</p>
          <div className="grid">{['Wohnzimmer','Schlafzimmer','Küche','Bad','Terrasse','Keller'].map(x => <button key={x} className={`choice ${area===x?'active':''}`} onClick={() => { setArea(x); setCustomArea(''); nav('component'); }}>{x}</button>)}</div>
          <div className="field"><label>Anderer Bereich</label><input value={customArea} onChange={e=>setCustomArea(e.target.value)} placeholder="z.B. Wintergarten" /></div>
          <div className="actions"><button className="primary" disabled={!area && !customArea} onClick={() => nav('component')}>Bereich erfassen</button></div>
        </>}

        {step === 'component' && <>
          <h2>{currentArea()}: Was möchten Sie erfassen?</h2>
          <p>Wir bleiben in diesem Bereich, bis Sie ihn bewusst abschliessen.</p>
          <div className="grid">
            <button className="choice icon-choice" onClick={() => chooseComponent('Fenster')}><Sketch type="window" /><span>Fenster</span></button>
            <button className="choice icon-choice" onClick={() => chooseComponent('Balkontüre')}><Sketch type="door" /><span>Balkontüre</span></button>
            <button className="choice icon-choice" onClick={() => chooseComponent('Schiebetüre')}><Sketch type="slider" /><span>Schiebetüre</span></button>
            <button className="choice icon-choice" onClick={() => chooseComponent('Lichtschacht')}><Sketch type="shaft" /><span>Lichtschacht</span></button>
          </div>
          {elements.some(e => e.area === currentArea()) && <div className="actions"><button className="secondary" onClick={closeArea}>Bereich abschliessen</button><button className="primary" onClick={() => nav('summary')}>Projekt abschliessen</button></div>}
        </>}

        {step === 'count' && <>
          <h2>Wie viele gleiche Elemente sind es?</h2>
          <div className="actions"><button className="secondary counter" onClick={() => setCount(Math.max(1, count-1))}>−</button><div className="count">{count}</div><button className="secondary counter" onClick={() => setCount(count+1)}>+</button></div>
          <p>Wenn die Elemente gleich aufgebaut sind, erfassen wir sie nur einmal.</p>
          <div className="actions"><button className="primary" onClick={() => nav('photo')}>Weiter</button></div>
        </>}

        {step === 'photo' && <>
          <h2>Foto zu {currentArea()}</h2>
          <p>Im Pilot wird das Foto nur simuliert. Später wird es direkt dem Bauteil zugeordnet.</p>
          <div className="actions"><button className="primary" onClick={() => nav('situation')}>Foto simulieren</button><button className="secondary" onClick={() => nav('situation')}>Weiter ohne Foto</button></div>
        </>}

        {step === 'situation' && <>
          <h2>Welche Fenstersituation passt?</h2>
          <div className="grid">
            {[
              ['Normales Fenster','window'], ['Stulpfenster','stulp'], ['Flächenbündig','flush'], ['Weiss ich nicht','unknown']
            ].map(([x, icon]) => <button key={x} className="choice icon-choice" onClick={() => nav('material')}><Sketch type={icon} /><span>{x}</span></button>)}
          </div>
        </>}

        {step === 'material' && <>
          <h2>Aus welchem Material ist das Fenster?</h2>
          <div className="grid">
            <button className="choice icon-choice" onClick={() => nav('shutter')}><Sketch type="wood" /><span>Holz</span></button>
            <button className="choice icon-choice" onClick={() => nav('shutter')}><Sketch type="plastic" /><span>Kunststoff<br/><small>Flügelrahmen oft auf Gehrung sichtbar.</small></span></button>
            <button className="choice icon-choice" onClick={() => nav('shutter')}><Sketch type="woodalu" /><span>Holz-Alu</span></button>
            <button className="choice icon-choice" onClick={() => nav('shutter')}><Sketch type="unknown" /><span>Weiss ich nicht</span></button>
          </div>
        </>}

        {step === 'shutter' && <>
          <h2>Gibt es Rollladen, Raffstore oder Jalousie?</h2>
          <div className="grid">
            {[
              ['Nein','none'], ['Ja, Rollladen','rollladen'], ['Ja, Raffstore','raffstore'], ['Ja, Jalousie','jalousie'], ['Weiss ich nicht','unknown']
            ].map(([x, icon]) => <button key={x} className="choice icon-choice" onClick={() => nav('measure')}><Sketch type={icon} /><span>{x}</span></button>)}
          </div>
        </>}

        {step === 'measure' && <>
          <h2>Masse erfassen</h2>
          <p>Für den Pilot reicht ein Richtwert. Vor Ort nehmen wir später sauber Mass.</p>
          <div className="limit-card"><b>Technische Vorprüfung</b><br/>{currentLimit.label}: hinterlegte Maximalmasse {currentLimit.maxWidth} × {currentLimit.maxHeight} mm. Grössere Elemente werden nicht automatisch offeriert, sondern für die Beratung markiert.</div>
          <div className="grid"><div className="field"><label>Breite mm</label><input value={width} onChange={e=>setWidth(e.target.value)} placeholder="z.B. 900" inputMode="numeric" /></div><div className="field"><label>Höhe mm</label><input value={height} onChange={e=>setHeight(e.target.value)} placeholder="z.B. 1200" inputMode="numeric" /></div></div>
          {(width || height) && <div className={liveLimit.ok ? 'ok-box' : 'warn-box'}>{liveLimit.text}</div>}
          <div className="actions"><button className="primary" onClick={() => { addElement(); nav('saved'); }}>Element speichern</button></div>
        </>}

        {step === 'saved' && <>
          <h2>Element gespeichert ✅</h2>
          <p>{lastElement ? `${lastElement.count} × ${lastElement.type} im Bereich ${lastElement.area} wurde erfasst.` : 'Das Element wurde erfasst.'}</p>
          {lastElement?.status === 'manual-review' && <div className="warn-box"><b>Zur Prüfung markiert.</b><br/>{lastElement.note}</div>}
          <h3>Darf es in diesem Bereich noch etwas mehr sein?</h3>
          <div className="grid">
            <button className="choice icon-choice" onClick={() => chooseComponent('Fenster')}><Sketch type="window" /><span>Weiteres Fenster</span></button>
            <button className="choice icon-choice" onClick={() => chooseComponent('Balkontüre')}><Sketch type="door" /><span>Balkontüre</span></button>
            <button className="choice icon-choice" onClick={() => chooseComponent('Schiebetüre')}><Sketch type="slider" /><span>Schiebetüre</span></button>
            <button className="choice icon-choice" onClick={() => chooseComponent('Lichtschacht')}><Sketch type="shaft" /><span>Lichtschacht</span></button>
          </div>
          <div className="actions"><button className="secondary" onClick={closeArea}>Bereich abschliessen</button><button className="primary" onClick={() => nav('summary')}>Projekt abschliessen</button></div>
        </>}

        {step === 'summary' && <>
          <h2>Ihr Zuhause ist erfasst.</h2>
          <p>Gemeinsam haben wir Ihre Angaben aufgenommen und daraus eine erste Kostenschätzung erstellt.</p>
          {manualElements.length > 0 && <div className="warn-box"><b>{manualElements.length} Element(e) benötigen eine manuelle Prüfung.</b><br/>Diese Positionen sind nicht im Betrag eingerechnet, damit wir nichts technisch Unmögliches offerieren.</div>}
          <Estimate subtotal={subtotal} fees={fees} vat={vat} gross={gross} />
          <div className="note"><b>Nächster Schritt:</b><br/>Für eine verbindliche Offerte prüfen wir Ihr Projekt vor Ort. Dabei kontrollieren wir die Einbausituation, nehmen die exakten Masse auf und prüfen, ob eine noch bessere oder wirtschaftlichere Lösung sinnvoll ist. Für Beratung, Anfahrt und Aufmass verrechnen wir CHF 150.– exkl. MWST. Bei Auftragserteilung wird dieser Betrag vollständig angerechnet. Wenn das Projekt nicht ausgeführt wird, bleibt dieser Kostenanteil für die Beratung bestehen.</div>
          <div className="actions"><button className="primary">Beratung anfragen</button><button className="secondary" onClick={() => nav('area')}>Noch einen Bereich erfassen</button></div>
        </>}
      </section>
      <Sidebar elements={elements} subtotal={subtotal} fees={fees} vat={vat} gross={gross} />
    </main>
  );
}

function Header({progress}:{progress:number}) { return <><div className="brand"><Sketch type="logo" /><div><div className="logo">BIGLER</div><div className="claim">Wohnlösungen, die begeistern.</div></div></div><div className="progress" style={{'--value': `${progress}%`} as React.CSSProperties}><div /></div></>; }

function Sidebar({elements, subtotal, fees, vat, gross}:{elements:ElementItem[], subtotal:number, fees:number, vat:number, gross:number}) {
  return <aside className="card side"><h3>Ihr Projekt</h3><div className="line" />{elements.length===0 ? <p>Noch keine Bauteile erfasst.</p> : elements.map(e => <div className="item" key={e.id}><span><b>{e.area}</b><br/>{e.id} · {e.type} · {e.count} Stk.<br/><small>{e.width || '?'} × {e.height || '?'} mm · {e.status === 'manual-review' ? 'Prüfen' : e.product}</small></span><span className="money">{e.status === 'manual-review' ? 'Prüfen' : chf(e.price*e.count)}</span></div>)}<div className="line"/><div className="item"><span>Zwischentotal exkl. MWST</span><b>{chf(subtotal+fees)}</b></div><div className="item"><span>MWST 8.1 %</span><b>{chf(vat)}</b></div><div className="line"/><div className="total"><span>Total inkl. MWST</span><span>{chf(gross)}</span></div></aside>
}

function Estimate({subtotal, fees, vat, gross}:{subtotal:number, fees:number, vat:number, gross:number}) {
  return <div className="estimate"><div className="item"><span>Produkte / Leistungen</span><b>{chf(subtotal)}</b></div>{fees>0 && <><div className="item"><span>Auftragspauschale</span><b>{chf(100)}</b></div><div className="item"><span>Lieferpauschale</span><b>{chf(85)}</b></div></>}<div className="line"/><div className="total"><span>Zwischentotal exkl. MWST</span><span>{chf(subtotal+fees)}</span></div><div className="item"><span>MWST 8.1 %</span><b>{chf(vat)}</b></div><div className="line"/><div className="total"><span>Geschätzter Gesamtbetrag inkl. MWST</span><span>{chf(gross)}</span></div></div>
}
