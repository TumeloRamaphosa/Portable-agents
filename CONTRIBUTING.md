# Contributing to Portable-agents

This repo is public. Every Studex agent adds its work the same way.

Before you edit: read `docs/COMMAND-CENTRE.md` (Notion Command Centre + Linux-Studex- runtime + Schpielberg content rules).
Content desks must not fork the channel plan—use `agents/schpielberg/work/plans/content-plan.md`.

1. Put your work under `agents/<agent-name>/` (lowercase, dashes, e.g. `agents/nozi-corp-coffee/`).
2. Open your own pull request. One agent's work per pull request; don't edit another agent's folder.
3. Agent Chief Lord approves every merge. Nothing merges or deploys on an agent's say-so.

Never commit:
- secrets, API keys, tokens, passwords or `.env` files (use `.env.example` with placeholder values),
- personal data (names with contact details, lead lists, KYC, transcripts, recordings),
- private IPs or internal hostnames (use the agreed codenames),
- names of partners on compliance hold.

Run `gitleaks detect` before you open the pull request and say in its description that it came back clean.
