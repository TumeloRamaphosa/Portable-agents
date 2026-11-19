# Portable Agents — how far we are

Snapshot for **pstack / Grokbots ZTE**, **agent mesh**, and **Hermes on phone**. Regenerate checks: `npm run project:status`.

## Build health (this repo)

| Check | Status |
|-------|--------|
| `npm run typecheck` | Pass (Mission Control course + Studbot JS) |
| Factory intake | 10 items **queued**, 0 **done** |
| Factory pulse | 0 events |
| PR branch | `cursor/pov-course-needle-1375` |

## ZTE factory queue (pstack / Grokbots)

| ID | Work | Owner | Blocker |
|----|------|-------|---------|
| ZTE-001 | Install **pstack** + first `/poteto-mode` | GROK-BUILD | **You** in Cursor: `/add-plugin pstack` |
| ZTE-002 | AutoMeat → `:3100` | GROK-SHIP | Mac hub secrets + Paperclip up |
| ZTE-003 | Lab mesh 3 hosts | GROK-ARCH | Tailscale on physical machines |
| ZTE-004 | 5-node + Gitea + Drive | GROK-ARCH | Same |
| ZTE-005 | Buzz on MSI | GROK-SHIP | MSI hardware |
| ZTE-006 | Herdr + Hermes + AutoMeat ops | GROK-ARCH | Mac Mini |
| ZTE-007 | Fleet + Dark Factory + Naledsi | GROK-ARCH | VMs + Paperclip invites |
| ZTE-008 | Hermes on phone in mesh | GROK-ARCH | Tailscale on phone (see below) |
| ZTE-009 | Cash Claw strategy (ROM + optional vendor pilot) | CASHCLAW | `INVESTMENT.md` alignment; hub optional for B |

**pstack on this cloud run:** plugin lives in **your Cursor desktop** — not installable inside the cloud VM. Use [factory/README.md](../factory/README.md) + [grokbots-zero-touch skill](../.cursor/skills/grokbots-zero-touch/SKILL.md) from Mac/Cursor while this agent ships repo changes.

## Shipped in repo (ready to run on your metal)

| Area | Deliverable |
|------|-------------|
| **Factory** | `factory/`, Mission Control factory UI, `npm run factory:status` |
| **Lab mesh** | `STUDEX_LAB_MESH.md`, `lab-mesh-preflight.sh` |
| **Five-node + fleet** | `STUDEX_FIVE_NODE_DEPLOY.md`, `studex-fleet-connect.sh` |
| **Local ops** | `STUDEX_LOCAL_OPS.md`, `ops:up`, Hermes gateway tmux |
| **Herdr + Claude** | `install-herdr.sh`, `hermes-gateway`, Obsidian templates |
| **Home lounge** | hub `:3088`, cameras, Apple TV, Jellyfin |
| **AutoMeat** | `deploy-automeat-clickclack.sh`, Notion/Naledi link |
| **Buzz / MSI** | `BUZZ_MSI_AGENTS.md` |
| **OpenClaw** | Lobster plugin doc |
| **Cash Claw** | `CASHCLAW_STRATEGY.md`, `integrations/obsidian-herdr/cashclaw.md.example` |
| **Deploy (GCP / Meat / Factory)** | `DEPLOYMENT_PLAN.md`, ZTE-010 |

## Not connected yet (needs your infra)

| Piece | What’s missing |
|-------|----------------|
| **Paperclip `:3100`** | Run on Mac Mini (not up in cloud VM) |
| **Hermes gateways** | Install + `tailscale serve` on workers |
| **Phone Hermes** | Tailscale + optional API bridge to hub ([HERMES_PHONE.md](./HERMES_PHONE.md)) |
| **Studbot Android ↔ Hermes** | Still local LiteRT; no phone Hermes RPC in repo |
| **pstack plugin** | Cursor desktop `/add-plugin pstack` |

## Recommended next 3 moves

1. **Cursor (MacBook):** `/add-plugin pstack` → close **ZTE-001** with one `/poteto-mode` task + `npm run typecheck`.
2. **Phone:** Tailscale on → verify Hermes → `npm run factory:status` via SSH to hub optional ([HERMES_PHONE.md](./HERMES_PHONE.md)).
3. **Mac Mini:** `npm run fleet:connect:full` + Paperclip onboard + invite phone/worker Hermes gateways.

## Commands

```bash
npm run typecheck
npm run factory:status
npm run project:status    # full matrix
npm run fleet:connect
```