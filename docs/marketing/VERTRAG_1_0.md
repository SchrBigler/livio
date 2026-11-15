# BIGLER Marketing Connector 1.0 — LIVIO

Stand 15. November 2026. **Versionierter Vertragsentwurf; keine bereits abgestimmte zentrale API behauptet.**

## Ist-Bestand und Zuständigkeiten

Modul LIVIO, Marke Schreinerei Bigler, Produktfamilie Insektenschutz. Bestehendes Repository SchrBigler/livio und bestehendes Vercel-Projekt livio im Team schr-bigler. Fachzweig war `work/livio-1-integration` (4c03d35), während main (6cca331) die älteren Fachfunktionen mit neuem Home-Icon enthielt. Diese Ergänzung erhält den Fachzweig und übernimmt Icon/Manifest aus main. Preisfunktionen wurden nicht erweitert, ersetzt oder als fertig gemeldet. Der frühere lokale Preisfix war vor Sitzungsunterbrechung nicht veröffentlicht; das gesicherte UX-Paket 1.1 wurde aus Library wiederhergestellt und bleibt separat erhalten.

Der geprüfte Marketingzentralen-Prototyp 0.1 ist eine lokale HTML-Anwendung ohne Live-Daten, Login, Datenbank oder Ereignis-API. In Sites wurde kein entsprechender veröffentlichter Empfänger gefunden; die GitHub-Suche nach bestehendem gemeinsamen Ereignisvertrag lieferte keinen Treffer. Das existierende Redaktionsatelier ist ein separates Sites-Projekt, ohne deklarierten MCP-Server. Es wird nicht dupliziert oder verändert. Diese Befunde sind eine begrenzte Bestandsprüfung, keine Behauptung, dass weitere Entwicklungen nicht existieren.

Marketingzentrale führt Kampagnen, Redaktion, Experimente, Marktradar, Empfehlungen und Lernarchiv. Commerce führt Geschäftsvorgänge. Kalkulationsbasis führt Kosten/Versionen. LIVIO führt Öffnungen, Konfigurationen und Fachprüfung. Die neue Tabelle ist ausschliesslich ein begrenzter Transportpuffer in der bestehenden LIVIO-Datenbank, keine Marketingdatenbank.

## Übertragung und Bestätigung

`POST BIGLER_MARKETING_ENDPOINT` über HTTPS an die ausdrücklich konfigurierte `BIGLER_MARKETING_ALLOWED_ORIGIN`. Kein angenommener Standard-Endpunkt. Keine Redirects. `Authorization: Bearer <server secret>`, `Idempotency-Key: <event_id>`, `X-BIGLER-Event-Version: 1.0`. Ein erfolgreicher zentraler Empfänger muss antworten:

```json
{"schema_version":"1.0","accepted_event_ids":["die-tatsaechlich-gespeicherte-event-uuid"]}
```

Ein HTTP-200 allein zählt nicht als Erfolg. Die Zentrale muss anhand event_id deduplizieren, Quelle/Marke/Produktfamilie prüfen und die ID erst nach dauerhafter Annahme bestätigen. Fehlende oder falsche Bestätigung wird protokolliert. Empfang und fachliche Verarbeitung sind zwei getrennt zu prüfende Nachweise; LIVIO kann die zentrale Analyse nicht beweisen.

Envelope: event_id, event_name, event_version, occurred_at, source_module=`livio`, brand=`schreinerei-bigler`, product_family=`insektenschutz`; soweit zulässig product_id, session_id, customer_ref, project_ref, configuration_ref, order_ref, campaign_id, experiment_id, UTM-Slugs, consent_state, properties. Maßgebliche maschinenlesbare Validierung: `lib/marketing/contract.ts`.

Nicht belegte Referenzen werden weggelassen. Kunden-/Auftragsreferenzen werden derzeit nicht erzeugt. Browser dürfen weder Quellmodul/Marke vorgeben noch Verkäufe oder inquiry_submitted melden. Keine Namen, Adressen, PLZ, Raumbezeichnungen, Notizen, Prompts, Bilder, Messgeometrien, Preise oder Vollkonfigurationen in Ereignissen. Auch verschlüsselte oder gehashte Kontaktdaten sind nicht vorgesehen.

## Tatsächlich instrumentierte Signale

| Ereignis | Auslöser | Herkunft |
|---|---|---|
| page_viewed | Öffentliche Startseite/Rechner nach Einwilligung | page_load |
| campaign_landing_viewed | dito mit zulässiger Kampagne | page_load |
| configuration_started | Kunde startet Erfassung | user_action |
| category_selected | Kunde wählt Fenster/Tür/Lichtschacht | user_action |
| configuration_saved | Element wird erfolgreich lokal übernommen | user_action |
| configuration_completed | Kunde schliesst die Erfassung zur Übersicht ab | user_action |
| inquiry_started | Kontaktformular wird geöffnet | user_action |
| inquiry_submitted | serverseitig neu gespeicherte Anfrage | server_confirmation |
| content_viewed | Kunde öffnet referenzgestützte Messhilfe | user_action |
| internal_referral_clicked | Klick mit zulässiger Kampagnenweitergabe | user_action |

