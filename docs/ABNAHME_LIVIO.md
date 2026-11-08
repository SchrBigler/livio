# LIVIO – tatsächlicher Prüfstand, 8. November 2026

## Erfolgreich ausgeführt

- 20 automatisierte Tests, TypeScript-Prüfung und Produktionsbuild.
- Bereitstellung im bestehenden Vercel-Projekt `livio`, Entwicklungszweig `work/livio-1-integration`.
- Live-Browsertest: synthetisches Projekt mit Original-PNG importiert, Kontaktdaten übernommen, Anfrage abgesendet, Erfolgsanzeige «Ihre Anfrage ist bei BIGLER eingegangen» erhalten und Kundenstatus aktualisiert.
- Die echte isolierte Neon-Datenbank speichert die Anfrage und ihr Element; das Foto ist als privates Original im Blob-Speicher zugeordnet. Lieferanten- und Finanzdaten gelangen nicht in den öffentlichen Status.
- Live-Test der vorhandenen Fotoanalyse mit einer synthetischen Fensterzeichnung: gültige strukturierte Analyse, Material blieb unklar, konkrete Rückfragen und fehlende Detailfotos. Keine technischen Produktcodes oder Masse wurden automatisch freigegeben.
- Import von 11 Original-Lieferantenmatrizen mit 2’380 belegten Preisfeldern für 13 Varianten in die private Testdatenbank; Preisstand 04/2025. Keine Veröffentlichung der vertraulichen Preisdateien im Repository.
- Mathematische Prüfung der referenzgestützten Fotomessung an synthetischer Geometrie. Das Ergebnis bleibt ausdrücklich geschätzt. Physische Fenster-Aufmassvergleiche stehen aus.

## Konkrete Abnahmegrenzen

1. Die automatische Freigabeprüfung hat das Einrichten des persönlichen Mitarbeiterzugangs für Urs abgelehnt. Begründung: Die ausdrücklich bestätigte Kombination aus Empfänger, Ressourcen und Berechtigungsumfang fehlt. Die abgelehnte Einrichtung wurde nicht anderweitig durchgeführt. Für die Einrichtung wird eine ausdrückliche Freigabe für Lesen/Ändern von Testanfragen, Originalfotos und internen Kalkulationen sowie technische Bestellmassfreigaben benötigt.
2. Die gefundene ISN-Preisliste nennt 04/2025 als Preisstand. Ihre fortbestehende Gültigkeit ist nicht nachgewiesen. Wiederverkaufskonditionen, konkrete Einkaufspreise und auftragsabhängige Leistungsansätze dürfen nicht erfunden oder als bestätigt gesetzt werden. Kundenpreise bleiben deshalb bis zur Datenfreigabe gesperrt.
3. In den verfügbaren Vercel-Projekten ist keine laufende BIGLER-Commerce-Core-Instanz auffindbar. Der vorliegende Core 1.7 ist Quellcode mit noch einzurichtender Identitäts-, Dokumenten- und Versandkonfiguration. Der LIVIO-Adapter und die additive Core-Erweiterung sind vorhanden; es wurde kein paralleles Rechnungs-/Offertensystem aufgebaut. Ein produktiver durchgängiger Nachweis für Offerte, QR-Rechnung und Versand ist deshalb noch nicht möglich.
4. Reale Fenster-/Tür-/Lichtschachtfälle und der Vergleich geschätzter Fotomasse mit einem echten fachlichen Aufmass sind fachliche Prüfungen vor produktiver Freigabe.

Die bisherige Produktivversion wurde nicht ersetzt. Die isolierte Testversion ist konkret funktionsfähig; das gesamte produktive Fertigstellungsziel wird wegen dieser offenen Punkte nicht als abgeschlossen bezeichnet.
