# Geprüfte Preisgrundlage importieren

Das folgende Schema ist eine Beschreibung, keine echte Preisliste. Keine Testwerte produktiv verwenden.

Lieferantentabelle (`supplier-table`): `id`, unverwechselbare `version`, `supplier`, `source` (Originaldatei/Version), `validFrom`, `validTo` (YYYY-MM-DD), `approvedBy`, `approvedAt` (ISO-Zeit), `rule: "next-upper-width-and-height"`, `cells`.

Jede Zelle benötigt `code` (exakter Lieferantencode), `mesh`, `color`, `maxWidth`, `maxHeight` in mm, `saleNet` und `materialNet` in CHF exkl. MWST sowie `sourcePage`. Eine Zelle bildet genau die kontrollierte Kombination ab. Bereits bekannte Ausführungszuschläge müssen in genau dieser Kombination enthalten sein; unbekannte Zuschläge dürfen nicht als null angenommen werden. Andere Tabellenraster oder Berechnungsregeln nicht unter dieser Regel importieren. Vollständigkeit und Tabellenränder gegen Originale prüfen.

Kalkulationsbasis (`economics`): `version`, `source` (zentrale BIGLER-Basis/Stand), `vatRate` als Dezimalwert, `hours` als gesamter zusätzlicher Personalbedarf, `serviceNet`, `otherMaterialNet` und `services`. Die Zuordnung muss Doppelzählungen vermeiden. Jede Leistungsposition enthält `label`, `saleNet`, `materialNet` und `hours` – zum Beispiel Aufmass, Montage, Transport, Zubehör. Für jedes neue Projekt den tatsächlichen Aufwand übernehmen; der derzeitige Import ist eine versionierte globale Grundlage, noch kein automatischer projektabhängiger Leistungsplaner.

Tabellen, Basis und berechnete Werte werden als Snapshot protokolliert. Eine neue Tabelle benötigt eine neue ID/Version. Es gibt keinen automatischen Rückgriff auf Altpreise, keine Flächenpreis-Ersatzformel und keinen Preis für technisch ungeklärte Positionen.
