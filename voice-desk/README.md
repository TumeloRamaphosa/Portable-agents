# Voice Desk — Dark Factory voice bridge (mock / demo)

Runnable mock of the Voice Desk: a Dark Factory web page where a Jarvis host, a product-requirements intake
agent and a customer-sales agent talk through a scripted call, show a live transcript, and save a PRD or a
lead summary as markdown. **No carrier, no LLM key, no network calls.** Plan: `../operating-system/voice-desk-plan.md`.

| File | What it is |
|---|---|
| `dark-factory/index.html` | Dark Factory page (demo mode, scripted transcript) |
| `dark-factory/server.py` | Local bridge, `127.0.0.1:8787` only: `/api/health`, `/api/knowledge`, `/api/prd`, `/api/lead`, `/api/mock-call` |
| `dark-factory/agent-knowledge.md` | Agent knowledge pack (sanitized) the agents read |
| `dark-factory/sample-prd.md`, `sample-lead.md` | Example outputs (fictional demo data) |
| `openclaw.voice-call.mock.example.json` | Example OpenClaw voice-call config fragment, mock provider |

## Run locally
```bash
cd voice-desk/dark-factory
VOICE_INTAKE_DIR=./_intake python3 server.py     # writes PRDs/leads under ./_intake (gitignored)
# open http://127.0.0.1:8787/
# optional: openclaw gateway run   (voice-call plugin, provider: mock)
```
Ports: Dark Factory `8787`, OpenClaw gateway `18789`, voice-call webhook `3334` (loopback only).

## Rules
- Mock only. Real providers (Twilio / Telnyx) need a public webhook and Agent Chief Lord's approval per call.
- Generated PRDs, leads, transcripts and recordings are **never committed** (`_intake/` is gitignored).
