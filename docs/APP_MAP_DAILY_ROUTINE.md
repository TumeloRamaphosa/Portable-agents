# Understand our app — Graphify + Floorplan + agent memory + daily reports

How Studex uses **[Graphify](https://github.com/Graphify-Labs/graphify)** and **[Floorplan](https://github.com/haydenschmitty/floorplan)** to **know the app**, feed **agent memory**, and produce **09:00 / 17:00-style** planning reports (aligned with [Studex Command Centre](https://app.notion.com/p/3f53ef07399281548222f765b9cac2f9) rhythm).

Install first: [CLIENT_BUILD_PLANNING.md](./CLIENT_BUILD_PLANNING.md) · `npm run planning:setup`

---

## What each tool tells you about *our* app

| Question | Ask / use | Output |
|----------|-----------|--------|
| What are the big subsystems? | Floorplan map (top zoom) | Parts in plain English |
| What connects to what? | Graphify `graphify path A B` | Hops with EXTRACTED vs INFERRED |
| What did we change today? | Floorplan **Recent work** | Green cards + why |
| What is risky before ship? | Floorplan **Health check** | Keys, open endpoints, fixes |
| What should agents read first? | Graphify `GRAPH_REPORT.md` | God nodes, communities, suggested questions |
| How does checkout / auth work? | Floorplan **Ask the map** or Graphify `graphify explain "X"` | Walkthrough without reading every file |

**Portable-agents** is the first app to map: run both tools on this repo, then repeat per client repo under `~/clients/<slug>/`.

---

## Agent memory (four layers — same facts, different retrieval)

| Layer | What to store | How agents use it |
|-------|----------------|-------------------|
| **1 — Live graph (code)** | `graphify-out/graph.json` + `GRAPH_REPORT.md` on dev machine | Cursor/Claude: “Use `graphify-out/GRAPH_REPORT.md` and `graphify query` for structure” |
| **2 — Live map (human)** | `floorplan/` folder (local, gitignored) | Claude: “Update the floorplan” keeps Recent work current |
| **3 — Obsidian `brain/`** | Weekly paste: *3 god nodes, 3 risks, 3 open questions* from Graphify + Floorplan health summary | RAG + Herdr checklists |
| **4 — Notion Memory** | Short facts only: “Portable-agents verify API = Cloud Run”, “Factory queue in git” — **never keys** | `notion-memory-search` on Mac |

**Do not** upload `graph.json` with paths that contain secrets, or Health check raw findings, to public Drive. Sanitize first.

### Seed memory after first map (once per repo)

```bash
cd ~/Portable-agents
# Graphify
/graphify .                    # in Cursor or Claude
# Floorplan
# "Make me a floorplan of this app."
```

Then in Obsidian `brain/apps/portable-agents.md` (create):

```markdown
## Structure (from Graphify, YYYY-MM-DD)
- (paste 5 bullets from GRAPH_REPORT.md — subsystems only)

## How it fits together (from Floorplan)
- (paste part names: Mission Control, Studbot, factory, api, etc.)

## Open risks
- (from Floorplan Health — counts only, not secret locations)
```

Notion Memory (optional one-liner): *“Portable-agents architecture snapshots live in Obsidian brain/apps/portable-agents.md; graphs local in graphify-out/.”*

---

## Daily routine (SAST — match Command Centre 09:00 / 17:00)

### Morning (≈ 09:00) — orient

| Step | Action | Who |
|------|--------|-----|
| 1 | `git pull` + `npm run factory:status` | Mac / MSI |
| 2 | If yesterday had merges: **Floorplan** → “Update the floorplan” | Claude Code pane |
| 3 | If big refactor: **Graphify** → `/graphify .` or `graphify explain "<yesterday's area>"` | Cursor |
| 4 | Copy **Recent work** + top 3 Health issues (titles only) into Obsidian `brain/daily/YYYY-MM-DD-am.md` | Human or agent |
| 5 | `./scripts/planning-daily-report.sh --slot am` | Mac |
| 6 | Notion CEO AM brief / Agent Dashboard — paste **summary paragraph** from report (no paths with secrets) | You |

### Evening (≈ 17:00) — report + plan

| Step | Action |
|------|--------|
| 1 | Floorplan: note **Recent work** vs factory queue **ZTE-*** items |
| 2 | Graphify: optional `graphify query "what changed around X"` if agents touched core paths |
| 3 | `./scripts/planning-daily-report.sh --slot pm` |
| 4 | `./scripts/agent-work-archive.sh` → Stud-Bot-Depo |
| 5 | Obsidian `brain/daily/YYYY-MM-DD-pm.md`: *Done / Blocked / Tomorrow* + link to archived report |
| 6 | Notion consolidated daily — 5 lines max from pm report |

**Phone:** read Obsidian daily note + Mission Control; do not run Graphify/Floorplan on Termux.

---

## Planning next work (weekly + per client)

| Cadence | Floorplan | Graphify | Output |
|---------|-----------|----------|--------|
| **New feature** | Ask map: “If we add X, what breaks?” | `graphify path` from entrypoint to data | PR scope in vault |
| **New client** | Blueprint from PRD | `/graphify` on legacy repo if any | `brain/clients/<slug>/plan.md` |
| **Friday** | Export floorplan HTML snapshot | Refresh full `/graphify .` | Drive `planning/weekly/` via archive script |

Factory queue (`factory/intake/queue.json`) stays source of truth for **ZTE**; daily notes reference ZTE ids touched that day.

---

## Scripts

```bash
npm run planning:setup          # once
npm run planning:daily-report   # am or pm
npm run planning:daily-report -- --slot pm
```

`planning-daily-report.sh` stages under `~/.studex/archive/.../planning/`:

- `git-status.txt`, `factory-status.txt`
- `graph-report-excerpt.md` (if `graphify-out/GRAPH_REPORT.md` exists, first ~80 lines sanitized)
- `floorplan-recent.txt` (if `floorplan/` has metadata — best-effort)
- `DAILY_SUMMARY.md` — template you or Claude fills in one paste for Notion

Then run `agent-work-archive.sh` to push bundle toward Drive.

---

## Prompts to use in Claude / Cursor

**Understand the app**

- “Read `graphify-out/GRAPH_REPORT.md` and explain Portable-agents in 10 bullets for a new engineer.”
- “Open the floorplan and trace what happens when Studbot unlock runs.”

**Agent memory refresh**

- “Compare today’s floorplan Recent work with `factory/intake/queue.json` and list which ZTE items moved.”

**Daily report (pm)**

- “Using `planning/DAILY_SUMMARY.md` template in today’s archive folder, write the 17:00 report: done, risks, tomorrow. No secrets.”

---

## Related

- [CLIENT_BUILD_PLANNING.md](./CLIENT_BUILD_PLANNING.md)
- [DEPLOY_TIMELINE_AND_SAVES.md](./DEPLOY_TIMELINE_AND_SAVES.md)
- [OBSIDIAN_COMPANY_HUB.md](./OBSIDIAN_COMPANY_HUB.md)
- Obsidian: `integrations/obsidian-herdr/daily-app-map-report.md.example`
- Factory **ZTE-015**