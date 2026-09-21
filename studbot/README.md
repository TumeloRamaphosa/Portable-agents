# Studbot (web)

Lightweight **browser entry app** for Portable Agents (Studex / Black Cloud). No build step, no backend — open in a browser or add to home screen via the web manifest.

For the **native Android** Studbot (Google ADK Kotlin, on-device AI, NEEDLE), see [`studbot-android/README.md`](../studbot-android/README.md).

## What it does

- **Launch** Mission Control, the POV course (NEEDLE), and the live-agent demo README
- **Chat** with a local Studbot guide (keyword routing only; no external APIs)

## Run

```bash
open studbot/index.html
# or from repo root:
python3 -m http.server 8080
# → http://localhost:8080/studbot/
```

## Files

| File | Role |
|------|------|
| `index.html` | App shell |
| `app.js` | Local chat + quick prompts |
| `styles/app.css` | Studex design tokens |
| `manifest.webmanifest` | Optional installable PWA metadata |
