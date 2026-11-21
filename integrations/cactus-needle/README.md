# Cactus Needle × Portable Agents

On-device **Studbot** tools aligned with:

- [cactus-compute/needle](https://github.com/cactus-compute/needle) — model + `needle.Needle(tools=[...])`
- [AbuZar-Ansarii/Needle](https://github.com/AbuZar-Ansarii/Needle) — Termux phone agent reference (Cactus Needle 2 + Termux API)
- This repo — POV course, NEEDLE compass UI, `live-agent-demo` pulse

## Quick start

```bash
cd integrations/cactus-needle
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt   # may require supported OS/arch per Cactus docs
python studbot_agent.py
```

Without the wheel, use plain functions:

```bash
python -c "from portable_agents_tools import get_needle_bearing; print(get_needle_bearing())"
```

## Fine-tune on your tools

`tools.json` matches [Needle platform finetune](https://github.com/cactus-compute/needle#customisation):

```bash
export NEEDLE_API_KEY=needle_ft_...
needle platform generate --tools tools.json --examples 500 --out ./data
```

## AbuZar Needle (Termux)

For full phone control (torch, SMS, Telegram), clone and run upstream:

```bash
git clone https://github.com/AbuZar-Ansarii/Needle.git
```

Keep **Portable Agents** course/pulse tools here; extend AbuZar’s `app.py` to call `portable_agents_tools` if you want one combined agent.

## Android

- **studbot-android/** — ADK Kotlin tools mirror the same names (`get_needle_status`, `advance_course`, `read_pulse`).
- **Cactus** — `needle build --platform android-arm64` per [device guide](https://cactuscompute.com/blog/needle-supported-devices).
