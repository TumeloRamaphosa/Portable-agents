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
    if t in ("jellyfin", "jellyfin_web", "jellybox"):
        base = _env("JELLYFIN_WEB_URL") or _env("JELLYFIN_URL")
        if not base:
            return "Set JELLYFIN_URL in home.env — see docs/SELF_HOSTED_MUSIC.md"
        if t == "jellybox":
            return (
                f"Open Jellybox and connect to Jellyfin at {base.rstrip('/')}. "
                "Mobile: install Jellybox; enable Jellybox Link or Tailscale."
            )
        return base.rstrip("/") + ("" if "/web/" in base else "/web/index.html#!/music.html")
    if t.startswith("samsung_app:"):
        app = t.split(":", 1)[1]
        return tv_samsung(app) if app in ("netflix",) else f"Use Samsung hub launch_app for {app}"
    return f"Unknown launch target {target!r}. Try steam_bigpicture, steam_app:570, moonlight"


def scene_lounge(name: str) -> str:
    scenes = {
        "movie": ["tv_samsung:hdmi1", "tv_jvc:power", "speak:Movie mode"],
        "gaming": ["tv_samsung:hdmi2", "launch:steam_bigpicture"],
        "listening": ["speak:Listening mode. Open Jellybox or Jellyfin for your FLAC library.", "launch:jellyfin"],
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


def jellyfin_status() -> str:
    base = _env("JELLYFIN_URL").rstrip("/")
    if not base:
        return json.dumps({"ok": False, "hint": "Set JELLYFIN_URL — docs/SELF_HOSTED_MUSIC.md"})
    url = f"{base}/System/Info/Public"
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode())
            return json.dumps(
                {
                    "ok": True,
                    "server_name": data.get("ServerName"),
                    "version": data.get("Version"),
                    "web_url": _env("JELLYFIN_WEB_URL") or f"{base}/web/index.html#!/music.html",
                }
            )
    except urllib.error.URLError as e:
        return json.dumps({"ok": False, "error": str(e), "url": url})


def launch_music(target: str = "jellyfin") -> str:
    return launch_game(target or "jellyfin")


def _cameras_path() -> str:
    default = os.path.join(os.path.dirname(__file__), "cameras.json")
    return _env("CAMERAS_JSON", default)


def list_cameras() -> str:
    path = _cameras_path()
    if not os.path.isfile(path):
        return json.dumps(
            {
                "cameras": [],
                "hint": f"Copy cameras.example.json to {path} and set snapshot_url per camera",
            }
        )
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    return json.dumps({"cameras": data})


def camera_snapshot(camera_id: str) -> str:
    path = _cameras_path()
    if not os.path.isfile(path):
        return json.dumps({"error": "cameras.json missing"})
    with open(path, encoding="utf-8") as f:
        cams = json.load(f)
    cam = next((c for c in cams if c.get("id") == camera_id), None)
    if not cam:
        return json.dumps({"error": f"unknown camera {camera_id}"})
    url = cam.get("snapshot_url") or cam.get("url")
    if not url:
        return json.dumps({"error": "no snapshot_url on camera"})
    user = _env("CAMERA_HTTP_USER")
    password = _env("CAMERA_HTTP_PASSWORD")
    auth = None
    if user:
        import base64

        token = base64.b64encode(f"{user}:{password}".encode()).decode()
        auth = f"Basic {token}"
    req = urllib.request.Request(url)
    if auth:
        req.add_header("Authorization", auth)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            import base64

            b64 = base64.b64encode(data).decode()
            return json.dumps(
                {
                    "id": camera_id,
                    "name": cam.get("name"),
                    "content_type": resp.headers.get("Content-Type", "image/jpeg"),
                    "image_base64": b64,
                }
            )
    except urllib.error.URLError as e:
        return json.dumps({"error": str(e), "url": url})


def _home_assistant(service: str, entity_id: str, action: str) -> str:
    base = _env("HOME_ASSISTANT_URL").rstrip("/")
    token = _env("HOME_ASSISTANT_TOKEN")
    if not base or not token:
        return ""
    domain = service.split(".")[0] if "." in service else service
    url = f"{base}/api/services/{domain}/{action}"
    payload = json.dumps({"entity_id": entity_id}).encode()
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.read().decode()[:300]
    except urllib.error.URLError as e:
        return f"Home Assistant error: {e}"


