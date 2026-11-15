# Insektenschutz-Landingpage

Stand: 8. November 2026. Umsetzung auf der bestehenden Testbranch.

- `/`: öffentlich erklärender Einstieg mit originalem BIGLER-Logo, eigener als Illustration gekennzeichneter Fenstergrafik, vier Einbausituationen, Gewebeberatung, Ablauf, Kontakt und FAQ.
- `/planen`: bisheriger vollständiger LIVIO-Konfigurator. Gleiche IndexedDB und Schlüssel; bereits gespeicherte Entwürfe bleiben auf derselben Origin zugänglich. Der Einstieg aus einer Produktkategorie setzt bei neuen Entwürfen die Elementart vor; vorhandene Entwürfe haben Vorrang.
- Kunden- und Mitarbeiter-API sowie Prüfschritte unverändert. Keine automatische Bestellung oder kommerzielle Preiszusage auf der Landingpage.
- SEO: eigener Titel und Beschreibung; Planungspfad `noindex`. Kein produktiver Canonical zur noch durch ISN betriebenen Domain und keine Weiterleitung von dieser Domain.
- Keine externen Schriften, Tracking-Pixel oder extern geladenen Bilder ergänzt.

Geprüfte Faktenquelle: Kontaktadresse und Telefonnummer von https://bigler-schreinerei.ch/; Produktbereiche auf https://insektenschutz.bigler-schreinerei.ch/. Texte neu formuliert. Keine Bilder oder fremden Layoutdateien übernommen.

Vor Domainwechsel: bestehende ISN-Unterseiten und eingehende Links vollständig inventarisieren und Weiterleitungen festlegen; Betreiberabstimmung, Datenschutz/Impressum und Produktionskonfiguration abschliessen. Domain bleibt bis zur gewünschten Umstellung unangetastet.

## Bildoptimierung

Echte ISN-Produktfotos aus dem bestehenden BIGLER-Auftritt ersetzen die Illustration und Produktskizzen auf der Landingpage. Optimierte WebP-Dateien werden lokal versioniert, keine Abhängigkeit vom bisherigen Website-CDN im Betrieb. Next/Image erzeugt grössenabhängige Varianten und AVIF/WebP, lädt die vier Bereichsbilder verzögert und priorisiert das Einstiegsfoto. Feste Seitenverhältnisse vermeiden springende Inhalte; getrennte mobile Bildausschnitte erhalten Gesichter und Bedienungsdetails. Keine künstlich erzeugten oder retuschierten Produktdetails.

Bildquellen (8.11.2026), vorhandene BIGLER-/ISN-Marketingbilder, keine behaupteten BIGLER-Referenzobjekte:

- wohnen.jpg: https://irp.cdn-website.com/291ca187/dms3rep/multi/opt/isn300424_Header-2304w.jpg?jxl=&v=jxl
- fenster.jpg: https://lirp.cdn-website.com/291ca187/dms3rep/multi/opt/Spannrahmen-cfa3fc88-1920w.jpg
- tueren.jpg: https://irp.cdn-website.com/291ca187/dms3rep/multi/opt/Pendeltuere-d69c3a0d-1920w.jpg?jxl=&v=jxl
- dachfenster.png: https://lirp.cdn-website.com/291ca187/dms3rep/multi/opt/Dachfenster_3-1920w.png
- lichtschacht.jpg: https://irp.cdn-website.com/291ca187/dms3rep/multi/opt/Lichtschachtabdeckung-1920w.jpg?jxl=&v=jxl
