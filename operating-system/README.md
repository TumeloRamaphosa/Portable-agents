# Operating System — Grok Bot OS / Agent OS / Stud-Bot

Working notes for the client-facing **Stud-Bot** product and the agent operating system
behind it. Everything here is **draft** unless marked approved by Agent Chief Lord.

| File / folder | What it is |
|---|---|
| `agent-os-design.md` | Agent OS design notes: layers, approval gates, how NEXUS, Dark Factory and the build list connect |
| `studbot-tiers.md` | Stud-Bot tier sheet (draft prices, ex-VAT, pending approval) |
| `voice-desk-plan.md` | Voice Desk calling add-on: OpenClaw voice-call, providers, fallback stack, gates |
| `hermes-intake-consolidation.md` | How the Hermes intake desk and the Voice Desk merge into one launch product |
| `red-dot-plan.md` | Red-DOT working-group plan and owners |
| `hermes-intake/` | Code for the Hermes intake form + voice-intake endpoint (hermes-intake.vercel.app) |

Related: `../voice-desk/` (runnable mock), `../dark-factory-knowledge/` (agent knowledge),
`../clients/` (offers, templates, playbooks).

## Standing rules (apply to every file in this repo)
- Nothing is merged, deployed, spent, sent externally or used for a real call without Agent Chief Lord's approval.
- A finished run or passing tests does not mean accepted or deployed.
- No keys, tokens, `.env` files, customer data, lead lists, KYC, transcripts, recordings or private IPs in this repo. It is public.
- Infrastructure is named by codename only: private mesh = "Robuska's mom's house"; edge/proxy = "Charlie's Corner"; Mac mini = "little babushka"; MacBook Pro = "Robuska's house".
- Sentinel owns the build queue (Notion Sentinel Projects is canonical). Files here are working notes, not a second task list.
