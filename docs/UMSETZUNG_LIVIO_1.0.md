# BIGLER LIVIO 1.0 – Modernisierung des bestehenden Tools

Stand: 8. November 2026. Entwicklungszweig `work/livio-1-integration` im bestehenden Repository `SchrBigler/livio`. Keine neue separate Anwendung.

## Ergänzung: konkret eingerichteter Betriebsstand

Der Entwicklungszweig verwendet jetzt eine echte, isolierte Neon-Datenbank `livio` auf dem Zweig `livio-test-20261108` (`br-dry-butterfly-b1ajr30e`). Nur die branchbezogene Vercel-Testumgebung erhält diese Verbindung. LIVIO-Tabellen und Foto-Metadaten sind dort angelegt. Ein privater Vercel-Blob-Speicher `bigler-livio-originalfotos` in Frankfurt ist verbunden. Grössere Originale werden direkt und privat hochgeladen; Projektanfragen enthalten anschließend zugeordnete Referenzen. Der Server prüft Eigentümer, Projekt, Originalname, Dateigrösse und Blob-Metadaten. Leserechte sind auf den Anfrageschlüssel oder authentifizierte Mitarbeitende begrenzt. Wiederholte Uploads erkennen vorhandene Foto-IDs. Keine Bildkompression an gespeicherten Originalen; für die KI-Analyse wird nur eine temporäre kleinere Kopie erstellt.

Der Originalkatalog ist gefunden und ausgewertet: 11 konkrete Tabellen, 2’380 Preisfelder, 13 exakte Produktcodes; Quelle `ISN komplett 2026-06-komprimiert.pdf`, Preisstand 04/2025 CHF. Die Lieferantendaten liegen ausschliesslich in der geschützten Testdatenbank, nicht im öffentlichen Repository. In mehrdeutigen, unvollständig extrahierten Tabellenzeilen werden keine Zellen erfunden. Der Import ist ausdrücklich noch nicht als aktuell gültige Verkaufspreisgrundlage freigegeben. Einkaufskonditionen, auftragsbezogene Leistungsansätze und Tabellenaktualität sind fachlich zu bestätigen. Der interne Prüfbereich zeigt nachvollziehbare Tabellenfelder und Zuschläge; kundenöffentlich werden daraus keine ungesicherten Preise erzeugt.

Die interne Elementkorrektur hat jetzt Formularfelder für Raum, Bezeichnung, Produktcode, Gewebe/Farbe, Befestigung, DIN, Entwässerung und X/Y/Z/W-Detailmasse. Lichtschächte erhalten Robustec und passende Farben statt der Fenster-Standardausführung. Dachfenster werden bis zur exakten Variantenprüfung als eigene Prüfposition erfasst.

Eine unterstützte Fotomessung mit vier bekannten Referenzecken und vier Öffnungsecken ist ergänzt. Ein planares Homografieverfahren rechnet ausschließlich in einer ausdrücklich bestätigten gemeinsamen Ebene. Ungeeignete Referenzen, gekreuzte Ecken, stark abweichende Gegenkanten oder nicht rechteckige Geometrie werden abgewiesen. Ergebnis bleibt geschätzt und kann niemals eine Bestellmassfreigabe ersetzen. Die mathematischen Tests sind erfolgreich; eine vor Ort an realen Fenstern validierte Messgenauigkeit wird nicht behauptet.

Die automatische Freigabeprüfung hat die Einrichtung des persönlichen Preview-Mitarbeiterkontos für Urs abgelehnt: Empfänger, geschützte Ressourcen und Berechtigungsumfang benötigen eine ausdrückliche Nutzerfreigabe. Diese Einrichtung wurde nicht über einen anderen Weg umgangen. Der Session-Signaturschlüssel ist konfiguriert, aber ein persönlicher Zugriff bleibt bis zu dieser Freigabe gesperrt.

Die folgenden Abschnitte dokumentieren den früheren Zwischenstand. Bei Widersprüchen ist diese Ergänzung massgebend. Die noch nicht laufend bereitgestellte Commerce-Instanz, deren Identitäts-/Dokumenten-/Versandkonfiguration und die fachlichen Preisdaten bleiben Voraussetzungen für die vollständige produktive Abnahme. Ein separates paralleles Verkaufsdokumentensystem wird nicht errichtet.

## Nachgewiesener Bestand

