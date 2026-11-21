# Studex local operations — stand up

> **Multi-VM fleet** (this computer + Dark Factory + Naledsi + AutoMeat): see **[STUDEX_FLEET_MESH.md](./STUDEX_FLEET_MESH.md)** and `npm run fleet:connect`.

One picture: **Paperclip** assigns work → **Hermes** runs in **Herdr** terminals (persistent) → **AutoMeat** registers on `:3100` → **Obsidian** checklists drive Herdr → artifacts go to **Drive/Gitea**.

```
┌─────────────────────────────────────────────────────────────┐
│  Mac Mini hub                                                │
│  Paperclip / ClickClack :3100  ←── Tailscale ──→ workers    │
│  Hermes Lead (hermes_local)                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ tasks / heartbeats
     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
  Herdr + Hermes        Herdr + Claude       Buzz / MSI
  (pane: hermes)        (pane: claude)       Herdr remote
     │                     │
     └── Obsidian herdr/*.md checklists (AutoMeat, factory ZTE)
```

## One command (every lab host)

```bash
cp docs/lab-mesh.env.example docs/lab-mesh.env   # fill once, gitignored
./scripts/studex-local-ops-up.sh
```

Options:

```bash
./scripts/studex-local-ops-up.sh --start-hermes-gateway   # tmux: hermes gateway
./scripts/studex-local-ops-up.sh --automeat-check          # include deploy script (no new secrets)
./scripts/studex-local-ops-up.sh --herdr-ui              # print how to attach herdr
```

## Layer checklist

| Layer | Command / doc |
|-------|----------------|
| **Tailscale** | `tailscale up` · [STUDEX_LAB_MESH.md](./STUDEX_LAB_MESH.md) |
| **Paperclip** | Mac Mini: `npx paperclipai@latest onboard --yes --bind tailnet` |
| **Herdr server** | `./scripts/herdr-server-start.sh` |
| **Hermes in Herdr** | `herdr integration install hermes` then pane: `hermes` |
| **Hermes gateway** | `./scripts/hermes-gateway-tmux.sh` + `tailscale serve --bg 8642` |
| **Hermes ↔ Paperclip** | [AGENT_COMPANY_SETUP.md](./AGENT_COMPANY_SETUP.md) steps 3–4 |
| **AutoMeat** | [AUTOMEAT_CLICKCLACK.md](./deployments/AUTOMEAT_CLICKCLACK.md) |
| **Obsidian** | [OBSIDIAN_HERDR_BRIDGE.md](./OBSIDIAN_HERDR_BRIDGE.md) |
| **MSI / Buzz** | [BUZZ_MSI_AGENTS.md](./BUZZ_MSI_AGENTS.md) · [HERDR_MSI_PAIRING.md](./HERDR_MSI_PAIRING.md) |

## Hermes + Herdr (terminal)

Hermes status in Herdr panes (working / blocked / idle):

```bash
herdr integration install hermes
herdr integration status | grep hermes
```

In Herdr: create workspace **`automeat`** or **`studex-ops`**, open a pane, run `hermes`. Paperclip tasks can be pasted or bridged via Hermes chat; for company tasks use **Paperclip invite** on gateways ([AGENT_COMPANY_SETUP.md](./AGENT_COMPANY_SETUP.md)).

**Lead on Mac Mini:** `hermes_local` adapter — Hermes in a Herdr pane is for **interactive** work; Paperclip still spawns Hermes for heartbeats.

**Workers (MSI, Lenovo, MacBook):** `hermes_gateway` + gateway tmux script below.

## AutoMeat connect (Mac Mini / orchestrator)

1. Preflight hub:

```bash
scripts/agent-fleet-check.sh paperclip http://127.0.0.1:3100
```

2. Local env (never commit):

```bash
export AUTOMEAT_ENV_FILE=~/path/to/studex-api-keys/.env.complete
export AUTOMEAT_REGISTER_JSON=~/path/to/automeat-register.json
export CLICKCLACK_URL=http://127.0.0.1:3100   # or tailnet URL
```

3. Register (Hermes on host runs this — not cloud):

```bash
./scripts/deploy-automeat-clickclack.sh
```

4. Obsidian: copy `integrations/obsidian-herdr/automeat-clickclack.md.example` → vault `herdr/automeat.md`, workspace **`automeat`** in Herdr.

**Paperclip adapter** for a Hermes-run AutoMeat worker (shape only): `integrations/automeat/paperclip-hermes-adapter.example.json`.

Register payload shape for OpenClaw/Kimi remains: `integrations/automeat/register.payload.example.json`.

## Workspaces to create in Herdr

| Workspace id | Use |
|--------------|-----|
| `studex-ops` | Factory queue, lab preflight |
| `automeat` | Meat CEO ops, vault sync |
| `msi-buzz` | MSI + Buzz checklist |
| `portable-agents` | Repo PRs, Mission Control |

Match note filenames under vault `herdr/`.

## Daily flow

1. `./scripts/studex-local-ops-up.sh --start-hermes-gateway`
2. `herdr` → select workspace → `hermes` or `claude` in pane
3. Obsidian **▶ next step** on `herdr/automeat.md` for AutoMeat deploy tasks
4. Paperclip **Run now** on Lead / external agents
5. `./scripts/agent-work-archive.sh` after sessions

## Related

- [STUDEX_FIVE_NODE_DEPLOY.md](./STUDEX_FIVE_NODE_DEPLOY.md)
- [HERMES_INTAKE.md](./HERMES_INTAKE.md) (Vercel commercial intake — not Nous Hermes)