# Hermes intake (Studex commercial channel)

**Live URL:** [https://hermes-intake.vercel.app/](https://hermes-intake.vercel.app/)

This is **Studex’s customer project intake** — “Hermes” as **sales / scoping agent**, not the [NousResearch Hermes](https://hermes-agent.nousresearch.com/) runtime used with Paperclip in `docs/AGENT_COMPANY_SETUP.md`.

| Name collision | What it is |
|----------------|------------|
| **Hermes intake** (this site) | Public form + optional voice widget; quote workflow for builds |
| **Hermes agent** (Nous) | Terminal/gateway agent for engineering on Mac/Mini/VM |
| **AutoMeat** | Internal Studex Meat CEO agent on ClickClack `:3100` |

## What the site does

- **Typed intake:** goals, build types, features/channels, budget tier, payment preference (no payment on form).
- **Draft pricing (ex-VAT, pending approval):** Starter **R1,500** · Company **R2,800** · Agentic Rise **R4,500** · Custom quoted.
- **Voice (optional):** ElevenLabs ConvAI widget; POPIA consent + recording consent copy on page.
- **Submit:** `POST /api/submit` (JSON) → reference id on success.
- **Security copy:** no passwords, API keys, or card numbers on the form; honeypot field `website_url_hp`.

## Relation to Portable Agents

- **Mission Control / Studbot** = sovereign ops product demo (PwC, Rwanda, internal).
- **Hermes intake** = **commercial front door** for “build me X” (Global Markets / Agentic Rise funnel).
- **studexmeat.com** = subscription / operator tiers for Studbot unlock (`shopify/STUDEXMEAT.md`).

Embed-friendly: parent windows can listen for `postMessage` `{ type: 'hermes-intake-submitted', id }` after submit.

## Source of truth

The intake app is deployed on **Vercel** (`hermes-intake.vercel.app`). It is **not** built from this `Portable-agents` repo (this repo only links to it). API routes such as `/api/submit` live in that Vercel project.

## Ops checklist (when changing intake)

1. Test submit on staging/preview before promoting production.
2. Keep POPIA / recording consent text aligned with legal.
3. Do not log PII or payment details in Vercel function logs.
4. Wire follow-up (email/CRM) in the intake project backend — not in public git.
