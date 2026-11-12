---
name: grokbots-zero-touch
description: Run Studex Zero Touch Engineering (ZTE) with Grokbots and pstack. Use when the user mentions grokbots, software engineering factory, zero touch engineering, pstack, /poteto-mode, parallel agents, or autonomous ship-to-main. Combines factory/intake queue, Mission Control factory OS, and pstack playbooks.
---

# Grokbots zero-touch factory

Studex **Grokbots** are pstack **code delegates** (Grok-fast) plus Opus **judgment** roles. The **factory** is repo-local ops: intake → playbook → parallel workers → verify → ship.

## Prerequisites

1. **pstack plugin** in Cursor chat: `/add-plugin pstack` ([marketplace](https://cursor.com/marketplace/cursor/pstack)).
2. **Model map**: run `/setup-pstack` once, or rely on repo `.cursor/rules/pstack-models.mdc`.
3. **Permanent memory**: use `.cursor/skills/permanent-memory/SKILL.md` + Notion Memory for durable prefs.

## Zero-touch loop (ZTE)

For each factory job:

1. **Intake** — Read `factory/intake/queue.json`. Pick the oldest item with `"status": "queued"`. If the user gave a new task, append an intake object (do not duplicate open work).
2. **Playbook** — Start the user-facing step with **`/poteto-mode`** (pick from the `/` menu so the skill attaches). Include a **verification criterion** in the same message, e.g. `verify npm run typecheck passes`.
3. **Delegate** — Let pstack route to feature / bug-fix / architect / arena / interrogate as needed. Spawn **Task** subagents with **Grok** models for implementation arms; use **Opus** only for judgment, prose, or interrogate panels per the rule file.
4. **Verify** — Run repo checks (`npm run typecheck`, targeted tests, or a project `verify-*` skill if present). Do not mark `done` without evidence.
5. **Ship** — Commit, push, update PR via ManagePullRequest. Set intake `"status": "done"` and `"completedAt"` (ISO).
6. **Pulse** — On failure or anomaly, append to `factory/pulse/events.jsonl` (one JSON object per line).

Human gates (NDA, production secrets, spend) stay **blocked** until explicitly cleared in intake `"policy"` — never zero-touch past those.

## Grokbots registry

Bot roles and pstack mapping live in `factory/grokbots/registry.json`. When naming work, assign `ownerBot` from that file.

## Mission Control

Operator dashboard: `mission-control/factory/index.html` (factory OS). Link from main Mission Control top bar.

## When not to use full ZTE

- One-line questions → answer in chat.
- User asked for review-only → no intake queue writes.
- Missing pstack → document `/add-plugin pstack` and proceed with normal Cursor agent workflow using the same verify criterion.