Produktart, Gewebe, Messmethode, Mengen und Prüfbedarf sind eng begrenzte Eigenschaften. Die Zentrale aggregiert daraus Nachfrage, Saisonalität und Messhilfe-Nutzung. Keine separate Trend-, Redaktions- oder Marktradar-Logik in LIVIO. Unzuverlässig ermittelbare Abbrüche werden nicht gemeldet. Historische Entwürfe werden beim Wiederherstellen/Import nicht rückwirkend als neue Aktionen gezählt. Kaufereignisse sind reserviert; ausschliesslich Commerce darf später bestätigte Verkäufe/Stornos/Rückerstattungen liefern.

## Einwilligung und Kampagnen

Marketingdaten werden nur bei aktivierter Verbindung und gültiger, signierter Analytics-Einwilligung angenommen. Ohne Zustimmung wird kein Ereignis gepuffert oder übertragen. Cookie speichert nur die Auswahl und Einwilligungsreferenz, HttpOnly, SameSite=Lax, in Produktion Secure, maximal 180 Tage. Browser-Sitzungskennung und Attribution werden nur nach Zustimmung im sessionStorage geführt; 30 Minuten Frist. Keine gemeinsamen Personenkennungen über Domains und kein Fingerprinting.

UTM-/Kampagnenwerte sind auf Slugs beschränkt. Automatisches utm_term, Werbe-Klick-IDs und personenbezogene Texte werden weggelassen. Weitergabe nur über vorhandene Links zu explizit freigegebenen BIGLER-Ursprüngen; dabei nur Kampagnenslugs, niemals Sitzungs-/Kunden-IDs. Newsletter/QR/Händler/Event werden über zentral vergebene Kampagnenslugs zugeordnet, nicht über erratene Personenmerkmale. Die Zentrale muss auch für manuell eingegebene Slugs garantieren, dass diese keine Personendaten darstellen.

Widerruf stoppt lokalen Versand und sperrt/entleert noch nicht übertragene Pufferdaten zur Einwilligung. Ein bereits laufender HTTP-Transfer kann nicht zurückgerufen werden; zentrale Widerrufs-/Löschregeln müssen vor Aktivierung angebunden sein. Serverinfrastruktur kann technisch notwendige Zugriffslogs führen; diese werden nicht vom Connector in Marketingauswertungen übernommen. Dies ist eine technische Umsetzung, keine pauschale Rechtskonformitätsbestätigung.

## Zuverlässigkeit

Einmalig gespeicherte inquiry_submitted-IDs sind deterministisch aus dem LIVIO-Projekt abgeleitet. Puffer und Anfrage werden innerhalb derselben Transaktion mit optionalem SAVEPOINT geschrieben: Ein Pufferfehler darf die Fachanfrage nicht verhindern. Bei deaktiviertem Connector wird kein Pufferzugriff benötigt. Maximal drei Versandversuche, Zeitfenster 1/5 Minuten, höchstens fünf Ereignisse je manuellem Lauf, Timeout fünf Sekunden je Transfer. Leases und SKIP LOCKED verhindern parallele Bearbeitung; nach einem Absturz muss die Zentrale Wiederholungen weiterhin deduplizieren.

Erfolgreich übertragene oder endgültig gescheiterte Nutzdaten werden im Puffer entfernt. Offene Nutzdaten: sieben Tage, technische Versandnachweise: 30 Tage. Bereinigung erfolgt beim Flush, derzeit kein automatischer Zeitplan aktiviert. Vor aktivem Sammeln muss regelmässiger Versand/Purge eingerichtet und dessen Lauf nachgewiesen werden. Die Schnittstelle ist momentan deaktiviert, daher keine realen Pufferdaten.

## Wirtschaftlichkeit und Lernreferenzen

Keine Kaufzählung aus Anfrage, Export, Checkout-Klick oder Commerce-Entwurf. Spätere Verkäufe ausschliesslich anhand bestätigter order_ref; Wiederkäufe zentral anhand berechtigter customer_ref. DB2 = Erlös exkl. MWST − Material netto − interne Stunden × CHF 45. Werbekosten separat ausweisen. Keine Kosten-Schätzungen als Ist-Werte. LIVIO hat derzeit keine aktive zentrale Kosten- oder Marketing-Reportingverbindung.

Zentrale Insights/Entscheidungen/Entwicklungsaufgaben sollen über stabile zentrale Referenzen verknüpft werden. Es werden keine künstlichen lokalen Lernarchiv-IDs erzeugt und keine Preise oder Produkte durch Empfehlungen geändert. Redaktion und Werbeausgaben bleiben freigabepflichtig.
