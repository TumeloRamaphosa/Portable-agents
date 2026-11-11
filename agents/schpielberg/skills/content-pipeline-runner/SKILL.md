---
name: schpielberg-content-pipeline-runner
description: Use when operating or extending the Studex Content Pipeline runner snapshot—heartbeat, queue poll, dry-run script/voice/pictures/stitch steps; publishing stays disabled and credentials stay out of git.
version: 1.0.0
---

# Content pipeline runner (SCHPIELBERG)

## When to use

- Understanding how **Idea/Script** items move through local steps
- Porting the runner to another environment **without** enabling publish
- Debugging readiness JSON and job logs

Source tree: [`runner/`](../../runner/).

## Safety defaults (non-negotiable)

| Setting | Expected |
|---------|----------|
| `PIPELINE_DRY_RUN` | `true` (default in `.env.example` and `Config`) |
| Publish step | **`publish: disabled`** in readiness (`steps.describe_readiness`) |
| Blocked hosts | `blotato.com`, `higgsfield`, `freepik` rejected in `runner.py` |
| Secrets | Only in secure box; use [`.env.example`](../../runner/.env.example) placeholders in git |

Do not commit `.env`. Do not merge dashboard PR or set live tokens without Agent Chief Lord go (see `memory/projects-and-state.md`).

## Architecture (this snapshot)

```
runner.py          main loop: signal handling, poll interval, cycle
steps.py           ScriptStep → VoiceStep → PicturesStep → StitchStep
status.sh          local health: process + log tails (adapt paths on deploy)
logs/              created at runtime (not shipped)
work/<item_id>/    per-item artifacts (script-draft.txt, etc.)
```

### Cycle

1. **Heartbeat** — POST when API base + token configured; otherwise `not_configured` (logged, no crash)
2. **Queue** — GET items; filter `stage` in `idea`, `script`
3. **Per item** — run `STEPS` in order; append `jobs.jsonl`; optional PATCH back to API
4. **Script step** — calls Gemini-compatible chat API **only if** key configured; writes local draft
5. **Voice / pictures** — return `not_configured` or `named_but_unwired` until wired
6. **Stitch** — ffmpeg only when real inputs exist; never fakes media

## Operate locally (reference)

```bash
cd agents/schpielberg/runner
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit only on machine with secure box values — never commit
python3 runner.py
```

Expect idle loops when API or provider keys are empty.

## Extend

- Add a `Step` class in `steps.py` and append to `STEPS`
- New outbound URLs must pass `assert_url_allowed`
- Any publish/send step must remain off unless explicitly approved **and** reviewed for compliance with standing rules

## Dashboard context

Product UI is described in `memory/projects-and-state.md` (Global Markets `/content-pipeline`, PR reference only). Screenshots: [`work/screenshots/`](../../work/screenshots/).

## Never

- Set `PIPELINE_DRY_RUN=false` in shared automation without human approval
- Add API keys to this repository
- Call Blotato or paid gen hosts from runner code
