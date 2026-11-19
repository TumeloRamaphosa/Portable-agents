# Obsidian + Herdr = company command (one pattern per machine)

**Local CC0 is not “many dashboards.”** It is:

1. **One Obsidian vault** (or one `herdr/` folder per machine) — checklists are the company record.
2. **[Herdr Bridge](https://github.com/Daniel-Steinberger/obsidian-herdr)** — ▶ next step sends lines to agents in a pane.
3. **Agents in the pane** — `claude`, `hermes`, `ollama` CLI, etc. on **that** computer only.
4. **OpenBot** on the same computer — chat and handoffs between agents ([OPENBOT_NODE_MESH.md](./OPENBOT_NODE_MESH.md)).
4. **Tailscale** — optional sync/read vault; **execution** stays on the host that owns the socket.

Same pattern on **Mac Mini, MacBook, MSI, Lenovo, each VM**: copy a template → `herdr/<machine>.md` → `herdr-workspace` → run Herdr locally.

```
┌─────────────────────────────────────────────────────────┐
│  Obsidian vault (shared or per-host sync)                 │
│    herdr/mac-mini.md   herdr/macbook.md   herdr/msi.md  │
│    herdr/lenovo.md     herdr/dark-factory.md  …         │
└──────────────────────────┬──────────────────────────────┘
                           │ Herdr Bridge (local socket)
                           ▼
              herdr → workspace → pane (claude | hermes)
                           │
                           ▼
              LLM mesh on THAT host (Ollama + OmniRoute …)
```

Paperclip `:3100` stays on **Mac Mini** for **company tasks**; Obsidian is **how humans and agents agree on steps** on each box. Mission Control HTML is optional glass — not the source of truth.

## Vault layout (recommended)

| Path | Machine | Template |
|------|---------|----------|
| `herdr/studex-ops.md` | Mac Mini hub | `studex-ops-standup.md.example` |
| `herdr/macbook.md` | MacBook | `macbook-llm-mesh.md.example` |
| `herdr/msi.md` | MSI GPU | `msi-buzz.md.example` + `msi-llm-mesh.md.example` |
| `herdr/lenovo.md` | Lenovo | `lenovo-lab.md.example` |
| `herdr/dark-factory.md` | **Heavy VM / big box** | `dark-factory.md.example` |
| `herdr/studex-computer.md` | **Sold appliance** | `studex-computer.md.example` |
| `herdr/vm-remote.md` | Any GCP VM | `vm-remote.md.example` |

Site + tier map: [TWO_SITES_COMPUTE_TIERS.md](./TWO_SITES_COMPUTE_TIERS.md) (studexmeat.com + Dark Factory site; DF = bigger compute).

Set `AUTOMEAT_VAULT_PATH` in `docs/lab-mesh.env` (gitignored).

## Per-machine setup (order)

| Step | All machines |
|------|----------------|
| 1 | `herdr` installed + running (`~/.config/herdr/herdr.sock`) |
| 2 | Obsidian Desktop + Herdr Bridge → folder `herdr` |
| 3 | Copy template → `herdr/<name>.md`, set `herdr-workspace:` |
| 4 | LLM mesh on GPU/host: [LLM_MESH_BRIDGE.md](./LLM_MESH_BRIDGE.md) |
| 5 | `herdr machine add …` from hub when SSH works ([STUDEX_FLEET_MESH.md](./STUDEX_FLEET_MESH.md)) |

## What we dropped from “local CC”

| Not primary | Replaced by |
|-------------|-------------|
| Many separate UIs | One vault folder per role |
| Ad-hoc terminal-only ops | Herdr persistent panes |
| Per-tool status pages | Checklist + `npm run project:status` when needed |

Keep [mission-control/hub/](../mission-control/hub/index.html) for **GCP / VM / bare metal** panes only.

## Related

- [OBSIDIAN_HERDR_BRIDGE.md](./OBSIDIAN_HERDR_BRIDGE.md)
- [LLM_MESH_BRIDGE.md](./LLM_MESH_BRIDGE.md)
- [STUDEX_LAB_MESH.md](./STUDEX_LAB_MESH.md)
- [COMMAND_CENTERS.md](./COMMAND_CENTERS.md)