Ausgangspunkt ist Commit `b1a93013d6f1311b41662261e256cb62e6ed4871` (Sprint 1.9.4). Der zugehörige Bibliotheksstand `livio-github-starter-1-9-4-vision-mehrfoto-masse.zip` hat dieselbe `app/page.tsx`. Zusätzlich geprüft: `livio-vision-tester.zip` und die aktuelle Datei `BIGLER_Commerce_Core_1.7_Quellcode.zip`. Die Originalarchive wurden unverändert übernommen, lokal separat entpackt und vor Änderungen ein Git-Bundle erstellt. Wiederherstellung siehe WIEDERHERSTELLUNG.md.

| Funktion | Tatsächlicher Altbestand | Stand auf dem Entwicklungszweig |
|---|---|---|
| Projekt/Raum/Elemente | Im Browser vorhanden | Übernommen, UUIDs statt raumweise wiederholter F01-IDs |
| Symbolbilder/Produktwahl | Vorhanden | Übernommen; Elementfamilien gefiltert, Dachfenster ergänzt |
| Lichtschacht | Eigener Ablauf vorhanden | Übernommen, keine Fenstermaterialfrage, separate Messillustration |
| Masse/Fotos/Notizen | Vorhanden, Fotos nur temporäre blob:-Links | Originalbytes in versioniertem Geräteentwurf und JSON, klarer Messstatus |
| Übermassprüfung | Vorhanden, Grenzen im Code unbestätigt | Erfassung erst nach ausdrücklicher Prüfbestätigung; keine automatische Bepreisung |
| Fensterfotoanalyse | API und Vision Lab bereits vorhanden | Bestehende Route wiederverwendet, Vorschläge je Element, Korrektur/Bestätigung; keine sicheren Produktcodes aus Fotos |
| Automatische Vermessung | Kein belastbarer Messalgorithmus in den gefundenen Quellen | Keine automatische Fotomessung freigegeben. Manuelle Erfassung mit Quelle/Status und Messillustrationen |
| Richtpreis | Feste Produktwerte und Pauschalen ohne nachgewiesene Tabellenquelle | Entfernt. Explizite versionierte Tabellenzellen und DB2-Berechnung implementiert, noch keine echten Preisdaten aktiviert |
| Zusammenfassung/Druck/JSON | Vorhanden, Druck über Browser; JSON mit unbrauchbaren blob:-Links | Übernommen; exportierte Originalfotos, Import älterer Projektdateien, Aufmass-/Montagedruck im Prüfbereich |
| Anfrageversand | mailto:-Vorbereitung, keine zentrale Ablage | Datenbank-API mit idempotenter Anlage; ohne Datenbank keine vorgetäuschte Übermittlung |
| Mitarbeiterprüfung | Nicht vorhanden | `/admin/livio`: persönliche Zugänge, technische Korrektur, Prüfvermerke, Bestellmassprüfung/-freigabe, Audit, DB2 |
| Commerce | Keine Anbindung | Abschaltbarer signierter Sender und additive Core-Erweiterung; noch nicht in laufendem Core installiert |

## Modernisierter Ablauf

Die bestehende Bigler-Gestaltung, das vorhandene Original-Logo, Symbolbilder, Produktvarianten und die PLZ-Daten bleiben die Grundlage. Neue Startansicht, ruhigere Darstellung, mobile Karten, Messillustrationen und eine zusammenhängende Elementeübersicht. Bestehende API-Route bleibt `/api/vision-analyze`. Das bestehende Vercel-Projekt `livio` besitzt laut Konfigurationsprüfung bereits `OPENAI_API_KEY` für Preview und Production; der Schlüssel wurde weder abgerufen noch ausgegeben, kopiert oder ersetzt.

Fotos können pro Element analysiert werden. Vorschläge enthalten Unsicherheit, sichtbare Hinweise und Rückfragen. Die Person bestätigt Material und Beschattung oder korrigiert diese; Elementart wird im Erfassungsschritt bestätigt. Fehlende Eigenschaften bleiben offen. Der Vision-Lab-Prototyp ist weiterhin unter `/vision-test` erreichbar. OpenAI-Antworten werden auf das erwartete Schema geprüft. Keine automatische Massableitung oder technische Bestellfreigabe.

## Speichern und Anfrageablage

Geräteentwürfe einschließlich Originalfotos und noch nicht abgeschlossener Elementeingabe werden in IndexedDB gespeichert. Ein Geräteentwurf ist ausdrücklich keine übermittelte Anfrage. JSON-Exporte enthalten Originalfotos, aber keine Zugangsgeheimnisse. Die Importfunktion übernimmt Altdaten und verwirft alte Preise/Freigaben. Alte `blob:`-Links können nicht in Originalfotos zurückverwandelt werden; betroffene Elemente erhalten einen Hinweis zum erneuten Zuordnen. Importdateien erhalten im neuen Entwurf eine neue Anfrage-ID.

