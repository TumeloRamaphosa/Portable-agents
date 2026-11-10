# Voice Desk — calling plan (draft)

Stud-Bot's calling add-on. Agents call and answer people, with a live transcript on the Dark Factory page.
Two modes: **Dark Factory product-requirements intake** and **customer sales**.

## Current state
- **Mock mode only.** OpenClaw `voice-call` plugin with provider `mock`; Dark Factory page + local bridge (`../voice-desk/`).
- No carrier connected, no public webhook, no real calls placed.

## Stack (proposed — each item needs Agent Chief Lord's yes)
| Layer | Primary | Fallback |
|---|---|---|
| Telephony (audio carriage only) | Twilio **or** Telnyx, South African number — **pending** | Plivo |
| Live voice model | Gemini Flash (fast) with Gemini live audio, own **capped** key | Deepgram (STT) + ElevenLabs (TTS) |
| Post-call work (PRD, summary, CRM notes) | Model House | — |
| WhatsApp voice / messages | WhatsApp Business API — **pending**, separate track | — |
| Meetings | OpenClaw `zoom-meetings` plugin (Hermes on Zoom) — **pending** | — |
| Web voice | ElevenLabs Conversational AI widget on the Hermes intake page | — |

Notes:
- Normal phone calls are the target, not WhatsApp; WhatsApp needs its own Business API connection.
- Real providers need a public webhook. Route it through "Charlie's Corner" (edge/proxy) with auth, never expose the gateway directly.
- Run the gateway on "Robuska's house" for the local pilot; mesh access over "Robuska's mom's house".

## Call rules (all agents)
1. Disclose AI at the start of every call.
2. POPIA consent before collecting details; ask separately for recording/transcript consent.
3. No prices, discounts, payments or commitments; "I'll take that for the team to confirm."
4. Never accept passwords, card numbers, bank details or API keys.
5. Offer human handoff. Honour opt-out immediately.
6. Real outbound calls are blocked until Agent Chief Lord approves each one.
7. Recordings and transcripts never go into a repo or Drive share.

## Pilot steps (proposed)
1. Snapshot the VM before any key or provider is added.
2. Run gateway + Dark Factory page as auto-restarting services; add to the read-only infra check (09:00 / 13:00 / 17:00 SAST).
3. Give the calling agent its own gateway identity (mock mode, audited).
4. With approval: buy SA number, set capped model key in a secret store, enable inbound only first.
5. With approval: first real outbound test call to an internal number.
