# Zero Touch Engineering factory

Repo-local **software engineering factory** for Studex: **pstack** playbooks + **Grokbots** (Grok delegates) + Mission Control ops surface.

## Install pstack (Cursor)

In any Cursor chat on this repo:

```
/add-plugin pstack
/setup-pstack
```

Then run rigorous work with verification baked in:

```
/poteto-mode add feature X; verify npm run typecheck passes
```

Pick **`/poteto-mode` from the `/` menu** so Cursor attaches the skill.

Marketplace: [cursor.com/marketplace/cursor/pstack](https://cursor.com/marketplace/cursor/pstack) · Source: [cursor/plugins/pstack](https://github.com/cursor/plugins/tree/main/pstack)

## Grokbots

| ID | Role |
|----|------|
| GROK-BUILD | Features / refactors |
| GROK-FIX | Bug-fix + TDD |
| GROK-PERF | Perf + benchmarks |
| GROK-ARCH | Architect / how / why |
| GROK-JUDGE | Interrogate / arena |
| GROK-SHIP | CI + PR land |

Full registry: `factory/grokbots/registry.json`

Model map (committed): `.cursor/rules/pstack-models.mdc`  
Agent skill: `.cursor/skills/grokbots-zero-touch/SKILL.md`

## Intake queue

Append work to `factory/intake/queue.json`. Agents mark items `done` after verify + ship.

```bash
npm run factory:status
```

## Pulse

Append-only `factory/pulse/events.jsonl` for factory anomalies (failed verify, policy block).

## Mission Control

Open `mission-control/factory/index.html` for the factory OS dashboard (Grokbots fleet + queue + pstack checklist).