Für zentrale Anfragen wird PostgreSQL über `LIVIO_DATABASE_URL` benötigt. `npm run migrate` legt ausschließlich zusätzliche LIVIO-Tabellen an. Nicht gegen eine Produktivdatenbank ausführen, bevor deren Sicherung und Testmigration erfolgt sind. Keine Migration wurde an einer externen Datenbank ausgeführt.

Öffentliche Übermittlung ist auf 4 MB pro Anfrage beschränkt, passend zur bisherigen Serverless-Architektur. Grössere Fotodossiers bleiben im Geräteentwurf und können mit Originalbytes exportiert werden; produktiver Direktupload grösserer Originale in die abgestimmte Projektablage ist noch offen. JPEG/PNG/WebP werden angenommen, HEIC nicht. Mitarbeiterfotos und Kalkulationen erscheinen niemals im öffentlichen Statusendpunkt. Dieser benötigt den zufälligen, nur lokal behaltenen Anfrageschlüssel. Gerätewechsel/Kundenlogin ist noch nicht mit Commerce-/Portal-Login verbunden.

## Fachprüfung

Zugänge werden persönlich mit `LIVIO_STAFF_ACCOUNTS` zugewiesen; nur Token-Hashes in der Konfiguration. Erfolgreiche Anmeldung setzt ein signiertes HttpOnly-/SameSite-Cookie. Mitarbeiter-ID, Zeitpunkt, Aktion und Snapshot werden in PostgreSQL protokolliert. Korrekturformulare sind im ersten Stand strukturierte JSON-Editoren; fachliche Massprüfung und Freigabe haben eigene Bedienfelder. Komfortablere produktbezogene Detailformulare sind noch ausbaubar.

Manuelle Kundenmasse sind Näherungsmasse. Geprüfte Bestellmasse werden intern separat gespeichert. Erst eine zweite ausdrückliche Aktion setzt den Freigabestatus. Technische Änderungen heben betreffende Freigaben auf; die Kalkulation wird bei Korrektur ungültig. Die Lieferantenbestellgrundlage ist gesperrt, bis alle enthaltenen Elemente freigegeben sind. Der Export löst keine Lieferantenbestellung aus. Der Browserdruck erstellt technische Aufmass-/Montageunterlagen; er ist keine kaufmännische Offerte oder Rechnung.

## Preise und Kalkulationsbasis

Das Altprogramm enthält Produktcodes, jedoch keine nachgewiesene Originalpreismatrix. Seine festen Beträge wurden entfernt. Es gibt bewusst keine Ersatz-Flächenformel. Geprüfte Tabellen können im internen Bereich hinterlegt werden; unterstützte Tabellenregel ist derzeit ausschließlich das nächste obere Breiten- und Höhenband. Andere Originaltabellenregeln benötigen einen expliziten weiteren Adapter. Varianten, Gewebe und Farbe müssen exakt übereinstimmen; fehlende Zellen, Übermasse, abgelaufene Daten oder unklare Positionen liefern keinen Preis. Siehe PREISDATEN.md.

Wirtschaftliche Daten werden mit Herkunft und Version aus der BIGLER Kalkulationsbasis übernommen. Der automatische Abruf einer zentralen Kalkulationsbasis ist noch nicht verbunden. Produkt-, Montage-, Aufmass-, Transport- und Zubehörkosten müssen vollständig als Zellen/Leistungspositionen erfasst werden. DB2 = Erlös exkl. MWST minus Material netto minus gesamte Personalstunden × CHF 45. Werte unter 43 % werden markiert. Eine Kalkulation speichert die genauen Preis- und Basisdaten mit ihrem Quellhash. Die Kundenoberfläche zeigt vor einer belastbaren Anbindung und Datenfreigabe keinen Richtpreis.

## Commerce Core

Der tatsächliche Core 1.7 hat eine StoryCut-spezifische Integration, aber keinen generischen LIVIO-Eingang. Daher liegt eine additive Erweiterung in `integration/commerce-core/`. `receiver.ts` gehört nach `src/server/livio.ts`, `route.ts.template` nach `src/app/api/integrations/livio/intakes/route.ts`, die SQL-Datei in die Core-Migrationen. Installation, Berechtigungen und Aktivierung sind noch nicht erfolgt. Der Sender bleibt standardmäßig aus.

