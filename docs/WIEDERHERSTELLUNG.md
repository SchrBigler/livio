# Bestand und Wiederherstellung

Unveränderter Ausgangsstand: Git-Commit `b1a93013d6f1311b41662261e256cb62e6ed4871` im bestehenden Repository `SchrBigler/livio`. Die Originalarchive der früheren Entwicklungen und des Commerce Core wurden nicht überschrieben. Ein vollständiges Git-Bundle vor Änderungen liegt während der Bearbeitung unter `../originals/livio-before.bundle`; die dauerhafte Referenz ist der Ausgangscommit im bestehenden Repository. Der Entwicklungszweig verändert `main` nicht.

Den Altstand ohne Überschreiben der Entwicklungsarbeiten prüfen:

```sh
git worktree add ../livio-altstand b1a93013d6f1311b41662261e256cb62e6ed4871
```

In diesem Checkout Abhängigkeiten installieren und die bestehende Umgebung nur mit den unveränderten vorhandenen Umgebungsvariablen betreiben. Ein späterer Rückbau erfolgt über einen neuen Rücknahme-Commit bzw. durch Wiederzuweisung einer geprüften bestehenden Vercel-Bereitstellung. Kein `reset --hard` auf laufenden Arbeitskopien und keine Entfernung von Datentabellen erforderlich.

Die alte Anwendung hat in den geprüften Quellen keine zentrale Projekt-/Fotodatenbank. Laufende Browserformulare und temporäre blob:-Fotolinks können nicht aus Git wiederhergestellt werden. Vor einem produktiven Wechsel laufende Erfassungen exportieren und Originalfotos separat sichern. Eine Sicherung unbekannter externer Datenbestände wurde nicht vorgenommen oder behauptet.

Vor späteren externen Migrationen: PostgreSQL-Dump mit der betrieblich freigegebenen Sicherung erstellen, testweise in einer isolierten Datenbank wiederherstellen, Anzahl Projekte/Elemente/Originalfotos sowie Prüfhistorie vergleichen. Die neue LIVIO-Migration ist ergänzend; bei einem Code-Rollback bleiben neue Tabellen und Daten erhalten. Commerce kann per `LIVIO_COMMERCE_ENABLED=false` ausgeschaltet werden, ohne LIVIO-Datensätze zu entfernen.
