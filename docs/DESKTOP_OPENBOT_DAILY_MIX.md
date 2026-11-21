# Desktop mix — OpenBot + one Obsidian + VMs + Graphify/Floorplan twice daily

**Your rhythm (Africa/Lagos, UTC+1):**

| Time | Report | Purpose |
|------|--------|---------|
| **07:00** | **Objectives** | What to build today — ZTE, Factory Board, 3 priorities |
| **19:00** | **Close** | What shipped, blocked, archive to Drive, Notion paste |

Same vault and **Stud-Bot-Depo** on every machine; each VM still runs **its own Herdr + OpenBot** for execution.

---

## One picture

```
                    ┌─ Stud-Bot-Depo (one Google Drive) ─┐
                    │  planning/ · deploy/ · brain/export │
                    └──────────────────▲──────────────────┘
                                       │ agent-work-archive.sh
┌───────────────────────────────────────┴──────────────────────────────────┐
│  ONE Obsidian vault (Sync / iCloud / Syncthing)                            │
│    brain/wiki/          ← LLM wiki (facts, app maps, god nodes)           │
│    brain/daily/         ← 07:00 objectives + 19:00 close                    │
│    herdr/macbook.md     ← ▶ steps on MacBook                               │
│    herdr/dark-factory.md← ▶ steps on GCP VM (same vault, local herdr.sock) │
└───────────────┬───────────────────────────────┬────────────────────────────┘
                │ OpenBot (chat + handoffs)      │ Herdr Bridge ▶
                ▼                                 ▼
         MacBook / MSI / VM                  claude | hermes panes
                │                                 │
                └──────── Tailscale / Paperclip ──┘
```

---

## 1 — Add OpenBot on desktop (into the mix)

OpenBot is **voice/chat + agent-to-agent handoffs**. It does **not** replace Herdr or Obsidian.

| Use OpenBot for | Use Herdr + Obsidian for |
|-----------------|--------------------------|
| “Delegate this to Grace” | **▶ next step** on a checklist line |
| Exploratory architecture chat | Deterministic factory steps |
| Phone → desktop chat | ZTE verification lists |

**Install (MacBook first — your command desk):**