Die Übergabe benötigt einen ausdrücklich zugeordneten vorhandenen zentralen Kunden sowie eine zentrale Mitarbeiter-UUID mit LIVIO-Berechtigung. Sie erzeugt keine Kundenkonten anhand einer E-Mail-Vermutung. Quellprojekt-ID und Revision verhindern doppelte Vorgänge/Entwürfe. Signatur, Zeitfenster, Mitarbeiterrechte und zentrale Freischaltung werden geprüft. Späte Wiederholungen setzen keinen neueren Datenstand zurück. Fotos werden als zugeordnete Referenzen/Hashes übergeben; Originale verbleiben im technischen LIVIO-Dossier.

Im Core werden ein zentraler Vorgang und Entwurf angelegt. Die Produktreihe `livio` ist vorbereitet. Ihre Nummernregeln werden in der bestehenden Core-Administration konfiguriert; LIVIO erstellt keine eigenen Verkaufsnummern. Die weitere Übernahme des Entwurfs in die veröffentlichte Offerte und den Auftrag läuft über die vorhandenen Core-Prozesse und ist noch nicht als durchgängige LIVIO-Bedienung verbunden. QR-Rechnung, Dokumentenversand, Zahlungsstatus und Bestellhistorie werden hier nicht nachgebaut. Der Core selbst bezeichnet seinen produktiven Dokumentenversand noch als separat einzurichten; dies wurde nicht als funktionierend behauptet.

Die lokale Kundenansicht zeigt technische Prüfung, fehlende Angaben und nötiges Aufmass. Ein nachgewiesener Statusrückkanal aus Core/Lieferantenbestellung und die Kundenansicht für kaufmännische Folgeschritte fehlen noch. «Bestellung ausgelöst» wird deshalb nicht vorgetäuscht. Portal-/SharePoint-Projektzuordnung und zentrale Ablage müssen ebenfalls noch verbunden werden.

## Prüfung und konkrete offene Punkte

Zusätzlich wurde die bereitgestellte Vercel-Testversion im Browser vom Einstieg bis zum gespeicherten Fenster durchlaufen: Projekt/Adresse, Raum Küche, manuelle Erfassung ohne Fotos, Material/Beschattung, Gewebe/Farbe, Produktauswahl, Übermasssperre und Wiederherstellung des gespeicherten Elements nach Neuladen. Die Startansicht und Zustände wurden per Browser-DOM geprüft. Eine Screenshotaufnahme schlug in der Browserumgebung fehl; eine visuelle Desktop-/Mobil-Abnahme wird daher nicht als abgeschlossen behauptet.

Automatisierte Tests prüfen Messvalidierung, Abschirmung kundenseitiger Freigaben, Preiszellen, fehlende/abgelaufene Daten, DB2, Altimport, Session-Signaturen, Grössenlimits und den technischen Ablauf über die echten API-Handler mit PostgreSQL in PGlite. Commerce-Tests prüfen signierte Übernahme, Rechte, Wiederholungen, Versionskonflikte und das Wiederverwenden zentraler Kunden/Vorgänge/Entwürfe. Testpreiswerte sind ausschließlich synthetische Fixtures und werden nie in eine Konfiguration importiert.

Noch für die volle produktive Zielerreichung erforderlich:

1. Isolierte LIVIO-Testdatenbank, persönliche Mitarbeiterzugänge und spätere Verbindung zum bestehenden Firmenlogin.
2. Originalpreistabellen samt Netto-/Verkaufsgrundlage, bestätigte technische Produktgrenzen und detaillierte Aufmass-/Befestigungsregeln. Extraktion und Abgleich mit manueller Originalkalkulation sind noch offen.
3. Verbindung zur laufenden BIGLER Kalkulationsbasis und Abnahme aller Leistungsansätze.
4. Installation/Freigabe der Core-Erweiterung, zentrale Kunden-/Mitarbeiterzuordnung, Nummernregeln und Ende-zu-Ende-Test der Verkaufsdokumente.
5. Zentraler Statusrückkanal, Login, Portal-/SharePoint-Ablage und Originalfoto-Direktupload für grössere Dossiers.
6. Reale Fenster-, Tür-, Dachfenster- und Lichtschachttests; echter API-Bildtest mit geeigneten Testfotos; keine Aussage über erzielte Erkennungsgenauigkeit ohne diese Tests.
7. Validiertes Messverfahren mit bekannter Referenz und realem Vergleichsaufmass. Bis dahin bleiben Fotomasse ausdrücklich gesperrt.

Dies ist ein modernisierter, prüfbarer Entwicklungsstand auf dem vorhandenen Tool. Das vollständige Fertigstellungsziel «einmal erfassen → korrekte Offerte → Lieferantenbestellgrundlage → Montage → dokumentierter Versand» ist noch nicht produktiv abgenommen.
