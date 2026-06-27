'use client';

import { useMemo, useState } from 'react';

type Step =
  | 'welcome'
  | 'projectType'
  | 'location'
  | 'area'
  | 'component'
  | 'count'
  | 'photo'
  | 'situation'
  | 'material'
  | 'shutter'
  | 'product'
  | 'measure'
  | 'saved'
  | 'summary'
  | 'request';

type ElementStatus = 'estimated' | 'manual-review';
type PhotoItem = { name: string; url: string; size: number };
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
  photos: PhotoItem[];
  overmassAccepted?: boolean;
};

type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  timeframe: string;
  note: string;
};

const PLZ: Record<string, string[]> = {
  '3007': ['Bern'],
  '3011': ['Bern'],
  '3123': ['Belp'],
  '3127': ['Mühlethurnen', 'Lohnstorf'],
  '3132': ['Riggisberg'],
  '3145': ['Niederscherli'],
  '3421': ['Lyssach'],
  '3600': ['Thun'],
};

const PRODUCT_LIMITS: Record<string, { label: string; maxWidth: number; maxHeight: number; price: number; icon: string }> = {
  'SP6/2': { label: 'Spannrahmen', maxWidth: 2000, maxHeight: 2200, price: 385, icon: 'window' },
  ROLLO: { label: 'Rollo', maxWidth: 2200, maxHeight: 2400, price: 520, icon: 'rollo' },
  PL2: { label: 'Plissee', maxWidth: 1800, maxHeight: 2600, price: 1430, icon: 'plissee' },
  SCHIEBE: { label: 'Schiebetüre', maxWidth: 3000, maxHeight: 2600, price: 1850, icon: 'slider' },
  PENDEL: { label: 'Pendeltüre', maxWidth: 1200, maxHeight: 2400, price: 980, icon: 'pendel' },
  DREH: { label: 'Drehtüre', maxWidth: 1200, maxHeight: 2400, price: 880, icon: 'door' },
  LS: { label: 'Lichtschachtabdeckung', maxWidth: 2000, maxHeight: 1200, price: 290, icon: 'shaft' },
  PRUEFEN: { label: 'Weiss ich nicht / prüfen', maxWidth: 9999, maxHeight: 9999, price: 0, icon: 'unknown' },
};