def apple_tv(action: str) -> str:
    """Control Apple TV via pyatv CLI (pip install pyatv)."""
    ha_entity = _env("APPLE_TV_HA_ENTITY")
    if ha_entity:
        ha_actions = {
            "play": "media_play",
            "pause": "media_pause",
            "stop": "media_stop",
            "power": "turn_on",
            "home": "select_source",
        }
        ha_svc = ha_actions.get(action.lower().replace("-", "_"), action)
        out = _home_assistant("media_player", ha_entity, ha_svc)
        if out:
            return f"Home Assistant {ha_entity}: {ha_svc} → {out}"

    host = _env("APPLE_TV_HOST")
    ident = _env("APPLE_TV_IDENTIFIER")
    creds = _env("APPLE_TV_CREDENTIALS")
    if not host and not ident:
        return "Set APPLE_TV_HOST or APPLE_TV_IDENTIFIER (or HOME_ASSISTANT + APPLE_TV_HA_ENTITY)"

    cmd_map = {
        "play": "play",
        "pause": "pause",
        "stop": "stop",
        "home": "home",
        "menu": "menu",
        "up": "up",
        "down": "down",
        "left": "left",
        "right": "right",
        "select": "select",
        "volume_up": "volume_up",
        "volume_down": "volume_down",
        "power": "turn_on",
    }
    remote_cmd = cmd_map.get(action.lower().replace("-", "_"))
    if not remote_cmd:
        return f"Unknown Apple TV action {action!r}. Known: {', '.join(cmd_map)}"

    argv = ["atvremote"]
    if creds and os.path.isfile(creds):
        argv.extend(["--credentials", creds])
    if ident:
        argv.extend(["--id", ident])
    elif host:
        argv.extend(["--address", host])
    argv.append(remote_cmd)

    try:
        out = subprocess.run(argv, capture_output=True, text=True, timeout=15, check=False)
        if out.returncode != 0 and "atvremote" in (out.stderr or ""):
            return "Install pyatv: pip install pyatv — then atvremote scan && pair"
        return f"Apple TV {remote_cmd}: {out.stdout.strip() or out.stderr.strip() or 'ok'}"
    except FileNotFoundError:
        return "atvremote not found — pip install pyatv on the Mac hub"


def apple_device(action: str, shortcut: str = "") -> str:
    """Mac/iPhone automation via Shortcuts CLI and AppleScript (hub must be macOS)."""
    if action == "shortcut" or shortcut:
        name = shortcut or _env("APPLE_SHORTCUT_HOME", "Studex Home")
        try:
            out = subprocess.run(
                ["shortcuts", "run", name],
                capture_output=True,
                text=True,
                timeout=60,
                check=False,
            )
            return f"Shortcut {name!r}: {out.stdout.strip() or out.stderr.strip() or 'ok'}"
        except FileNotFoundError:
            return "shortcuts CLI not found — run from macOS 12+ or use Home Assistant"

    scripts = {
        "play_pause": 'tell application "Music" to playpause',
        "volume_up": "set volume output volume ((output volume of (get volume settings)) + 10)",
        "volume_down": "set volume output volume ((output volume of (get volume settings)) - 10)",
        "dnd_on": 'tell application "System Events" to tell (first process whose frontmost is true) to keystroke "d" using {command down, shift down}',
    }
    script = scripts.get(action.lower())
    if not script:
        return (
            f"Unknown apple_device action {action!r}. "
            f"Known: shortcut, play_pause, volume_up, volume_down — or pass shortcut name"
        )
    try:
        out = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
        return f"Apple device: {action} → {out.stdout.strip() or 'ok'}"
    except FileNotFoundError:
        return "osascript requires macOS hub"


def dispatch(tool: str, **kwargs: Any) -> str:
    table = {
        "tv_samsung": lambda: tv_samsung(kwargs.get("action", "home")),
        "tv_jvc": lambda: tv_jvc(kwargs.get("action", "power")),
        "speak_phonon": lambda: speak_phonon(kwargs.get("text", "")),
        "launch_game": lambda: launch_game(kwargs.get("target", "")),
        "scene_lounge": lambda: scene_lounge(kwargs.get("name", "gaming")),
        "list_cameras": lambda: list_cameras(),
        "camera_snapshot": lambda: camera_snapshot(kwargs.get("camera_id", "cam1")),
        "apple_tv": lambda: apple_tv(kwargs.get("action", "home")),
        "apple_device": lambda: apple_device(
            kwargs.get("action", "shortcut"), kwargs.get("shortcut", "")
        ),
        "jellyfin_status": lambda: jellyfin_status(),
        "launch_music": lambda: launch_music(kwargs.get("target", "jellyfin")),
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
