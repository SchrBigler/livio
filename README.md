# LIVIO – Biglers Insektenschutz-Lotse

Pilot-Webapp fuer die Schreinerei Bigler.

## Sprint 1.4

Enthalten:

- echte Umlaute und Schweizer Schreibweise im UI
- Bigler-Logo statt Winkehand
- PLZ/Ort-Vorschlaege
- Skizzenstil-Symbole fuer Bereich, Bauteil, Fenstersituation, Material und Beschattung
- Bereich bleibt aktiv, bis der Benutzer ihn bewusst abschliesst
- neues Bauteil startet immer wieder mit 1 Stk.
- Abschluss: "Ihr Zuhause ist erfasst."
- erste Kostenschaetzung mit MWST-Ausweis
- Maximalmass-Pruefung pro Produktcode

## Wichtig zur Maximalmass-Pruefung

Die Limits sind im Code in `PRODUCT_LIMITS` hinterlegt. Elemente ausserhalb dieser Grenzen werden nicht automatisch bepreist, sondern fuer die manuelle Pruefung markiert. Die Werte muessen mit der finalen ISN-Preisliste nochmals fachlich abgeglichen werden.

## Lokal starten

```bash
npm install
npm run dev
```
