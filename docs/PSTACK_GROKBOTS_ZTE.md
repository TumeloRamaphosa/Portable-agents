# pstack + Grokbots + Zero Touch Engineering

Three layers that stack cleanly on Portable Agents:

| Layer | What | Where |
|-------|------|--------|
| **pstack** | Rigorous engineering skills (`/poteto-mode`, `/interrogate`, `/arena`, …) | Cursor plugin — `/add-plugin pstack` |
| **Grokbots** | Named Grok-forward delegates (build, fix, perf, ship) | `factory/grokbots/registry.json` |
| **ZTE factory** | Intake → playbook → verify → ship with policy gates | `factory/`, `mission-control/factory/` |

## Quick start

1. `/add-plugin pstack` then `/setup-pstack` (or use repo `.cursor/rules/pstack-models.mdc`).
2. Read `factory/README.md` and open **Factory OS**: `mission-control/factory/index.html`.
3. For autonomous-style runs, agents follow `.cursor/skills/grokbots-zero-touch/SKILL.md`.
4. Durable prefs: `.cursor/skills/permanent-memory/SKILL.md` + Notion Memory.

## Relation to other ops

- **Mission Control** (`mission-control/index.html`) — business / sovereign missions (PwC, Rwanda, DC).
- **claude-ops** — optional Claude Code business harness ([NEEDLE_AND_OPS_STACK.md](./NEEDLE_AND_OPS_STACK.md)).
- **live-agent-demo** — pulse watcher pattern; factory pulse logs to `factory/pulse/events.jsonl`.

## Default model policy

Code delegates → **Grok** (`grok-4.7-xhigh-fast`). Judgment, interrogate panels, hardest prose → **Opus**. Matches pstack defaults; override with `/setup-pstack`.

## Policy gates (not zero-touch)

Items in `factory/grokbots/registry.json` → `policyGates`: NDA unsigned, production secrets, billing — require human approval before ship.
