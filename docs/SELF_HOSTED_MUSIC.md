# Self-hosted lossless music (Jellyfin + Jellybox)

Studex lounge pattern for **your** CD rips — inspired by [this XDA walkthrough](https://www.xda-developers.com/i-built-a-self-hosted-spotify-for-my-lossless-cd-rips-and-this-open-source-app-made-it-portable/) (Brian Burgess, Nov 2026).

## What the article recommends

| Layer | Role |
|-------|------|
| **FLAC (or ALAC) rips** | Own the masters; better than legacy MP3 archives |
| **[Jellyfin](https://jellyfin.org/)** | Self-hosted library server (music + optional video) on your NAS / Mac Mini / MSI |
| **[Jellybox](https://github.com/jellybox-app/jellybox)** | Music-first client: albums, smart playlists, lyrics (LRCLIB plugin), offline downloads, continuity across devices |
| **Jellybox Link plugin** | Encrypted remote access without opening router ports (alternative: **Tailscale** with [STUDEX_LAB_MESH.md](./STUDEX_LAB_MESH.md)) |

Jellybox is **not** a server — point it at your Jellyfin URL. Video-first Jellyfin clients (Findroid, Streamyfin, Moonfin) are awkward for large music libraries; Jellybox is the “Spotify UI” for your rips.

## Fit in Portable Agents

```
CD ripper (Exact Audio Copy, Whipper, …)
        │ FLAC → music library folder
        ▼
Jellyfin (:8096 default)  on Mac Mini or MSI
        │
        ├─ Samsung / Apple TV Jellyfin apps (living room)
        ├─ Jellybox (phone, Mac, PC) — portable lossless
        │
        └── Studex Home Hub (:3088)  GET /api/music/status
                └── home-console → ping + “Listening” scene
```

Apple **Music** buttons in the hub (`apple_device`) stay for the Apple subscription app; **Jellyfin + Jellybox** is your owned, lossless library alongside Phonon TTS and TV control ([STUDEX_HOME_LOUNGE.md](./STUDEX_HOME_LOUNGE.md)).

## Quick setup (hub machine)

1. **Library path** — e.g. `/Volumes/Music/FLAC` or SMB share from NAS.
2. **Install Jellyfin** — Docker, native macOS, or Windows; add a **Music** library pointing at the rip folder.
3. **Rip workflow** — EAC/Whipper → FLAC + embedded tags/covers; optional watch folder so new rips appear automatically.
4. **Clients**
   - Living room: Jellyfin on Samsung TV / Apple TV, or cast from Jellybox on a phone.
   - Mobile: Jellybox + Jellybox Link **or** Tailscale URL `http://100.x.x.x:8096`.
5. **Studex hub** — in `integrations/home-hub/home.env`:

```bash
JELLYFIN_URL=http://127.0.0.1:8096
# Optional dashboard deep link for the browser on the hub Mac
JELLYFIN_WEB_URL=http://127.0.0.1:8096/web/index.html#!/music.html
```

Restart `node integrations/home-hub/hub_server.mjs` and use **home-console** → *Lossless music*.

## Remote listening (pick one)

| Method | When |
|--------|------|
| **Jellybox Link** | Article’s zero–port-forward path; Jellyfin plugin + Jellybox account |
| **Tailscale** | Same as lab mesh; Jellyfin stays on private `100.x` only |
| **Offline albums** | Jellybox download FLAC (or transcode to 320 kbps for data caps) |

Do **not** expose Jellyfin to the public internet without TLS and auth; POPIA-friendly default is LAN + Tailscale.

## Agents

Hub tools: `jellyfin_status`, `launch_music` in `integrations/home-hub/tools.json`. Scene `listening` dims TVs for “album on the main system” — extend in `home_tools.py` `scene_lounge` as your room layout grows.

## Related

- [STUDEX_HOME_LOUNGE.md](./STUDEX_HOME_LOUNGE.md)
- [STUDEX_LAB_MESH.md](./STUDEX_LAB_MESH.md)
- [ON_DEVICE_VOICE.md](./ON_DEVICE_VOICE.md) — Phonon is TTS, not music playback
