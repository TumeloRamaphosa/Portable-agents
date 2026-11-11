# Studex Command Centre — stack alignment

**Purpose:** One page so Notion operators, runtime repos, and content agents read the same story.
**Authority for tasks and approvals:** [Studex Command Centre](https://app.notion.com/p/Studex-Command-Centre-3f53ef07399281548222f765b9cac2f9) (09:00 / 17:00 SAST briefs, Agent Dashboard, Factory Board). **Sentinel** owns build order in Notion Projects—not this file.

Nothing here grants permission to post, send, spend, deploy or merge. Agent Chief Lord approves those gates.

---

## Three layers

| Layer | Where | What agents do |
|-------|--------|----------------|
| **Operator rhythm** | Notion Command Centre + business command logs (e.g. [Coffee Command](https://app.notion.com/p/Coffee-Command-10-October-2026-3f53ef073992818e9bd5cf9817ad2ccf)) | Evidence, decisions, dashboard rows—**not** auto-synced to git |
| **Portable knowledge** | [Portable-agents](https://github.com/TumeloRamaphosa/Portable-agents) (this repo) | Read rules, OS design, client templates, **Schpielberg** content library, Mission Control |
| **Runtime fleet** | [Linux-Studex-](https://github.com/TumeloRamaphosa/Linux-Studex-) | Run UTM VMs, `dashboard.html`, OpenClaw **:3000–3013**, `server/`, OpenRig rig |

```text
Notion (tasks + approvals)     git (portable truth)          metal (execution)
        │                              │                            │
        └──────── manual evidence ──────┴──── clone on Mac host ─────┘
```

**Optional local operator HUD:** [Mark-LVI](https://github.com/FatihMakes/Mark-LVI) (evaluate; not Studex fleet control). Trial only per Command Centre notes—same approval gates as any desktop tool.

---

## This repo map (Portable-agents)

| Path | Role in Command Centre |
|------|-------------------------|
| `PLAN.md` | Integration phases and blockers |
| `docs/COMMAND-CENTRE.md` | This alignment page |
| `mission-control/` | Offline investor/ops console (P1 story) |
| `operating-system/` | Stud-Bot / Agent OS **design** + Hermes intake code (draft) |
| `voice-desk/` | Voice Desk **mock** (`127.0.0.1` only) |
| `dark-factory-knowledge/` | Sanitized desk summaries (incl. content blue team) |
| `clients/` | Offers, outreach templates, coffee intake script—no lead lists |
| `agents/schpielberg/` | **Canonical content plan & film work** for other agents |

---

## Content plan (single pointer)

Do not fork channel strategy in chat. Use:

1. `agents/schpielberg/memory/standing-rules.md`
2. `agents/schpielberg/work/plans/content-plan.md` (YouTube + daily series v2)
3. `agents/schpielberg/COLLABORATE.md` (how to request drafts)
4. `dark-factory-knowledge/content-blue-team.md` (blue-team workflow summary)

**Approval chain (all repos):** Charlie drafts → Naledi line-check → **Tumelo or Katlego** approve → only then schedule/send. Blotato/schedulers stay **draft-only** until that yes. **Never** post to Instagram `laisa_aesthetics`. Restricted parties per compliance list stay off all content.

**Linux-Studex- Naledi automation** must follow the same chain—no unattended publishing from FeedHive scripts until explicitly approved and wired to draft queues.

---

## Agent OS (single pointer)

Design and gates:

- `operating-system/agent-os-design.md` — layers, NEXUS approval queue, Sentinel feed
- `operating-system/README.md` — standing rules and folder index
- `operating-system/voice-desk-plan.md` + `../voice-desk/` — mock voice bridge

Runtime implementation lives in **Linux-Studex-** (VMs, gateway, pixel dashboard). When docs disagree, fix git and note evidence on the Agent Dashboard—do not treat README on either repo as a second task list.

---

## Hermes / intake (honest status)

Command Centre states: **Hermes connection not verified; no sync** to Factory boards. Each task still needs: title, project link, owner agent, acceptance evidence, approval gate, source id.

Intake code in `operating-system/hermes-intake/` is reference only—no deploy without approval.

---

## Coffee vs group command

- **Group:** [Studex Command Centre](https://app.notion.com/p/Studex-Command-Centre-3f53ef07399281548222f765b9cac2f9)
- **Coffee vertical:** daily command log rows + `clients/playbooks/coffee-intake-script.md` in this repo
- **Afrique Noir strategy (public-safe):** `agents/nozi-corp/afrique-noir-strategy-brief.md` (full memo private; marketplace/settlement phases 0–2; phase 3 ON HOLD)
- **Nozi desk:** `agents/nozi-corp/` — cadence, approval queue, launch checklist
- Coffee **launch gates** live in Notion evidence pages—not overridden by marketing drafts here

---

## Adding agent work

See `CONTRIBUTING.md`. Each agent: `agents/<name>/` + its own PR. Link back to this doc in the agent README.

---

*Updated for cross-repo alignment. No secrets on this page.*
