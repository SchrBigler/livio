# Betrieb, Prüfung und Rückkehr

## Deaktivierter Standard

BIGLER_MARKETING_ENABLED bleibt false bzw. nicht gesetzt. Endpoint, Allowed Origin und Token werden nur serverseitig aus freigegebener Konfiguration gelesen. Kein Token im Browser. Selbst ENABLED=true reicht ohne sichere Zielkonfiguration nicht zum Versand.

Die interne Ansicht liegt im bestehenden `/admin/livio` hinter dessen Mitarbeiteranmeldung. `/api/marketing/status` und `/api/marketing/flush` verlangen dieselbe Berechtigung. Ein unternehmensweites SSO ist nicht zusätzlich implementiert; zentrale Rollen müssen später angebunden werden. Status zeigt keine erfundenen Erfolge. Stand der letzten Prüfung ist der tatsächliche Zeitpunkt des Statusabrufs.

## Aktivierung – erst bei vorhandenem Empfänger

1. Zentralen Vertrag mit Marketingzentrale abstimmen, echten HTTPS-Endpunkt und zulässigen Origin bestätigen.
2. Zentrale Authentifizierung, event_id-Deduplizierung, Einwilligungswiderruf, Löschung und Empfänger-Aufbewahrung testen.
3. Migration `003_marketing_outbox.sql` ausschliesslich auf der zugeordneten LIVIO-Testdatenbank anwenden; vorhandene Tabellen/Daten bleiben erhalten.
4. Serverseitige Konfiguration über bestehenden Berechtigungsweg hinterlegen. Keine Tokens in Dateien oder öffentlichen Parametern.
5. Signierte Einwilligung und durchgehenden synthetischen Test vom Browser bis zur zentralen Speicherung/Zuordnung nachweisen. Synthetische Daten separieren.
6. Regelmässigen Flush/Purge über vorgesehenen Scheduler einrichten; aktuell nicht aktiviert. Zentrale Consent-/Löschregel integrieren. Erst dann reale Einwilligungen/Sammlung aktivieren.
7. Erst nach erfolgreicher Empfängerprüfung den Status «aktiv» verwenden.

## Wiederherstellung

Sicherungen vor Änderungen: Git-Tags `backup/marketing-main-20261115` (main, 6cca331) und `backup/marketing-integration-20261115` (Fachzweig, 4c03d35); vollständiges Git-Bundle lokal während dieser Bearbeitung. Produktionsbereitstellung vor Änderungen: dpl_F5UbM1Ub8ZhHZoM1Kdys72of9zwQ. Tests werden auf dem bestehenden Integrationszweig veröffentlicht, nicht ungeprüft nach main übernommen.

Connector sofort deaktivieren: BIGLER_MARKETING_ENABLED=false. Bereits gepufferte Daten werden dann nicht übertragen. Rückkehr des Testzweigs über einen neuen Revert-/Wiederherstellungs-Commit oder erneute Bereitstellung des Ausgangscommits; kein force-push nötig. Die additive Puffertabelle kann ungenutzt bestehen bleiben. Nicht die LIVIO-Projekt-/Foto-/Prüftabellen löschen.

Die lokale Arbeitsumgebung früherer Turns wurde durch Wartung bereinigt. Das gespeicherte 1.1-UX-Paket ist wiederhergestellt und nicht verloren; nicht veröffentlichte und nicht separat gesicherte Fragmente des unterbrochenen Preisfixes können nicht als vollständiger Stand rekonstruiert werden. Die dokumentierten Originalpreis-Importe in der externen Testdatenbank bleiben unberührt. Dieser Marketingauftrag erklärt den offenen Richtpreisfehler nicht für erledigt.
