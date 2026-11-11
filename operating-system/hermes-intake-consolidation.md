# Hermes intake desk + Voice Desk — one launch product (draft)

**Hermes intake desk** (hermes-intake.vercel.app; code in `hermes-intake/`) is the typed form + ElevenLabs web
voice agent that captures a prospect's goals, problem, features, channels, budget band, timeline and
decision-maker, with POPIA and recording consent.

**Voice Desk** (`../voice-desk/`) is the OpenClaw phone/voice layer with live transcripts on the Dark Factory page.

## Consolidated product: Stud-Bot launch
| Step | Surface | Output |
|---|---|---|
| 1. First contact | Web form, web voice, phone (Voice Desk), later WhatsApp / Zoom | Consent captured |
| 2. Intake | Hermes / Dark Factory PRD-intake agent | Structured intake record + PRD markdown |
| 3. Sales | Customer-sales agent | Lead summary (no prices quoted) |
| 4. Review | NEXUS approval queue | Owner yes / no |
| 5. Build | Sentinel build list (Proposed → Accepted) | Preview build |
| 6. Payment | Payment link after owner review | — (agents never charge) |

## Shared contract
One intake schema for every channel (see `hermes-intake/api/voice-intake.js` and the Dark Factory
`/api/prd` and `/api/lead` endpoints in `../voice-desk/dark-factory/server.py`): name, business, goals,
problem, features, channels, build types, budget band, timeline, tier interest, decision-maker,
human_handoff, popia_consent, recording_consent, notes.

## Open items
- Pick the single store for intake records (private blob store today); never a repo.
- Map intake records to Sentinel build-list fields.
- Legal review of consent text (`popia-v0.1-draft`).
