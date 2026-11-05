---
name: studex-home-lounge
description: Operate Studex Home Lounge — Samsung and JVC TV control, gaming scenes, Phonon on-device voice, Linux-Studex Agent OS bridge. Use when the user mentions home automation, lounge, TV, Samsung, JVC, Steam, Moonlight, home hub port 3088, or integrations/home-hub.
---

# Studex Home Lounge

## Before acting

1. Read `docs/STUDEX_HOME_LOUNGE.md`.
2. Confirm `integrations/home-hub/home.env` exists (from `home.env.example`) with TV IPs on LAN only.
3. Start hub: `node integrations/home-hub/hub_server.mjs` (default **3088** — use a single base URL in UI, never `http://host/http://host/`).
4. Optional: Linux-Studex on `:4000` — clone [Linux-Studex-](https://github.com/TumeloRamaphosa/Linux-Studex-).

## Tools

| Tool | Entry |
|------|--------|
| Python dispatch | `integrations/home-hub/home_tools.py` |
| HTTP API | `hub_server.mjs` routes `/api/tv/samsung`, `/api/tv/jvc`, `/api/speak`, `/api/games/launch`, `/api/scene` |
| UI | `home-console/index.html` via `python3 -m http.server 8080` |
| Agent tool names | `integrations/home-hub/tools.json` |

## Corporate skills

Run `./scripts/sync-corporate-skills.sh` to pull [awesome-claude-corporate-skills](https://github.com/w95/awesome-claude-corporate-skills) ops + IT sections into `.cursor/skills/studex-corporate/`.

## Security

Never commit `home.env` or TV tokens. Do not expose hub or Linux-Studex ports publicly; use Tailscale per `docs/STUDEX_LAB_MESH.md`.
