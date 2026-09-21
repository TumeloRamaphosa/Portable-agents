# Needle + Studbot stack (what we mean by “Needle”)

Portable Agents uses **three different “Needle / ops” references**. They work together; they are not the same repo.

| Project | URL | Role for Studex / Portable Agents |
|---------|-----|----------------------------------|
| **Cactus Needle** | [cactus-compute/needle](https://github.com/cactus-compute/needle) | **On-device agent brain** (~8–29 MB). Tool calling + extraction on phone/edge. Powers Studbot agent loops via `cactus-needle` Python or `.cact` on Android. |
| **AbuZar Needle** | [AbuZar-Ansarii/Needle](https://github.com/AbuZar-Ansarii/Needle) | **Reference Termux assistant** built on Cactus Needle 2 — Flask UI, Telegram, Termux-API (torch, SMS, etc.). Use as a pattern for phone-side agents; we do not fork it into this repo. |
| **claude-ops** | [Lifecycle-Innovations-Limited/claude-ops](https://github.com/Lifecycle-Innovations-Limited/claude-ops) | **Developer / business ops harness** for Claude Code (briefings, CI, inbox). Optional complement to **Mission Control** for teams running Studex on laptops — install as a plugin, not bundled here. |
| **Course NEEDLE panel** | `mission-control/course/` | **POV navigation compass UI** (bearing to next checkpoint). Visual layer only; state is shared with Studbot tools. |

## Recommended architecture

```
Operator
   │
   ├─ Web: mission-control/ + course NEEDLE compass
   ├─ Web: studbot/ (+ Shopify subscription gate)
   ├─ Android: studbot-android/ (ADK Kotlin and/or Cactus Needle engine)
   └─ Phone agent: Cactus Needle tools ← integrations/cactus-needle/
              ↑
   Optional: AbuZar-style Termux host (AbuZar-Ansarii/Needle)
```

## On-device agent (Cactus)

```bash
cd integrations/cactus-needle
pip install -r requirements.txt   # optional: cactus-needle when on supported platform
python studbot_agent.py
```

Tool definitions live in `tools.json` (for `needle platform finetune`) and `portable_agents_tools.py`.

## Android paths

1. **Google ADK Kotlin** + LiteRT-LM / ML Kit — `studbot-android/` (see README).
2. **Cactus Needle** — ship `needle3.cact` + tools; same tool names as Python (`get_needle_bearing`, `advance_pov_course`, `read_pulse`).
3. **Termux** — deploy [AbuZar-Ansarii/Needle](https://github.com/AbuZar-Ansarii/Needle) on device; point operators at Mission Control URLs from Studbot.

## claude-ops (optional)

For **Mission Control–style ops on Claude Code** (infra, PRs, revenue widgets), install claude-ops separately:

```bash
# See https://github.com/Lifecycle-Innovations-Limited/claude-ops
/plugin install ops@ops-marketplace
/ops:go
```

That does not replace `mission-control/index.html` for Rwanda/PwC demos; it augments how your team runs the business day-to-day.

## Shopify subscription

Studbot access can be gated on a **monthly Shopify plan** — see `shopify/MERCHANT_SETUP.md`.
