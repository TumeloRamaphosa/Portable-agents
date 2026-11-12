"""
Portable Agents tool surface for Cactus Needle (https://github.com/cactus-compute/needle).

Mirrors mission-control/live-agent-demo and course POV state.
AbuZar Termux Needle (https://github.com/AbuZar-Ansarii/Needle) can expose the same intents via Termux-API;
this module is the Studex / Black Cloud training + pulse slice.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parent.parent
PULSE = REPO_ROOT / "mission-control" / "live-agent-demo" / "pulse.txt"
OUT_DIR = REPO_ROOT / "mission-control" / "live-agent-demo" / "out"
COURSE_JSON = REPO_ROOT / "mission-control" / "course" / "data" / "default-course.json"
STATE_FILE = ROOT / ".studbot_course_index"

try:
    import needle
except ImportError:  # pragma: no cover - dev without cactus-needle wheel
    needle = None  # type: ignore


def _load_course() -> list[dict]:
    if COURSE_JSON.exists():
        data = json.loads(COURSE_JSON.read_text(encoding="utf-8"))
        return data.get("steps", [])
    return []


def _course_index() -> int:
    if STATE_FILE.exists():
        try:
            return int(STATE_FILE.read_text(encoding="utf-8").strip())
        except ValueError:
            pass
    return 0


def _set_course_index(idx: int) -> None:
    STATE_FILE.write_text(str(idx), encoding="utf-8")


def _parse_pulse(text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip()
    return out


def _pulse_anomaly(data: dict[str, str]) -> tuple[bool, str]:
    reasons: list[str] = []
    temp_raw = data.get("cpu_temp_c", "")
    try:
        temp = float(temp_raw)
        if temp > 70:
            reasons.append(f"cpu_temp_c={temp:g} > 70")
    except ValueError:
        if temp_raw:
            reasons.append(f"cpu_temp_c invalid ({temp_raw})")
    status = data.get("status", "ok").lower()
    if status != "ok":
        reasons.append(f"status={status!r} != ok")
    return (len(reasons) > 0, "; ".join(reasons))


# --- Tool implementations (plain functions; wrapped with @needle.tool when available) ---


def get_needle_bearing() -> dict:
    steps = _load_course()
    idx = _course_index()
    next_idx = min(idx + 1, len(steps) - 1) if steps else 0
    bearing = float(steps[next_idx].get("bearing", 0)) if steps else 0.0
    return {
        "bearing_deg": bearing,
        "checkpoint": idx + 1,
        "total": len(steps),
        "next_title": steps[next_idx].get("title", "complete") if steps else "n/a",
    }


def advance_pov_course() -> dict:
    steps = _load_course()
    idx = _course_index()
    if steps and idx < len(steps) - 1:
        idx += 1
        _set_course_index(idx)
    return get_needle_bearing()


def read_pulse() -> dict:
    if not PULSE.exists():
        return {"error": "pulse.txt not found", "path": str(PULSE)}
    data = _parse_pulse(PULSE.read_text(encoding="utf-8"))
    anomaly, reason = _pulse_anomaly(data)
    return {
        "cpu_temp_c": data.get("cpu_temp_c"),
        "status": data.get("status", "ok"),
        "anomaly": anomaly,
        "reason": reason or None,
    }


def write_autonomous_note() -> dict:
    pulse = read_pulse()
    if not pulse.get("anomaly"):
        return {"written": False, "message": "No anomaly; note not required."}
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    note_path = OUT_DIR / "AUTONOMOUS_NOTE.md"
    log_path = OUT_DIR / "actions.log"
    body = (
        f"# Autonomous agent note (Cactus Needle)\n\n"
        f"**Detected:** {ts} UTC\n\n"
        f"## Pulse\n\n"
        f"- cpu_temp_c: {pulse.get('cpu_temp_c')}\n"
        f"- status: {pulse.get('status')}\n\n"
        f"## Anomaly\n\n{pulse.get('reason')}\n"
    )
    note_path.write_text(body, encoding="utf-8")
    with log_path.open("a", encoding="utf-8") as f:
        f.write(f"{ts} ANOMALY {pulse.get('reason')}\n")
    return {"written": True, "note": str(note_path), "log": str(log_path)}


def build_needle_agent():
    if needle is None:
        raise RuntimeError(
            "Install Cactus Needle: pip install cactus-needle "
            "(https://github.com/cactus-compute/needle)"
        )

    @needle.tool
    def get_needle_bearing_tool():
        "NEEDLE compass bearing and next POV course checkpoint for Portable Agents."
        return get_needle_bearing()

    @needle.tool
    def advance_pov_course_tool():
        "Advance one checkpoint in the POV course."
        return advance_pov_course()

    @needle.tool
    def read_pulse_tool():
        "Read pulse.txt cpu_temp_c and status from live-agent-demo."
        return read_pulse()

    @needle.tool
    def write_autonomous_note_tool():
        "Write AUTONOMOUS_NOTE.md if pulse is anomalous."
        return write_autonomous_note()

    return needle.Needle(
        tools=[
            get_needle_bearing_tool,
            advance_pov_course_tool,
            read_pulse_tool,
            write_autonomous_note_tool,
        ]
    )
