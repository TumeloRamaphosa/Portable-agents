# Notion + Obsidian Herdr — what to build, VMs, agents, progress

**Split brains on purpose:**

| System | Holds | You use it for |
|--------|--------|----------------|
| **Notion** | Plans, kanban, VM registry, agent dashboard, daily briefs | **What** needs building, **who**, **stage**, **evidence** |
| **Obsidian `herdr/`** | Checklists with `herdr-workspace` | **How** to run steps — Herdr Bridge **▶** |
| **git `factory/intake/queue.json`** | ZTE queue (machine-readable) | Agents + `npm run factory:status` |
| **Paperclip** | Live company tasks | Runtime assignment to Hermes |

Notion does **not** replace Herdr. Notion is the **board**; Obsidian is the **runbook remote**.

---

## Notion pages (your workspace)

| Page / DB | URL | Use |
|-----------|-----|-----|
| [Studex Command Centre](https://app.notion.com/p/3f53ef07399281548222f765b9cac2f9) | Hub | 09:00 / 17:00 rhythm |
| [Virtual Machine Command](https://app.notion.com/p/41e3ef07399280d6ac21da4b39f9d1bf) | CC2 | VM + phone ops mirror |
| [Studex VM Registry](https://app.notion.com/p/41b3ef073992811bbd0ac2201d2e5f1d) | Fleet | **Status**, Last verified — no IPs/keys |
| [Factory Board](https://app.notion.com/p/40618048b07f47e79b9da946e7705b6b) | Kanban | **What to build** — Stage, Agent, Machine, Evidence |
| [Agent Dashboard](https://app.notion.com/p/1a646203de9e4aac96d50abfde37bb69) | Agents | Skills, daily rows |
| [Work Graph](https://app.notion.com/p/3f53ef0739928109aff8ca7f5492bfac) | Graph | Business/agent map (Graphify = code graph) |

Repo map: [NOTION_VM_COMMAND.md](./NOTION_VM_COMMAND.md)

---

## Link ZTE queue ↔ Factory Board ↔ Obsidian

**Source of truth for numbered factory work:** `factory/intake/queue.json` (ZTE-001 …).

| Step | Where |
|------|--------|
| 1 | New work lands as **ZTE-*** in git (or you add to `queue.json`) |
| 2 | **Factory Board** row: Task = `ZTE-013 MSI brain stack`, Stage = Intake → Building → QA → Shipped |
| 3 | Obsidian: copy matching `.example` → `herdr/<topic>.md`, frontmatter `herdr-workspace` |
| 4 | Checklist line **▶** runs agent on Mac/MSI; progress = checkboxes |
| 5 | **Shipped** only with **Evidence** URL (PR, Drive archive, health check screenshot — no secrets) |

**Cursor / Cloud agents** update `queue.json` in PRs; **you** (or MacBook agent via Notion MCP) move Factory Board cards.

Example mapping (current queue):

| ZTE | Factory Board task title | Obsidian template |
|-----|--------------------------|-------------------|
| ZTE-008 | Phone OS on Tailscale | `phone-os-tailscale.md.example` |
| ZTE-010 | GCP deploy today | `deploy-today-gcp.md.example` |
| ZTE-013 | MSI brain | `msi-brain-bootstrap.md.example` |
| ZTE-015 | Graphify + Floorplan | `client-build-planning.md.example` |
| ZTE-016 | Paperclip always-on | `studex-os-boot.md.example` + PAPERCLIP_ALWAYS_ON |

---

## VMs + agents “up” and progress (daily)

### Automated snapshot (Mac — paste into Notion)

```bash
cd ~/Portable-agents
npm run ops:status-report
```

Writes `~/.studex/archive/.../ops/NOTION_PASTE.md` with:

- `factory:status` (all ZTE rows)
- Fleet ping summary (if `lab-mesh.env` set)
- Paperclip health line
- Pointers to update VM Registry

**09:00:** paste **AM** section into CEO brief / Agent Dashboard.  
**17:00:** paste **PM** section into consolidated daily.

### Manual VM Registry (after preflight)

| Host | Preflight | Notion fields |
|------|-----------|---------------|
| Phone | `phone-os-preflight.sh` | Status, Last verified |
| MSI | `msi-brain-preflight.sh` | same |
| GCP | `gcp-preflight.sh` | same |
| Full mesh | `fleet:connect` | dark-factory, naledsi, msi pings |

No secrets — only Running / Unverified + date.

### Agent Dashboard

One line per agent per day: what ran (Hermes, Claude, factory ownerBot from ZTE row). Filled from `NOTION_PASTE.md` or Planning daily summary.

---

## Obsidian checklist: wire Notion into Herdr

Copy `notion-ops-sync.md.example` → `herdr/notion-ops.md`, workspace **`studex-ops`**.

Typical **▶** lines agents execute:

- “Run `npm run ops:status-report` and open NOTION_PASTE.md”
- “Update Factory Board card ZTE-0xx Stage → Building”
- “VM Registry: set android-studex-phone Last verified today if preflight PASS”

**Notion MCP** (Cursor on MacBook): agent can search/update pages when you approve — never auto-write secrets.

---

## Flow diagram

```
Notion Factory Board  ──what to build──►  pick ZTE / card
        │                                      │
        ▼                                      ▼
Obsidian herdr/*.md   ◄──playbook link──  queue.json
        │ Herdr Bridge ▶
        ▼
Hermes / Claude pane  ──evidence──►  Factory Board Evidence URL
        │                                      │
        └──────── agent-work-archive ─────────► Drive Stud-Bot-Depo
```

---

## Related

- [STUDEX_OPERATING_SYSTEM.md](./STUDEX_OPERATING_SYSTEM.md)
- [OBSIDIAN_HERDR_BRIDGE.md](./OBSIDIAN_HERDR_BRIDGE.md)
- [APP_MAP_DAILY_ROUTINE.md](./APP_MAP_DAILY_ROUTINE.md)
- [PAPERCLIP_ALWAYS_ON.md](./PAPERCLIP_ALWAYS_ON.md)