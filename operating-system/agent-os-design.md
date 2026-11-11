# Agent OS — design notes (draft)

## Layers
1. **Channels** — web form, web voice widget, phone (Voice Desk), WhatsApp (pending Business API), Zoom/Meet, email (AgentMail, drafts only).
2. **Intake & sales agents** — Hermes (intake desk), Dark Factory PRD-intake agent, customer-sales agent, Jarvis host.
3. **Execution harness** — OpenClaw gateway (plugins: voice-call, zoom-meetings), Hermes, Orgo workers, factory VM seats.
4. **Control plane** — Grok Bot OS / NEXUS command deck: approvals, audit log, task ownership, evidence, release control.
5. **Knowledge** — per-client Business Ghost (plain files the client owns) + shared Studex Brain; Dark Factory knowledge pack.
6. **Build list** — Notion Sentinel Projects (canonical queue, owned by Sentinel). Dark Factory PRDs feed it as *Proposed* items.

## Flow
```
caller / visitor ─► channel ─► intake or sales agent ─► PRD / lead summary (file)
                                                    │
                                                    ▼
                                    NEXUS approval queue ─► Sentinel build list (Proposed)
                                                    │
                                    Agent Chief Lord yes ─► build / send / call / charge
```

## Gates (hard)
- **Send** (email, WhatsApp, posts): drafted only; human sends.
- **Call**: real outbound calls blocked; each real call needs his approval. Mock mode is default.
- **Spend / charge**: never by an agent; payment links only after owner review.
- **Deploy / merge**: PR only; never to main without approval.
- **Data**: only what the request needs; POPIA consent and separate recording consent before collecting details.
  Signed clients' data stays off MiniMax.

## Per-client setup (Stud-Bot)
Each client gets: its agents, a Business Ghost (brain), a file structure, a Drive folder, a VM and a repo.
Agents reach models through one gateway, so no agent holds its own keys. Keys go only into secure fields
(secret stores / project env), never into chat, notes or repos.

## Honest status language
`unknown` · `offline` · `blocked` · `needs approval` · `proposed` · `accepted`. Missing report ≠ success.

## Repo & Command Centre alignment
- **Portable layer (this repo):** `operating-system/`, `voice-desk/`, `dark-factory-knowledge/`, `clients/`, `agents/schpielberg/` — see `docs/COMMAND-CENTRE.md`.
- **Runtime layer:** [Linux-Studex-](https://github.com/TumeloRamaphosa/Linux-Studex-) — UTM fleet, `dashboard.html`, gateway ports 3000–3013.
- **Operator layer:** Notion Studex Command Centre — canonical rhythm and Agent Dashboard; not auto-synced to git.
- **Content:** Schpielberg pack owns `agents/schpielberg/work/plans/content-plan.md`; blue-team summary in `dark-factory-knowledge/content-blue-team.md`.
