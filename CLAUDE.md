# Portable Agents — Claude Code context

Studex **Black Cloud** / **Portable Agents** repo. Read `README.md` and `PLAN.md` for product context.

## Before you change code

- Match the **Studex design system** on web surfaces: gold `#C9A84C`, obsidian `#0A0A0A`, Cormorant / Bebas / Space Mono (see `mission-control/`).
- **Minimize diff scope**; do not commit secrets. Keys live in local env or Paperclip secrets — this repo is public and `scripts/autopush.sh` may run `git add -A`.
- Run **`npm run typecheck`** after JS edits under `mission-control/course/` or `studbot/`.

## Agent / ops stack (names)

| Name | Meaning |
|------|---------|
| **NEEDLE (course)** | Compass UI in `mission-control/course/` — not AbuZar product |
| **Cactus Needle** | On-device agent — `integrations/cactus-needle/` |
| **Paperclip / ClickClack** | Orchestrator on **port 3100** — see `docs/AGENT_COMPANY_SETUP.md` |
| **Hermes** | Agent runtime (MiniMax, gateways) — same doc |
| **Grokbots / pstack** | Cursor rigorous engineering — `docs/PSTACK_GROKBOTS_ZTE.md` |
| **AutoMeat** | Studex Meat CEO agent — `docs/deployments/AUTOMEAT_CLICKCLACK.md` |

## Lab machines (Mac Mini hub, MacBook dev, MSI GPU)

Wiring three hosts: **`docs/STUDEX_LAB_MESH.md`**. Local hostnames in **`docs/lab-mesh.env`** (from `docs/lab-mesh.env.example`, gitignored).

Preflight on any machine:

```bash
source docs/lab-mesh.env 2>/dev/null || true
scripts/lab-mesh-preflight.sh
scripts/agent-fleet-check.sh paperclip "${PAPERCLIP_URL:-http://localhost:3100}"
```

## Shopify / Studbot

Store: **studexmeat.com** (`57228b-3.myshopify.com`). Docs: `shopify/STUDEXMEAT.md`, `api/verify-subscription.mjs`.

## Standing rules

- Outbound email: drafts only; Tumelo reviews before send (`PLAN.md` decision log).
- PwC / NDA material: do not expose in public artifacts until NDA executed.
- Timezone for operator comms: **Africa/Johannesburg (SAST, UTC+2)**.
