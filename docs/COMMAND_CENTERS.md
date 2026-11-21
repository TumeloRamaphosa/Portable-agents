# Studex command centers — GSTK + pstack + Claude ops

**GSTK** = **G**rokbots **S**tudex **T**ool **K**it: `pstack` in Cursor, ZTE factory, Herdr/Obsidian, and local agent runtimes (Hermes, Claude, Paperclip on hub).

**Claude business model** = Mission Control role views + optional [claude-ops](https://github.com/Lifecycle-Innovations-Limited/claude-ops) harness + **Paperclip** company graph + named fleet agents (NALEDI, CASHCLAW, …). Delivery code still flows through **pstack** `/poteto-mode` and Grokbots.

## Build order (your sequence)

```
Phase 1 ──► CC0 Local Command Center     (local agents, Herdr, Paperclip, pstack)
Phase 2 ──► CC1 GCP Command Center       (verify, factory site, client projects)
Phase 3 ──► CC2 VM Command Center        (GCP VMs + tailnet + other machines)
Phase 4 ──► CC3 Bare metal Command Center (Black Cloud Node, DC, on-prem rack)
```

**Hub UI:** [mission-control/hub/index.html](../mission-control/hub/index.html) links all four. Parent business console stays [mission-control/index.html](../mission-control/index.html).

## Center map

| ID | Name | Operators | Agents / tools | Doc |
|----|------|-----------|----------------|-----|
| **CC0** | **Local** | Mac Mini, MacBook | Hermes Lead, Herdr, Paperclip `:3100`, Cursor **pstack** | [local](../mission-control/local/index.html) |
| **CC1** | **GCP** | Platform / ship | Cloud Run verify, Factory static, client GCP folders | [gcp](../mission-control/gcp/index.html), [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) |
| **CC2** | **VMs** | CTO / arch | dark-factory, Naledsi, MSI, Lenovo, cloud VMs | [vms](../mission-control/vms/index.html), [STUDEX_FLEET_MESH.md](./STUDEX_FLEET_MESH.md) |
| **CC3** | **Bare metal** | Sovereign / DC | Black Cloud Node, Cape Town DC, Rwanda pilot | [bare-metal](../mission-control/bare-metal/index.html), [PLAN.md](../PLAN.md) |

## CC0 — Local (Obsidian company hub first)

**One pattern:** vault `herdr/` + Herdr Bridge + agent pane on **each** machine (Mac Mini, MacBook, MSI, Lenovo, VMs).

| Machine | Vault note | LLM mesh |
|---------|------------|----------|
| Mac Mini | `studex-ops.md` | Hub + optional Ollama |
| MacBook | `macbook-llm-mesh.md.example` | OmniRoute + pstack |
| MSI | `msi-llm-mesh.md.example` | Ollama GPU + gateway |
| Lenovo | `lenovo-lab.md.example` | Lab worker |
| VM | `vm-remote.md.example` | SSH/VNC + Ollama/OmniRoute |

Docs: [OBSIDIAN_COMPANY_HUB.md](./OBSIDIAN_COMPANY_HUB.md) · [LLM_MESH_BRIDGE.md](./LLM_MESH_BRIDGE.md) · `./scripts/llm-mesh-preflight.sh`

Paperclip `:3100` remains **company control** on Mac Mini; Obsidian is **per-host execution** checklists.

Local agents **must** be healthy before CC1–CC3 (GCP, VMs inventory, bare metal).

## CC1 — GCP

See [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md). Today: verify API + Dark Factory public site + per-client project template.

## CC2 — VMs

Inventory: Tailscale names in `docs/lab-mesh.env`, Paperclip external invites, Hermes `tailscale serve 8642`. GCP Compute VMs listed beside Mac Mini / MSI / Lenovo.

## CC3 — Bare metal

P2 Black Cloud Node, P3 Cape Town DC, air-gap POV course checkpoints — no cloud substitute for sovereignty proof.

## pstack × Claude (who does what)

| Work type | Route |
|-----------|--------|
| Code / ship | pstack → Grok delegates (GROK-BUILD, GROK-SHIP) |
| Judgment / interrogate | Opus per `.cursor/rules/pstack-models.mdc` |
| Business rhythm / fleet table | Mission Control + claude-ops optional |
| Company tasks | Paperclip issues → Hermes gateways |

## Related

- [PSTACK_GROKBOTS_ZTE.md](./PSTACK_GROKBOTS_ZTE.md)
- [NEEDLE_AND_OPS_STACK.md](./NEEDLE_AND_OPS_STACK.md)
- [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md)