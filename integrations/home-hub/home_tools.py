#!/usr/bin/env python3
"""Studex home hub tools — Samsung TV, JVC CEC, Phonon speak, game URIs."""
from __future__ import annotations

import json
import os
import subprocess
import urllib.error
import urllib.request
from typing import Any


def _env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def tv_samsung(action: str) -> str:
    """Send a key or command to Samsung TV via samsungtvws if installed."""
    ip = _env("SAMSUNG_TV_IP")
    if not ip:
        return "SAMSUNG_TV_IP not set in home.env"
    try:
        from samsungtvws import SamsungTVWS  # optional: pip install samsungtvws
    except ImportError:
        return (
            "Install samsungtvws on the hub: pip install samsungtvws. "
            f"Would send {action!r} to {ip}"
        )

    token = _env("SAMSUNG_TV_TOKEN") or None
    name = _env("SAMSUNG_TV_NAME", "StudexHomeHub")
    tv = SamsungTVWS(host=ip, port=8002, name=name, token=token)
    key_map = {
        "power": "KEY_POWER",
        "volume_up": "KEY_VOLUP",
        "volume_down": "KEY_VOLDOWN",
        "mute": "KEY_MUTE",
        "home": "KEY_HOME",
        "hdmi1": "KEY_HDMI1",
        "hdmi2": "KEY_HDMI2",
        "hdmi3": "KEY_HDMI3",
        "hdmi4": "KEY_HDMI4",
        "netflix": "KEY_NETFLIX",
        "back": "KEY_RETURN",
    }
    key = key_map.get(action.lower().replace("-", "_"))
    if not key:
        return f"Unknown Samsung action {action!r}. Known: {', '.join(key_map)}"
    tv.send_key(key)
    return f"Samsung TV {ip}: sent {key}"


def tv_jvc(action: str) -> str:
    """JVC via cec-client (Linux) or optional IR HTTP bridge."""
    bridge = _env("JVC_IR_BRIDGE_URL")
    if bridge:
        payload = json.dumps({"device": "jvc", "action": action}).encode()
        req = urllib.request.Request(
            bridge, data=payload, headers={"Content-Type": "application/json"}, method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                return resp.read().decode()[:500]
        except urllib.error.URLError as e:
            return f"IR bridge error: {e}"

    port = _env("JVC_HDMI_PORT", "1")
    cec_map = {
        "power": "standby 0",
        "volume_up": "volup",
        "volume_down": "voldown",
        "input_hdmi1": f"as {port}",
    }
    cmd = cec_map.get(action.lower())
    if not cmd:
        return f"Unknown JVC action {action!r}. Known: {', '.join(cec_map)}"
    try:
        out = subprocess.run(
            ["cec-client", "-s", "-d", "1"],
            input=cmd + "\n",
            capture_output=True,
            text=True,
            timeout=8,
            check=False,
        )
        if out.returncode != 0 and "cec-client" in (out.stderr or ""):
            return "cec-client not installed (sudo apt install cec-utils on Linux hub)"
        return f"JVC CEC: {cmd} → {out.stdout.strip() or 'ok'}"
    except FileNotFoundError:
        return "cec-client not found — set JVC_IR_BRIDGE_URL or install cec-utils on hub"


def speak_phonon(text: str) -> str:
    """Run phonon_speak.py sibling script."""
    if _env("PHONON_ENABLED", "false").lower() not in ("1", "true", "yes"):
        return f"[phonon disabled] {text[:200]}"
    script = os.path.join(os.path.dirname(__file__), "phonon_speak.py")
    try:
        out = subprocess.run(
            ["python3", script, text],
            capture_output=True,
            text=True,
            timeout=120,
            check=False,
        )
        return out.stdout.strip() or out.stderr.strip() or "phonon done"
    except Exception as e:
        return f"phonon error: {e}"


def launch_game(target: str) -> str:
    """Return launch URI / instruction for lounge clients."""
    t = target.strip().lower()
    if t == "steam_bigpicture":
        return "open steam://open/bigpicture on the gaming PC or Samsung Steam Link app"
    if t.startswith("steam_app:"):
        app_id = t.split(":", 1)[1]
        return f"steam://run/{app_id}"
    if t == "moonlight":
        return "moonlight:// — pair Moonlight client to MSI/NVIDIA host"
    if t.startswith("samsung_app:"):
        app = t.split(":", 1)[1]
        return tv_samsung(app) if app in ("netflix",) else f"Use Samsung hub launch_app for {app}"
    return f"Unknown launch target {target!r}. Try steam_bigpicture, steam_app:570, moonlight"


def scene_lounge(name: str) -> str:
    scenes = {
        "movie": ["tv_samsung:hdmi1", "tv_jvc:power", "speak:Movie mode"],
        "gaming": ["tv_samsung:hdmi2", "launch:steam_bigpicture"],
        "off": ["tv_samsung:power", "tv_jvc:power"],
    }
    steps = scenes.get(name.lower())
    if not steps:
        return f"Unknown scene {name!r}. Known: {', '.join(scenes)}"
    results = []
    for step in steps:
        kind, _, arg = step.partition(":")
        if kind == "tv_samsung":
            results.append(tv_samsung(arg))
        elif kind == "tv_jvc":
            results.append(tv_jvc(arg))
        elif kind == "speak":
            results.append(speak_phonon(arg))
        elif kind == "launch":
            results.append(launch_game(arg))
    return " | ".join(results)


def dispatch(tool: str, **kwargs: Any) -> str:
    table = {
        "tv_samsung": lambda: tv_samsung(kwargs.get("action", "home")),
        "tv_jvc": lambda: tv_jvc(kwargs.get("action", "power")),
        "speak_phonon": lambda: speak_phonon(kwargs.get("text", "")),
        "launch_game": lambda: launch_game(kwargs.get("target", "")),
        "scene_lounge": lambda: scene_lounge(kwargs.get("name", "gaming")),
    }
    fn = table.get(tool)
    if not fn:
        return f"Unknown tool {tool!r}"
    return fn()


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: home_tools.py <tool> [json-args]")
        raise SystemExit(1)
    tool_name = sys.argv[1]
    args = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
    print(dispatch(tool_name, **args))
