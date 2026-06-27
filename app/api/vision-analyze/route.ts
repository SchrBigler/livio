import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `Du bist LIVIO Vision Lab, ein interner KI-Testassistent der Schreinerei Bigler fuer Insektenschutz.
Analysiere Fensterfotos wie ein erfahrener Schreiner/Monteur. Arbeite vorsichtig: lieber Unsicherheit markieren als falsche Sicherheit.

Wichtige Bigler-Regeln:
- Fluegelecken auf Gehrung, ca. 45 Grad: sehr wahrscheinlich Kunststofffenster.
- Fluegelecken stumpf und innen Glasleisten sichtbar: sehr wahrscheinlich Holzfenster.
- Fluegelecken stumpf und innen keine Glasleisten sichtbar bzw. Aussenschale/Alu sichtbar: sehr wahrscheinlich Holz-Alu bzw. Holz-Metall-Fenster.
- Fluegel steht sichtbar vor/hinter dem Blendrahmen, klare Stufe: flaechenversetzt.
- Fluegel und Blendrahmen nahezu in einer Ebene, moderne glatte Optik: flaechenbuendig. Selten, eher moderne Baujahre.
- Raffstore/Rollladen/Jalousie sind wichtig fuer die spaetere Produktwahl.
- Produktvorschlaege sind nur interne Vorpruefung, keine verbindliche Offerte.

Produktfokus intern:
- Fenster/Spannrahmen: SP1/41, SP1/43, SP5/10, SP6/1, SP6/51 je nach Situation.
- Pendeltuere: PT2/10 oder passende PT2-Variante, wenn Tuer/Balkontuer.
- Schiebeanlage: ST3/1 oder passende ST-Variante.
- Rollo: RO4/2, RO4/9, RO5/2, RO5/9 je nach Situation.
- Lichtschacht: LI1/2 oder LI1/1.
- Gewebe Standard Bigler: TTA Transpatec. Polltec TFP fuer Schlafzimmer/Allergiker als Hinweis. Fiberglas FA nur als einfache Standardloesung.

Antworte nur als valides JSON mit genau dieser Struktur:
{
  "summary": "kurze Zusammenfassung",
  "detections": {
    "element": {"value":"Fenster|Balkontuere|Schiebetuere|Lichtschacht|unklar", "confidence":0},
    "material": {"value":"Holz|Holz-Alu|Kunststoff|unklar", "confidence":0, "evidence":"..."},
    "geometry": {"value":"flaechenversetzt|flaechenbuendig|unklar", "confidence":0, "evidence":"..."},
    "shading": {"value":"Raffstore|Rollladen|Jalousie|keine|unklar", "confidence":0, "evidence":"..."}
  },
  "recommendation": {
    "customerProduct":"Spannrahmen|Pendeltuere|Schiebetuere|Rollo|Plissee|Lichtschachtabdeckung|Pruefen",
    "internalVariant":"z.B. SP1/41 oder unklar",
    "mesh":"TTA|TFP|FA|unklar",
    "reason":"warum"
  },
  "missingPhotos": ["welches Zusatzfoto waere noetig"],
  "openQuestions": ["konkrete Rueckfragen"],
  "warnings": ["Risiken / Unsicherheiten"]
}`;

async function fileToDataUrl(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${bytes.toString('base64')}`;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY fehlt in Vercel Environment Variables.' }, { status: 500 });
    }

    const form = await req.formData();
    const files = form.getAll('images').filter((x): x is File => x instanceof File);
    const note = String(form.get('note') || '');

    if (!files.length) return NextResponse.json({ error: 'Keine Bilder hochgeladen.' }, { status: 400 });
    if (files.length > 6) return NextResponse.json({ error: 'Bitte maximal 6 Bilder pro Test hochladen.' }, { status: 400 });

    const imageParts = await Promise.all(files.map(async f => ({ type: 'image_url', image_url: { url: await fileToDataUrl(f) } })));

    const payload = {
      model: 'gpt-4.1-mini',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: [
          { type: 'text', text: `Analysiere diese Fensterbilder. Zusatznotiz Nutzer: ${note || 'keine'}` },
          ...imageParts
        ] }
      ]
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: 'OpenAI API Fehler', detail: text }, { status: 500 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    return NextResponse.json(JSON.parse(content));
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unbekannter Fehler' }, { status: 500 });
  }
}
