# Studex Home Lounge — architecture

Unified **home automation + gaming + TV control** for the Studex stack, wired to **[Linux-Studex-](https://github.com/TumeloRamaphosa/Linux-Studex-)** (Agent OS on `:4000`) and **Portable Agents** (Mission Control, Studbot, agents).

| Repo | Role |
|------|------|
| **Portable-agents** (this repo) | `home-console/`, `integrations/home-hub/`, skills, Phonon docs |
| **Linux-Studex-** | QEMU/tmux agent mesh, `dashboard.html`, OpenClaw gateway, MCP on `:4000` |
| **w95/awesome-claude-corporate-skills** | Optional Claude/Cursor skill playbooks — sync script below |

## Stack diagram

```
Phone / tablet / laptop
        │
        ├─ home-console/ (browser UI)
        │
        ▼
integrations/home-hub/hub_server.mjs  :3088 (HOME_HUB_PORT)
        │
        ├── Phonon TTS (phonon_speak.py) ── offline voice
        ├── Samsung TV (WebSocket API / SmartThings token)
        ├── JVC TV (HDMI-CEC via cec-client, or IR bridge URL)
        ├── Apple TV (pyatv / Home Assistant) + Apple Shortcuts on Mac hub
        ├── IP cameras (HTTP snapshot URLs in cameras.json)
        ├── Game launchers (Steam URI, Moonlight, PS5 Bazzite doc)
        │
        └── Linux-Studex Agent OS  http://localhost:4000
                ├── /api/orchestrate
                ├── /api/mcp/tools
                └── Hermes / farm / Cashclaw agents

OpenClaw **Lobster** workflows (optional): [OPENCLAW_LOBSTER.md](./OPENCLAW_LOBSTER.md).
```

## Quick start (Mac Mini hub)

```bash
cd Portable-agents

# 1. Configure (copy, fill TV IPs — never commit)
cp integrations/home-hub/home.env.example integrations/home-hub/home.env

# 2. Linux-Studex backend (sibling clone)
git clone https://github.com/TumeloRamaphosa/Linux-Studex-.git ../Linux-Studex-
cd ../Linux-Studex-/server && npm install && npm start   # :4000

# 3. Home hub
export $(grep -v '^#' integrations/home-hub/home.env | xargs)
node integrations/home-hub/hub_server.mjs

# 4. UI
python3 -m http.server 8080
# → http://127.0.0.1:8080/home-console/
```

Optional Phonon (English, Apache 2.0):

```bash
pip install transformers torch soundfile  # heavy; use venv
python integrations/home-hub/phonon_speak.py "Welcome home, operator."
```

Optional corporate skills for Cursor:

```bash
./scripts/sync-corporate-skills.sh
```

## TV control

| TV | Primary method | Env |
|----|----------------|-----|
| **Samsung** | Local **Samsung TV WebSocket** (`samsungtvws`) or SmartThings REST | `SAMSUNG_TV_IP`, optional `SAMSUNG_TV_TOKEN` |
| **JVC** | **HDMI-CEC** (`cec-client`) on the HDMI port the JVC uses, or HTTP to IR blaster | `JVC_HDMI_PORT`, `JVC_IR_BRIDGE_URL` |

Samsung actions implemented in hub: `power`, `volume_up`, `volume_down`, `mute`, `home`, `hdmi1`–`hdmi4`, `netflix` (app launch where supported).

JVC actions: `power`, `volume_up`, `volume_down`, `input_hdmi1` via CEC keys; extend IR bridge for models without CEC.

## Apple TV and Apple devices

Run the **home hub on your Mac Mini** (or any Mac on the LAN) for Shortcuts and AppleScript.

| Control | Method | Env |
|---------|--------|-----|
| **Apple TV** | [pyatv](https://github.com/postlund/pyatv) `atvremote` after one-time pair | `APPLE_TV_HOST` or `APPLE_TV_IDENTIFIER`, optional `APPLE_TV_CREDENTIALS` |
| **Apple TV (alt)** | Home Assistant `media_player` entity | `HOME_ASSISTANT_URL`, `HOME_ASSISTANT_TOKEN`, `APPLE_TV_HA_ENTITY` |
| **iPhone / Mac scenes** | Shortcuts CLI `shortcuts run "Studex Home"` | `APPLE_SHORTCUT_HOME` |
| **Mac Music / volume** | AppleScript via hub | `POST /api/apple/device` with `play_pause`, `volume_up`, … |

Hub routes: `POST /api/apple-tv` `{ "action": "home" }` · `POST /api/apple/device` `{ "action": "shortcut" }`.

Pair Apple TV once on the hub machine:

```bash
pip install pyatv
atvremote scan
atvremote --protocol companion --id <UUID> pair
# save credentials path to APPLE_TV_CREDENTIALS in home.env
```

> **Laravel Herd 2** ([Laravel News](https://laravel-news.com/laravel-herd-2-0)) is for local Laravel + Cursor MCP on your MacBook. It does **not** replace the Studex home hub for TVs, cameras, or Apple TV — use Herd only if you are also building Laravel apps beside the lounge stack.

## Cameras

1. Copy `integrations/home-hub/cameras.example.json` → `integrations/home-hub/cameras.json` (gitignored).
2. Set each camera’s `snapshot_url` (Hikvision ISAPI, generic `/snapshot.jpg`, or Home Assistant `camera_proxy` URL).
3. Optional HTTP auth: `CAMERA_HTTP_USER` / `CAMERA_HTTP_PASSWORD` in `home.env`.

| API | Purpose |
|-----|---------|
| `GET /api/cameras` | List configured cameras |
| `GET /api/cameras/:id/snapshot` | Latest JPEG for lounge UI / agents |

Agent tools: `list_cameras`, `camera_snapshot` in `tools.json`.

## Lossless music (Jellyfin + Jellybox)

Self-hosted “Spotify for your rips” — FLAC on **Jellyfin**, portable playback with **Jellybox** (music-first client; lyrics, offline, continuity). Full runbook: **[SELF_HOSTED_MUSIC.md](./SELF_HOSTED_MUSIC.md)** ([XDA overview](https://www.xda-developers.com/i-built-a-self-hosted-spotify-for-my-lossless-cd-rips-and-this-open-source-app-made-it-portable/)).

| Hub | Purpose |
|-----|---------|
| `GET /api/music/status` | Jellyfin reachable + version |
| `POST /api/music/open` | Jellyfin music web URL for the lounge browser |
| Scene `listening` | Phonon cue + open Jellyfin |

Set `JELLYFIN_URL` in `home.env`. Remote: Jellybox Link plugin or Tailscale — not public port forward.

## Gaming

| Target | How |
|--------|-----|
| **PC / MSI** | `steam://open/bigpicture` or game ID — from hub or Linux-Studex tmux |
| **PS5 lab** | [EDGE_HOSTS.md](./EDGE_HOSTS.md) Bazzite USB — not home automation API |
| **Samsung TV apps** | Samsung hub `launch_app` |
| **Moonlight / Steam Link** | Documented URIs in `home-console` — launch from lounge UI |

## Voice

On-device **[Phonon](https://huggingface.co/blog/phonon-tts)** — see [ON_DEVICE_VOICE.md](./ON_DEVICE_VOICE.md). Hub endpoint `POST /api/speak` runs `phonon_speak.py` when Python + model are installed; otherwise returns text-only fallback for Studbot.

## Agent tools

Tool names for Cactus / ADK alignment: `integrations/home-hub/tools.json`. Python entry: `home_agent.py` (REPL for testing).

## Corporate skills

Curated sync from [awesome-claude-corporate-skills](https://github.com/w95/awesome-claude-corporate-skills):

- `07-operations` (home ops patterns)
- `08-it-engineering` (infra)
- `00-meta/skill-creator`

Copied to `.cursor/skills/studex-corporate/` — not vendored in git (run script locally). Full collection is **166 skills**; cherry-pick more categories as needed.

## Security

- `home.env` is gitignored; TV tokens stay on the LAN hub.
- Do not expose `:3088` or `:4000` to the public internet; use Tailscale ([STUDEX_LAB_MESH.md](./STUDEX_LAB_MESH.md)).
- POPIA: voice + room control logs stay local unless you explicitly sync to Obsidian/Linux-Studex.

## Related

- [SELF_HOSTED_MUSIC.md](./SELF_HOSTED_MUSIC.md)
- [STUDEX_LAB_MESH.md](./STUDEX_LAB_MESH.md)
- [ON_DEVICE_VOICE.md](./ON_DEVICE_VOICE.md)
- [Linux-Studex- README](https://github.com/TumeloRamaphosa/Linux-Studex-/blob/main/README.md)