1. [openbot.run](https://openbot.run/) → macOS app.
2. Connect **Claude Code** or **Cursor** provider (same login as Herdr panes).
3. Optional local models: OmniRoute `http://127.0.0.1:20128/v1` ([LLM_MESH_BRIDGE.md](./LLM_MESH_BRIDGE.md)).
4. Named agents: **Ada** (coord), **Linus** (build), **Grace** (review), **Factory** (only on Dark Factory VM).
5. Vault: copy `integrations/obsidian-herdr/openbot-node.md.example` → `herdr/openbot-macbook.md`, workspace **`openbot`**.

**Rule:** OpenBot agrees the plan → you (or agent) add committed steps to `herdr/*.md` → **Herdr ▶** runs them.

Per-VM: same template → `herdr/openbot-dark-factory.md` on the VM desktop session (VNC if GCP). Headless pattern: OpenBot on **MacBook**, tools hit `msi-gpu` / `dark-factory` via Tailscale.

Full mesh: [OPENBOT_NODE_MESH.md](./OPENBOT_NODE_MESH.md) · ZTE-012.

---

## 2 — One Obsidian vault, many VMs

| Piece | Pattern |
|-------|---------|
| **Vault** | Single vault folder synced (Obsidian Sync, iCloud Drive, or Syncthing). **Do not** run Herdr socket over sync — only markdown syncs. |
| **Per host** | `herdr/<hostname>.md` + `herdr-workspace:` local to that machine |
| **Socket** | `~/.config/herdr/herdr.sock` **always local** on the box running the pane |
| **Hub checklist** | `herdr/studex-ops.md` on Mac Mini |
| **Company tasks** | Paperclip `:3100` — one queue, all agents |

VM bootstrap: clone repo, `install-herdr.sh`, open Obsidian (or sync vault), run steps in `herdr/dark-factory.md` on **that** VM.

---

## 3 — One Drive (Stud-Bot-Depo)

All hosts use the **same** folder:

[Stud-Bot-Depo](https://drive.google.com/drive/u/2/folders/1HpmisLt5bLxAMtjtU5pwt2PxKIqxwvs6)

```bash
# On whichever machine did the work (MacBook, MSI, VM)
cd ~/Portable-agents
./scripts/agent-work-archive.sh
```

Layout: `<hostname>/<date>-planning-am/` and `...-pm/` from daily scripts. See [DEPLOY_TIMELINE_AND_SAVES.md](./DEPLOY_TIMELINE_AND_SAVES.md).

---

## 4 — LLM wiki (Obsidian `brain/`)

The **wiki** is not a separate product — it is your vault:

| Path | Content |
|------|---------|
| `brain/wiki/` | Stable app facts, links to Graphify/Floorplan summaries |
| `brain/apps/portable-agents.md` | God nodes, subsystem list (from Graphify) |
| `brain/daily/YYYY-MM-DD-07-objectives.md` | Morning objectives |
| `brain/daily/YYYY-MM-DD-19-close.md` | Evening close |

Agents read wiki via Obsidian + Cursor rules (“check `brain/wiki/` before refactors”). **Notion Memory** holds one-liners only — [APP_MAP_DAILY_ROUTINE.md](./APP_MAP_DAILY_ROUTINE.md).

---

## 5 — Graphify + Floorplan twice daily

Install once: `npm run planning:setup` ([CLIENT_BUILD_PLANNING.md](./CLIENT_BUILD_PLANNING.md)).

### 07:00 — objectives

| Step | Command / action |
|------|------------------|
| 1 | `git pull` · `npm run factory:status` |
| 2 | Open **Floorplan** — “What should we prioritize today?” / Recent work |
| 3 | **Graphify** — `GRAPH_REPORT.md` god nodes or `graphify explain` on today’s ZTE area |
| 4 | `npm run daily:routine -- --slot 07-objectives` |
| 5 | Edit `DAILY_SUMMARY.md` → paste objectives into `brain/daily/...-07-objectives.md` |
| 6 | Notion CEO brief + Factory Board **Building** cards (3 max) |

### 19:00 — close

| Step | Command / action |
|------|------------------|
| 1 | Floorplan — update map if code changed |
| 2 | Optional Graphify refresh after large merges |
| 3 | `npm run daily:routine -- --slot 19-close` |
| 4 | `npm run ops:status-report -- pm` |
| 5 | `agent-work-archive.sh` → Drive |
| 6 | Notion consolidated daily (5 lines) |

**Mac cron (optional):** only reminders — you still approve ▶ in Obsidian:

```cron
0 7 * * * cd ~/Portable-agents && npm run daily:routine -- --slot 07-objectives
0 19 * * * cd ~/Portable-agents && npm run daily:routine -- --slot 19-close && ./scripts/agent-work-archive.sh
```

Vault checklist: `integrations/obsidian-herdr/daily-wiki-routine.md.example`.

---

## 6 — OpenBot in the daily loop

| 07:00 | Ask **Ada** in OpenBot: “Summarize factory queue + pick 3 objectives.” Paste into daily note → Herdr ▶ on first ZTE line. |
| Day | **Linus** builds in OpenBot/Herdr; hand off to **Grace** for review before Shipped. |
| 19:00 | OpenBot: “What failed?” → close note + archive. |

---

## Related

- [OBSIDIAN_COMPANY_HUB.md](./OBSIDIAN_COMPANY_HUB.md)
- [NOTION_OBSIDIAN_OPS_BRIDGE.md](./NOTION_OBSIDIAN_OPS_BRIDGE.md)
- [STUDEX_OPERATING_SYSTEM.md](./STUDEX_OPERATING_SYSTEM.md)