function chf(n: number) {
  return `CHF ${n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function productLabel(code: string) {
  const p = PRODUCT_LIMITS[code];
  if (!p) return code;
  return `${code} · ${p.label}`;
}

function recommend(type: string) {
  if (type === 'Lichtschacht') return 'LS';
  if (type === 'Balkontüre') return 'PL2';
  if (type === 'Schiebetüre') return 'SCHIEBE';
  return 'SP6/2';
}

function checkLimit(product: string, width: number, height: number) {
  const l = PRODUCT_LIMITS[product] || PRODUCT_LIMITS['SP6/2'];
  if (!width || !height) {
    return { ok: false, text: 'Masse fehlen. Dieses Element wird für die Beratung markiert.' };
  }
  if (width > l.maxWidth || height > l.maxHeight) {
    return {
      ok: false,
      text: `${product} · ${l.label}: ${width} × ${height} mm liegt ausserhalb der hinterlegten Maximalmasse (${l.maxWidth} × ${l.maxHeight} mm). Bitte bestätigen, dass Bigler dieses Übermass vor Ort prüft.`,
    };
  }
  return { ok: true, text: `${product} · ${l.label}: innerhalb der hinterlegten Maximalmasse.` };
}

function idPrefix(type: string, area: string) {
  if (type === 'Fenster') return 'F';
  if (type === 'Balkontüre') return 'B';
  if (type === 'Schiebetüre') return 'S';
  if (type === 'Lichtschacht') return 'L';
  return (area.charAt(0) || 'E').toUpperCase();
}

function Sketch({ type }: { type: string }) {
  return (
    <span className="sketch" aria-hidden="true">
      {type === 'home' && <svg viewBox="0 0 80 80"><path d="M13 42 40 18 67 42"/><path d="M22 40v25h36V40"/><path d="M33 65V50h14v15"/><path d="M28 45h9m8 0h9"/></svg>}
      {type === 'hammer' && <svg viewBox="0 0 80 80"><path d="M25 20l16 16"/><path d="M38 18l22 22"/><path d="M45 41 24 64"/><path d="m20 60 9 9"/></svg>}
      {type === 'newbuild' && <svg viewBox="0 0 80 80"><path d="M18 63h45"/><path d="M24 63V34h28v29"/><path d="M52 42h11v21"/><path d="M29 43h7m7 0h6m-20 10h7m7 0h6"/><path d="M61 29v34M55 29h12"/></svg>}
      {type === 'business' && <svg viewBox="0 0 80 80"><rect x="20" y="17" width="40" height="49"/><path d="M30 28h6m8 0h6M30 39h6m8 0h6M30 50h6m8 0h6"/><path d="M35 66V56h10v10"/></svg>}
      {type === 'window' && <svg viewBox="0 0 80 80"><rect x="20" y="14" width="40" height="52"/><path d="M40 14v52M20 40h40"/><path d="M28 24l8 12m16-12-8 12"/></svg>}
      {type === 'stulp' && <svg viewBox="0 0 80 80"><rect x="16" y="14" width="48" height="52"/><path d="M38 14v52M42 14v52"/><path d="M26 24l10 12m18-12-10 12"/></svg>}
      {type === 'flush' && <svg viewBox="0 0 80 80"><rect x="18" y="18" width="44" height="44"/><rect x="30" y="30" width="20" height="20"/><path d="M18 62h44M62 18v44"/></svg>}
      {type === 'unknown' && <svg viewBox="0 0 80 80"><path d="M31 29c2-10 19-10 21 0 2 11-12 11-12 21"/><path d="M40 60v1"/></svg>}
      {type === 'wood' && <svg viewBox="0 0 80 80"><rect x="20" y="16" width="40" height="48"/><path d="M30 18c-7 16 6 24-2 45M45 18c11 17-6 28 5 45"/><path d="M28 29h24M28 54h24"/></svg>}
      {type === 'plastic' && <svg viewBox="0 0 80 80"><rect x="20" y="16" width="40" height="48"/><path d="M20 16l40 48M60 16 20 64"/><rect x="30" y="27" width="20" height="26"/></svg>}
      {type === 'woodalu' && <svg viewBox="0 0 80 80"><rect x="18" y="18" width="44" height="44"/><path d="M18 18h44v12H30v32H18z"/><path d="M34 36h24M34 44h24M34 52h24"/></svg>}
      {type === 'none' && <svg viewBox="0 0 80 80"><rect x="22" y="18" width="36" height="44"/><path d="M22 18l36 44"/></svg>}
      {type === 'rollladen' && <svg viewBox="0 0 80 80"><rect x="22" y="18" width="36" height="46"/><path d="M22 23h36M22 30h36M22 37h36M22 44h36M22 51h36"/><path d="M20 13h40"/></svg>}
      {type === 'raffstore' && <svg viewBox="0 0 80 80"><rect x="20" y="18" width="40" height="46"/><path d="M20 29l40-6M20 41l40-6M20 53l40-6"/><path d="M24 14h32"/></svg>}
      {type === 'jalousie' && <svg viewBox="0 0 80 80"><rect x="20" y="18" width="40" height="46"/><path d="M28 18v46M40 18v46M52 18v46"/><path d="M20 30h40M20 43h40M20 56h40"/></svg>}
      {type === 'door' && <svg viewBox="0 0 80 80"><rect x="24" y="12" width="32" height="56"/><path d="M49 40h2"/><path d="M32 20l16 14"/></svg>}
      {type === 'slider' && <svg viewBox="0 0 80 80"><rect x="14" y="18" width="52" height="44"/><path d="M40 18v44"/><path d="M26 68h28m-6 0 8-6"/></svg>}
      {type === 'shaft' && <svg viewBox="0 0 80 80"><ellipse cx="40" cy="50" rx="27" ry="12"/><path d="M18 32h44M22 38h36M26 44h28"/><path d="M18 32l22 18 22-18"/></svg>}
      {type === 'rollo' && <svg viewBox="0 0 80 80"><rect x="22" y="18" width="36" height="42"/><path d="M22 18h36M30 60c6 7 14 7 20 0"/></svg>}
      {type === 'plissee' && <svg viewBox="0 0 80 80"><rect x="22" y="18" width="36" height="44"/><path d="M22 26h36M22 34h36M22 42h36M22 50h36M22 58h36"/></svg>}
      {type === 'pendel' && <svg viewBox="0 0 80 80"><rect x="24" y="14" width="32" height="52"/><path d="M24 40c-10 0-10-18 0-18M56 40c10 0 10 18 0 18"/></svg>}
    </span>
  );
}

export default function Page() {
  const [step, setStep] = useState<Step>('welcome');
  const [history, setHistory] = useState<Step[]>([]);
  const [projectType, setProjectType] = useState('');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [customer, setCustomer] = useState<Customer>({ firstName: '', lastName: '', email: '', phone: '', timeframe: '', note: '' });
  const [area, setArea] = useState('');
  const [customArea, setCustomArea] = useState('');
  const [componentType, setComponentType] = useState('Fenster');
  const [count, setCount] = useState(1);
  const [product, setProduct] = useState('SP6/2');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [overAck, setOverAck] = useState(false);
  const [lastElement, setLastElement] = useState<ElementItem | null>(null);
  const [elements, setElements] = useState<ElementItem[]>([]);

  function nav(next: Step) {
    setHistory(h => [...h, step]);
    setStep(next);
  }

  function back() {
    setHistory(h => {
      const previous = h[h.length - 1];
      if (previous) setStep(previous);
      return h.slice(0, -1);
    });
  }

  function gotoOverview() {
    setHistory(h => [...h, step]);
    setStep('summary');
  }

  const cities = PLZ[zip] || [];
  const priced = elements.filter(e => e.status === 'estimated');
  const manual = elements.filter(e => e.status === 'manual-review');
  const subtotal = priced.reduce((s, e) => s + e.price * e.count, 0);
  const fees = subtotal > 0 && subtotal < 1000 ? 185 : 0;
  const net = subtotal + fees;
  const vat = net * 0.081;
  const gross = net + vat;
  const currentArea = customArea || area;
  const limit = PRODUCT_LIMITS[product] || PRODUCT_LIMITS['SP6/2'];
  const live = checkLimit(product, Number(width), Number(height));
  const progress = useMemo(() => ({
    welcome: 5,
    projectType: 12,
    location: 20,
    area: 30,
    component: 40,
    count: 48,
    photo: 55,
    situation: 62,
    material: 69,
    shutter: 76,
    product: 83,
    measure: 90,
    saved: 94,
    summary: 100,
    request: 100,
  }[step]), [step]);

  function chooseComponent(t: string) {
    setComponentType(t);
    setCount(1);
    setWidth('');
    setHeight('');
    setPhotos([]);
    setOverAck(false);
    setProduct(recommend(t));
    nav('count');
  }

  function nextAfterPhoto() {
    componentType === 'Lichtschacht' ? nav('measure') : nav('situation');
  }

  function addElement() {
    const nr = elements.filter(e => e.area === currentArea && e.type === componentType).length + 1;
    const id = `${idPrefix(componentType, currentArea)}${String(nr).padStart(2, '0')}`;
    const w = Number(width);
    const h = Number(height);
    const c = checkLimit(product, w, h);
    const item: ElementItem = {
      id,
      area: currentArea,
      type: componentType,
      count,
      product,
      price: c.ok ? (PRODUCT_LIMITS[product]?.price || 0) : 0,
      width: w,
      height: h,
      status: c.ok ? 'estimated' : 'manual-review',
      note: c.ok ? undefined : c.text,
      photos,
      overmassAccepted: overAck,
    };

    setElements(e => [...e, item]);
    setLastElement(item);
    setCount(1);
    setWidth('');
    setHeight('');
    setPhotos([]);
    setOverAck(false);
    nav('saved');
  }

  function closeArea() {
    setArea('');
    setCustomArea('');
    setCount(1);
    nav('area');
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const add = Array.from(files).map(f => ({ name: f.name, size: f.size, url: URL.createObjectURL(f) }));
    setPhotos(p => [...p, ...add]);
  }

  function updateZip(v: string) {
    setZip(v);
    const found = PLZ[v];
    if (found?.length === 1) setCity(found[0]);
    if (!found) setCity('');
  }

  function downloadJson() {
    const data = { projekt: { projectType, address, zip, city, customer, created: new Date().toISOString() }, elements, net, vat, gross };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'livio-projekt.json';
    a.click();
  }

  function mailto() {
    const subject = encodeURIComponent('Neue LIVIO Anfrage');
    const body = encodeURIComponent(
      `Neue LIVIO Anfrage\n\n` +
      `Kunde: ${customer.firstName} ${customer.lastName}\n` +
      `E-Mail: ${customer.email}\n` +
      `Telefon: ${customer.phone}\n` +
      `Ausführungszeitraum: ${customer.timeframe}\n` +
      `Bemerkung: ${customer.note}\n\n` +
      `Adresse: ${address}, ${zip} ${city}\n\n` +
      `Elemente: ${elements.length}\n` +
      `Total inkl. MWST: ${chf(gross)}\n\n` +
      `Bitte PDF über Drucken/Als PDF speichern erzeugen und Fotos separat anhängen.`
    );
    window.location.href = `mailto:info@bigler-schreinerei.ch?subject=${subject}&body=${body}`;
  }

  return (
    <main className="page">
      <section className="card">
        <Header progress={progress} />
        <div className="top-actions">
          {history.length > 0 && step !== 'welcome' && <button className="back" onClick={back}>← Zurück</button>}
          {elements.length > 0 && step !== 'summary' && <button className="back" onClick={gotoOverview}>Zur Übersicht</button>}
        </div>

        {step === 'welcome' && <>
          <h1>Härzlech willkomme.</h1>
          <p>Lassen Sie uns gemeinsam durch Ihr Zuhause gehen. Wir erfassen Bereich für Bereich und erstellen eine erste Kostenschätzung.</p>
          <div className="actions"><button className="primary" onClick={() => nav('projectType')}>Projekt starten</button></div>
        </>}

        {step === 'projectType' && <>
          <h2>Worum geht es?</h2>
          <p>Kurz zum Projekt. Danach starten wir den Rundgang.</p>
          <div className="grid">
            {[
              ['Bestehendes Zuhause verbessern', 'home'],
              ['Umbau / Sanierung', 'hammer'],
              ['Neubau', 'newbuild'],
              ['Geschäft / Praxis', 'business'],
            ].map(([x, i]) => <button key={x} className={`choice icon-choice ${projectType === x ? 'active' : ''}`} onClick={() => { setProjectType(x); nav('location'); }}><Sketch type={i} /><span>{x}</span></button>)}
          </div>
        </>}

        {step === 'location' && <>
          <h2>Wo befindet sich das Projekt?</h2>
          <div className="field"><label>Adresse</label><input value={address} onChange={e => setAddress(e.target.value)} placeholder="z.B. Bernstrasse 23" /></div>
          <div className="field"><label>PLZ</label><input value={zip} onChange={e => updateZip(e.target.value)} placeholder="z.B. 3127" inputMode="numeric" /></div>
          <div className="field"><label>Ort</label><input value={city} onChange={e => setCity(e.target.value)} placeholder="z.B. Mühlethurnen" /></div>
          {cities.length > 1 && <div className="suggestions"><b>Ort auswählen</b>{cities.map(c => <button key={c} className={`suggestion ${city === c ? 'selected' : ''}`} onClick={() => setCity(c)}>{c}</button>)}</div>}
          <div className="actions"><button className="primary" onClick={() => nav('area')}>Weiter</button></div>
        </>}

        {step === 'area' && <>
          <h2>Welchen Bereich schauen wir an?</h2>
          <p>Sie können einen Vorschlag wählen oder frei erfassen.</p>
          <div className="grid">
            {[
              ['Wohnzimmer', 'home'],
              ['Schlafzimmer', 'home'],
              ['Küche', 'home'],
              ['Bad', 'home'],
              ['Terrasse', 'home'],
              ['Keller', 'home'],
            ].map(([x, i]) => <button key={x} className={`choice icon-choice ${area === x ? 'active' : ''}`} onClick={() => { setArea(x); setCustomArea(''); nav('component'); }}><Sketch type={i} /><span>{x}</span></button>)}
          </div>
          <div className="field"><label>Anderer Bereich</label><input value={customArea} onChange={e => setCustomArea(e.target.value)} placeholder="z.B. Wintergarten" /></div>
          <div className="actions"><button className="primary" disabled={!area && !customArea} onClick={() => nav('component')}>Bereich erfassen</button></div>
        </>}

        {step === 'component' && <>
          <h2>{currentArea}: Was möchten Sie erfassen?</h2>
          <p>Wir bleiben in diesem Bereich, bis Sie ihn bewusst abschliessen.</p>
          <div className="grid">
            <button className="choice icon-choice" onClick={() => chooseComponent('Fenster')}><Sketch type="window" /><span>Fenster</span></button>
            <button className="choice icon-choice" onClick={() => chooseComponent('Balkontüre')}><Sketch type="door" /><span>Balkontüre</span></button>
            <button className="choice icon-choice" onClick={() => chooseComponent('Schiebetüre')}><Sketch type="slider" /><span>Schiebetüre</span></button>
            <button className="choice icon-choice" onClick={() => chooseComponent('Lichtschacht')}><Sketch type="shaft" /><span>Lichtschacht</span></button>
          </div>
          {elements.some(e => e.area === currentArea) && <div className="actions"><button className="secondary" onClick={closeArea}>Bereich abschliessen</button><button className="primary" onClick={() => nav('summary')}>Zuhause abschliessen</button></div>}
        </>}

        {step === 'count' && <>
          <h2>Wie viele gleiche Elemente sind es?</h2>
          <div className="actions"><button className="secondary counter" onClick={() => setCount(Math.max(1, count - 1))}>−</button><div className="count">{count}</div><button className="secondary counter" onClick={() => setCount(count + 1)}>+</button></div>
          <p>Wenn die Elemente gleich aufgebaut sind, erfassen wir sie nur einmal.</p>
          <div className="actions"><button className="primary" onClick={() => nav('photo')}>Weiter</button></div>
        </>}

        {step === 'photo' && <>
          <h2>Fotos zum Element</h2>
          <p>Fügen Sie ein oder mehrere Fotos hinzu. Auf dem Handy kann direkt die Kamera geöffnet werden.</p>
          <div className="upload"><input type="file" accept="image/*" multiple capture="environment" onChange={e => handleFiles(e.target.files)} /></div>
          {photos.length > 0 && <div className="thumbs">{photos.map((p, i) => <figure key={i}><img src={p.url} alt={p.name} /><figcaption>{p.name}</figcaption></figure>)}</div>}
          <div className="actions"><button className="primary" onClick={nextAfterPhoto}>{photos.length ? 'Weiter' : 'Weiter ohne Foto'}</button></div>
        </>}

        {step === 'situation' && <>
          <h2>Welche Fenstersituation passt?</h2>
          <div className="grid">
            {[
              ['Normales Fenster', 'window'],
              ['Stulpfenster', 'stulp'],
              ['Flächenbündig', 'flush'],
              ['Weiss ich nicht', 'unknown'],
            ].map(([x, i]) => <button key={x} className="choice icon-choice" onClick={() => nav('material')}><Sketch type={i} /><span>{x}</span></button>)}
          </div>
        </>}

        {step === 'material' && <>
          <h2>Aus welchem Material ist das Fenster?</h2>
          <div className="grid">
            <button className="choice icon-choice" onClick={() => nav('shutter')}><Sketch type="wood" /><span>Holz</span></button>
            <button className="choice icon-choice" onClick={() => nav('shutter')}><Sketch type="plastic" /><span>Kunststoff<br /><small>Flügelrahmen oft auf Gehrung sichtbar.</small></span></button>
            <button className="choice icon-choice" onClick={() => nav('shutter')}><Sketch type="woodalu" /><span>Holz-Alu</span></button>
            <button className="choice icon-choice" onClick={() => nav('shutter')}><Sketch type="unknown" /><span>Weiss ich nicht</span></button>
          </div>
        </>}

        {step === 'shutter' && <>
          <h2>Gibt es Rollladen, Raffstore oder Jalousie?</h2>
          <div className="grid">
            {[
              ['Nein', 'none'],
              ['Ja, Rollladen', 'rollladen'],
              ['Ja, Raffstore', 'raffstore'],
              ['Ja, Jalousie', 'jalousie'],
              ['Weiss ich nicht', 'unknown'],
            ].map(([x, i]) => <button key={x} className="choice icon-choice" onClick={() => nav('product')}><Sketch type={i} /><span>{x}</span></button>)}
          </div>
        </>}

        {step === 'product' && <>
          <h2>Welche Lösung möchten Sie prüfen?</h2>
          <p>Unsere Empfehlung ist markiert. Sie können bewusst eine andere Lösung wählen.</p>
          <div className="grid">
            {Object.entries(PRODUCT_LIMITS).map(([code, info]) => <button key={code} className={`choice icon-choice ${product === code ? 'active' : ''}`} onClick={() => { setProduct(code); nav('measure'); }}><Sketch type={info.icon} /><span>{code}<br /><small>{info.label}{code === recommend(componentType) ? ' · Empfehlung' : ''}</small></span></button>)}
          </div>
        </>}

        {step === 'measure' && <>
          <h2>Masse erfassen</h2>
          <p>Für die erste Kostenschätzung reicht ein Richtwert. Vor Ort nehmen wir später sauber Mass.</p>
          <div className="limit-card"><b>Technische Vorprüfung</b><br />{product} · {limit.label}: hinterlegte Maximalmasse {limit.maxWidth} × {limit.maxHeight} mm.</div>
          <div className="grid">
            <div className="field"><label>Breite mm</label><input value={width} onChange={e => { setWidth(e.target.value); setOverAck(false); }} placeholder="z.B. 900" inputMode="numeric" /></div>
            <div className="field"><label>Höhe mm</label><input value={height} onChange={e => { setHeight(e.target.value); setOverAck(false); }} placeholder="z.B. 1200" inputMode="numeric" /></div>
          </div>
          {(width || height) && <div className={live.ok ? 'ok-box' : 'warn-box'}>{live.text}</div>}
          {(width || height) && !live.ok && <label className="check"><input type="checkbox" checked={overAck} onChange={e => setOverAck(e.target.checked)} /> Ich verstehe, dass dieses Element ausserhalb der Standardmasse liegt und von Bigler explizit geprüft werden muss.</label>}
          <div className="actions"><button className="primary" disabled={(!live.ok && !overAck) || !width || !height} onClick={addElement}>Element speichern</button></div>
        </>}

        {step === 'saved' && <>
          <h2>Element gespeichert ✅</h2>
          <p>{lastElement ? `${lastElement.count} × ${lastElement.type} · ${productLabel(lastElement.product)} im Bereich ${lastElement.area} wurde erfasst.` : 'Das Element wurde erfasst.'}</p>
          {lastElement?.status === 'manual-review' && <div className="warn-box"><b>Zur Prüfung markiert.</b><br />{lastElement.note}</div>}
          <h3>Darf es in diesem Bereich noch etwas mehr sein?</h3>
          <div className="grid">
            <button className="choice icon-choice" onClick={() => chooseComponent('Fenster')}><Sketch type="window" /><span>Weiteres Fenster</span></button>
            <button className="choice icon-choice" onClick={() => chooseComponent('Balkontüre')}><Sketch type="door" /><span>Balkontüre</span></button>
            <button className="choice icon-choice" onClick={() => chooseComponent('Schiebetüre')}><Sketch type="slider" /><span>Schiebetüre</span></button>
            <button className="choice icon-choice" onClick={() => chooseComponent('Lichtschacht')}><Sketch type="shaft" /><span>Lichtschacht</span></button>
          </div>
          <div className="actions"><button className="secondary" onClick={closeArea}>Bereich abschliessen</button><button className="primary" onClick={() => nav('summary')}>Zuhause abschliessen</button></div>
        </>}

        {step === 'summary' && <>
          <h2>Ihr Zuhause ist erfasst.</h2>
          <p>Gemeinsam haben wir Ihre Angaben aufgenommen und daraus eine erste Kostenschätzung erstellt.</p>
          <ProjectList elements={elements} showPrices />
          {manual.length > 0 && <div className="warn-box"><b>{manual.length} Element(e) benötigen eine manuelle Prüfung.</b><br />Diese Positionen sind nicht im Betrag eingerechnet, damit wir nichts technisch Unmögliches offerieren.</div>}
          <Estimate subtotal={subtotal} fees={fees} vat={vat} gross={gross} />
          <div className="note"><b>Nächster Schritt:</b><br />Für eine verbindliche Offerte prüfen wir Ihr Projekt vor Ort. Dabei kontrollieren wir die Einbausituation, nehmen die exakten Masse auf und prüfen, ob eine bessere oder wirtschaftlichere Lösung sinnvoll ist. Für Beratung, Anfahrt und Aufmass verrechnen wir CHF 150.– exkl. MWST. Bei Auftragserteilung wird dieser Betrag vollständig angerechnet. Wenn das Projekt nicht ausgeführt wird, bleibt dieser Kostenanteil für die Beratung bestehen.</div>
          <div className="actions"><button className="primary" onClick={() => nav('request')}>Beratung anfragen</button><button className="secondary" onClick={() => nav('area')}>Noch einen Bereich erfassen</button><button className="secondary" onClick={() => window.print()}>PDF speichern / drucken</button></div>
        </>}

        {step === 'request' && <>
          <h2>Beratung anfragen</h2>
          <p>Ergänzen Sie Ihre Kontaktdaten. Danach können Sie die Unterlage als PDF speichern und uns die Anfrage per Mail senden.</p>
          <div className="grid">
            <div className="field"><label>Vorname</label><input value={customer.firstName} onChange={e => setCustomer({ ...customer, firstName: e.target.value })} /></div>
            <div className="field"><label>Nachname</label><input value={customer.lastName} onChange={e => setCustomer({ ...customer, lastName: e.target.value })} /></div>
            <div className="field"><label>E-Mail</label><input value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} /></div>
            <div className="field"><label>Telefon</label><input value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} /></div>
            <div className="field"><label>Gewünschter Ausführungszeitraum</label><input value={customer.timeframe} onChange={e => setCustomer({ ...customer, timeframe: e.target.value })} placeholder="z.B. Frühling 2026" /></div>
            <div className="field"><label>Bemerkung an Bigler</label><input value={customer.note} onChange={e => setCustomer({ ...customer, note: e.target.value })} placeholder="Was sollen wir noch wissen?" /></div>
          </div>
          <div className="actions"><button className="primary" onClick={mailto}>Mail an Bigler vorbereiten</button><button className="secondary" onClick={() => window.print()}>A4-PDF speichern</button><button className="secondary" onClick={downloadJson}>Projektdatei herunterladen</button></div>
          <div className="note"><b>Hinweis Pilot:</b><br />Das PDF wird aktuell über die Druckfunktion erzeugt. Die Fotos bleiben im Browser in Originalqualität verfügbar und werden im Bericht angezeigt. Für automatischen Mailversand mit PDF und Originalfotos braucht es im nächsten Schritt eine Serverfunktion/Datenbank.</div>
        </>}
      </section>
      <Sidebar step={step} elements={elements} subtotal={subtotal} fees={fees} vat={vat} gross={gross} />
    </main>
  );
}

function Header({ progress }: { progress: number }) {
  return <>
    <div className="brand"><img src="/images/logo-bigler.png" alt="Bigler Logo" /><div className="claim">Wohnlösungen, die begeistern.</div></div>
    <div className="progress" style={{ '--value': `${progress}%` } as React.CSSProperties}><div /></div>
  </>;
}

function ProjectList({ elements, showPrices = false }: { elements: ElementItem[]; showPrices?: boolean }) {
  const areas = Array.from(new Set(elements.map(e => e.area)));

  if (elements.length === 0) {
    return <div className="empty-list">Noch keine Bauteile erfasst.</div>;
  }

  return <div className="project-list">
    {areas.map(a => <div key={a} className="area-block">
      <h3>{a}</h3>
      {elements.filter(e => e.area === a).map(e => <div key={e.id} className="row">
        <span><b>{e.id}</b> · {e.type} · {e.product} · {e.count} Stk. · {e.width} × {e.height} mm</span>
        {showPrices && <b>{e.status === 'manual-review' ? 'Prüfen' : chf(e.price * e.count)}</b>}
        {e.photos.length > 0 && <div className="thumbs small-thumbs">{e.photos.map((p, i) => <figure key={i}><img src={p.url} alt={p.name} /><figcaption>{p.name}</figcaption></figure>)}</div>}
      </div>)}
    </div>)}
  </div>;
}

function Sidebar({ step, elements, subtotal, fees, vat, gross }: { step: Step; elements: ElementItem[]; subtotal: number; fees: number; vat: number; gross: number }) {
  const priceMode = step === 'summary' || step === 'request';

  return <aside className="card side">
    <h3>{priceMode ? 'Gesamtübersicht' : 'Erfasste Elemente'}</h3>
    <div className="line" />
    {!priceMode && <ProjectList elements={elements} />}
    {priceMode && <>
      <p>{elements.length === 0 ? 'Noch keine Bauteile erfasst.' : `${elements.length} Position(en) erfasst.`}</p>
      <div className="item"><span>Zwischentotal exkl. MWST</span><b>{chf(subtotal + fees)}</b></div>
      <div className="item"><span>MWST 8.1 %</span><b>{chf(vat)}</b></div>
      <div className="line" />
      <div className="total"><span>Total inkl. MWST</span><span>{chf(gross)}</span></div>
    </>}
  </aside>;
}

function Estimate({ subtotal, fees, vat, gross }: { subtotal: number; fees: number; vat: number; gross: number }) {
  return <div className="estimate">
    <div className="item"><span>Produkte / Leistungen</span><b>{chf(subtotal)}</b></div>
    {fees > 0 && <>
      <div className="item"><span>Auftragspauschale</span><b>{chf(100)}</b></div>
      <div className="item"><span>Lieferpauschale</span><b>{chf(85)}</b></div>
    </>}
    <div className="line" />
    <div className="total"><span>Zwischentotal exkl. MWST</span><span>{chf(subtotal + fees)}</span></div>
    <div className="item"><span>MWST 8.1 %</span><b>{chf(vat)}</b></div>
    <div className="line" />
    <div className="total"><span>Geschätzter Gesamtbetrag inkl. MWST</span><span>{chf(gross)}</span></div>
  </div>;
}
