# Client builds + planning — Graphify + Floorplan

Use both together when you **ship software for clients** and need **planning** before and during build.

| Tool | Repo | License | Best for |
|------|------|---------|----------|
| **[Graphify](https://github.com/Graphify-Labs/graphify)** | AST → knowledge graph, `/graphify` skill | Apache-2.0 | **Understanding** large or unfamiliar code; cross-file queries; aligns with Notion **Work Graph** skill |
| **[Floorplan](https://github.com/haydenschmitty/floorplan)** | Plain-English **interactive map** | MIT | **Explaining** the app to clients/onboarding; health check before handoff; **blueprint from PRD** before code exists |

**Together:** plan with **Floorplan blueprint** (PRD) → build → **Graphify** for deep structure + **Floorplan map** for client-facing “how it fits together.”

---

## Roles in Studex workflow

```
Client intake (spec / PRD)
        │
        ▼
  Floorplan blueprint  ──►  agreed scope + parts (dashed “plan” map)
        │
        ▼
  Build (Portable-agents, GCP, Herdr panes)
        │
        ├── Graphify on repo + client repo  ──►  graph.json, GRAPH_REPORT.md
        └── Floorplan on working tree       ──►  floorplan/ (gitignored locally)
        │
        ▼
  Client deliverable: export floorplan HTML + sanitized GRAPH_REPORT + Drive archive
```

| Phase | Graphify | Floorplan |
|-------|----------|-----------|
| **Discovery** | Map existing client legacy repo if any | Blueprint from PRD: “Make a floorplan from this spec” |
| **Build** | `/graphify` after major merges | “Update the floorplan” after each milestone |
| **Review** | `graphify path` / explain high-risk nodes | Health check → fix prompts before prod |
| **Handoff** | Share `GRAPH_REPORT.md` (no secrets) | Export floorplan HTML for client read-only |

**Do not commit** `graphify-out/` or `floorplan/` to client repos unless the client wants them; default is local-only (Floorplan already self-ignores).

---

## Install (MacBook / MSI / WSL — not phone)

One shot from Portable-agents:

```bash
./scripts/planning-tools-setup.sh
```

### Graphify (Cursor, Claude Code, Codex)

```bash
# Python 3.11+
uv tool install graphifyy    # or: pipx install graphifyy
graphify install              # registers skill for detected assistant
```

In Cursor or Claude:

```
/graphify .
```

Output: `./graphify-out/graph.html`, `GRAPH_REPORT.md`, `graph.json`

Docs: [docs.graphify.com](https://docs.graphify.com)

### Floorplan (Claude Code or Codex)

Requires **`claude`** CLI working ([install-claude-cli.sh](../scripts/install-claude-cli.sh)).

```bash
claude plugin marketplace add haydenschmitty/floorplan
claude plugin install floorplan@floorplan
```

In a new Claude session:

> Make me a floorplan of this app.

**Before code exists (client planning):**

> Here's our PRD. Make me a floorplan of what we'd need to build.

Demo: [floorplan-demo](https://haydenschmitty.github.io/floorplan-demo/)

**Codex:** same marketplace `haydenschmitty/floorplan` — see upstream [docs/codex.md](https://github.com/haydenschmitty/floorplan/blob/main/docs/codex.md).

---

## Client GCP pattern

Per [GCP_SETUP.md](./GCP_SETUP.md): one project (or folder) per client. Run Graphify + Floorplan **on the dev Mac** against a clone; never on production credentials in the map scan.

1. Clone `Portable-agents` + client app repo under `~/clients/<slug>/`
2. Graphify both if multi-repo
3. Floorplan parent folder holding both repos (upstream supports multi-repo)
4. Archive: `./scripts/agent-work-archive.sh` + export floorplan HTML → Stud-Bot-Depo `clients/<slug>/`

---

## Notion + Obsidian

- Notion **Work Graph** (Command Centre) = business/agent graph; **Graphify** = code graph — complementary.
- Obsidian checklist: `integrations/obsidian-herdr/client-build-planning.md.example` → `herdr/client-build.md`

Factory: **ZTE-015**.

---

## Daily reports + agent memory

See **[APP_MAP_DAILY_ROUTINE.md](./APP_MAP_DAILY_ROUTINE.md)** — 09:00/17:00 rhythm, Obsidian `brain/`, Notion paste, `npm run planning:daily-report`.

## Related

- [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) — client GCP template
- [DEPLOY_TIMELINE_AND_SAVES.md](./DEPLOY_TIMELINE_AND_SAVES.md)
- [NOTION_VM_COMMAND.md](./NOTION_VM_COMMAND.md)