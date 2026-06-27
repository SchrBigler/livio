# LIVIO – Sprint 1.9.3 Vision im Projektstandard

Dieses Release erweitert Sprint 1.9.2:

- Projektstandard kann direkt mit mehreren Fotos unterstützt werden
- Fotostrecke: ganzes Fenster, geöffneter Flügel/Bandseite, Detail Ecke/Glasleiste, Aussen/Beschattung
- KI-Vorschlag kann als Projektstandard übernommen werden
- separater Vision Lab Tester bleibt unter `/vision-test` verfügbar
- API-Route `/api/vision-analyze` verarbeitet bis zu 6 Bilder

Voraussetzung in Vercel:

```text
OPENAI_API_KEY=...
```

Deployment:

```bash
git add .
git commit -m "Sprint 1.9.3 Vision Projektstandard"
git pull --rebase
git push
```
