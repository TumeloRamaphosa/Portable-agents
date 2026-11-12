#!/usr/bin/env python3
"""Watch pulse.txt and autonomously react to anomalies (Portable Agents proof demo)."""

from __future__ import annotations

import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PULSE = ROOT / "pulse.txt"
OUT_DIR = ROOT / "out"
NOTE_PATH = OUT_DIR / "AUTONOMOUS_NOTE.md"
ACTIONS_LOG = OUT_DIR / "actions.log"
POLL_SECONDS = 0.5


def parse_pulse(text: str) -> dict[str, str]:
    data: dict[str, str] = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        data[key.strip()] = value.strip()
    return data


def anomaly_reasons(data: dict[str, str]) -> list[str]:
    reasons: list[str] = []
    raw_temp = data.get("cpu_temp_c", "")
    try:
        temp = float(raw_temp)
        if temp > 70:
            reasons.append(f"cpu_temp_c={temp:g} > 70")
    except ValueError:
        reasons.append(f"cpu_temp_c invalid ({raw_temp!r})")

    status = data.get("status", "ok").strip().lower()
    if status != "ok":
        reasons.append(f"status={status!r} != ok")

    return reasons


def write_autonomous_outputs(data: dict[str, str], reasons: list[str]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    reason_line = "; ".join(reasons)

    lines = [
        "# Autonomous agent note",
        "",
        f"**Detected:** {ts} UTC",
        "",
        "## Pulse snapshot",
        "",
    ]
    for key in sorted(data):
        lines.append(f"- `{key}`: {data[key]}")
    lines.extend(
        [
            "",
            "## Anomaly",
            "",
            reason_line,
            "",
            "_Written by `agent.py` without a manual trigger — file watch only._",
            "",
        ]
    )
    NOTE_PATH.write_text("\n".join(lines), encoding="utf-8")

    with ACTIONS_LOG.open("a", encoding="utf-8") as log:
        log.write(f"{ts} ANOMALY {reason_line}\n")


def main() -> None:
    print(f"Watching {PULSE.name} (poll every {POLL_SECONDS}s). Ctrl+C to stop.")
    print("Try: set cpu_temp_c=75 or status=degraded while this runs.\n")
    last_raw: str | None = None

    while True:
        try:
            raw = PULSE.read_text(encoding="utf-8")
        except FileNotFoundError:
            time.sleep(POLL_SECONDS)
            continue

        if raw != last_raw:
            last_raw = raw
            data = parse_pulse(raw)
            reasons = anomaly_reasons(data)
            if reasons:
                write_autonomous_outputs(data, reasons)
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Anomaly → {NOTE_PATH.name}, {ACTIONS_LOG.name}")

        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    main()
