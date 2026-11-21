# Two sites · products · compute tiers

**Plan:** Ship **product on both public sites**, run **heavy engineering on Dark Factory** (bigger machines, more agent setups), and position **the Studex Computer** as the **sold operator appliance** (sovereign, smaller, customer-facing).

## Two public sites (same brand, different jobs)

| Site | Audience | Product | Backend |
|------|-----------|---------|---------|
| **[www.studexmeat.com](https://www.studexmeat.com)** | Operators, merchants, subscribers | Studbot, tiers, Portable Agents training | Shopify + GCP verify API ([DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md)) |
| **Dark Factory site** (`factory.studex…` / GCP static) | Factory, partners, ZTE | Grokbots factory OS, queue, pstack narrative | GCP host + **Dark Factory VM** (not Shopify) |

Both sites **sell / explain** the stack; neither replaces **Obsidian + Herdr** on your metal ([OBSIDIAN_COMPANY_HUB.md](./OBSIDIAN_COMPANY_HUB.md)).

## Compute tiers (who is big vs who is the product)

```
                    Tailscale mesh
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    Mac Mini          Dark Factory      Studex Computer
    (hub)             (heavy worker)    (sold appliance)
    Paperclip         big CPU/GPU       offline-first
    Hermes Lead       many agents       one operator
    modest LLM        Ollama large      Ollama + LiteLLM :4000
```

| Tier | What | Compute | Agent density | Vault note |
|------|------|---------|---------------|------------|
| **Hub** | Mac Mini | Always-on, moderate | Lead + AutoMeat + Paperclip | `herdr/studex-ops.md` |
| **Dark Factory** | GCP VM / big box | **Largest** in lab | Many gateways, ZTE, Buzz, mirrors | `herdr/dark-factory.md` |
| **Studex Computer** | Black Cloud Node / appliance | **Sized for buyer** | One operator fleet, air-gap path | `herdr/studex-computer.md` (template) |
| **MacBook / MSI / Lenovo** | Dev & GPU lab | Between hub and DF | Per-machine Herdr + **OpenBot** | `macbook` / `msi` / `lenovo` |

**Rule:** Dark Factory holds **more setups** (extra Hermes workspaces, OmniRoute upstreams, client sandboxes). **Studex Computer** ships a **curated subset** — Mission Control, Studbot, local models, no factory secrets.

## What runs where (products)

| Capability | studexmeat.com (commercial) | Dark Factory (engineering) | Studex Computer (device) |
|------------|----------------------------|----------------------------|---------------------------|
| Subscribe / unlock | Yes (Shopify) | No (internal) | Bundled licence |
| Factory / ZTE queue | Link only | **Primary** | Read-only or hidden |
| pstack / Grokbots | Docs link | **Primary execution** | Optional lite |
| LLM mesh | Cloud verify + hosted APIs | **Ollama + OmniRoute full** | Ollama + LiteLLM local |
| Hermes intake (sales) | Linked | Separate deploy | N/A |
| VNC / remote ops | No | Yes (tailnet) | Local console only |

## Sequencing

1. **Products on both sites** — Shopify live + Factory static on GCP (**ZTE-010**).
2. **Dark Factory VM** — large instance, full LLM mesh, multiple `herdr` workspaces (**ZTE-007**, **ZTE-011**).
3. **Studex Computer image** — P2 stack (Ollama + LiteLLM + local Mission Control) without factory keys (**PLAN.md** Phase 2).

## Obsidian: one vault, tiered notes

Same vault; **checklist depth** differs:

- `herdr/dark-factory.md` — long playbooks, client sandboxes, GCP.
- `herdr/studex-computer.md` — short operator + air-gap checks ([sovereign course](../mission-control/course/index.html)).

## Related

- [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md)
- [LLM_MESH_BRIDGE.md](./LLM_MESH_BRIDGE.md)
- [STUDEX_FLEET_MESH.md](./STUDEX_FLEET_MESH.md)
- [PLAN.md](../PLAN.md) P2 Black Cloud Node