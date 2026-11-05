# Edge hosts for Portable Agents (experimental)

Studex **product** positioning is **Black Cloud Node**, **Studbot Android**, and **Mission Control** — sovereign, supportable, offline-capable. This page lists **community edge Linux** setups people sometimes use for **R&D**, gaming, or personal labs. None of these are Studex shipping targets; firmware, jailbreak, and warranty constraints apply.

For agent stack naming (Cactus Needle, AbuZar, claude-ops), see [NEEDLE_AND_OPS_STACK.md](./NEEDLE_AND_OPS_STACK.md).

## What runs Portable Agents today (in this repo)

| Host | Path in repo | Notes |
|------|----------------|-------|
| **Browser** | `studbot/`, `mission-control/` | No install; Shopify gate optional |
| **Android** | `studbot-android/` | ADK Kotlin + NEEDLE UI + pulse agent |
| **Python (any Linux/macOS dev box)** | `integrations/cactus-needle/`, `mission-control/live-agent-demo/` | Cactus Needle when `pip install cactus-needle` works |
| **Termux (Android phone)** | [AbuZar-Ansarii/Needle](https://github.com/AbuZar-Ansarii/Needle) (external) | Cactus Needle 2 + Termux API; reference only |

## PS5 + Bazzite Deck (community — not a Studex product)

**Project:** **[VivaLaVent/ps5-bazzite-deck](https://github.com/VivaLaVent/ps5-bazzite-deck)** · loader: **[rmux/ps5-linux](https://github.com/rmux/ps5-linux)**

**Press & roundups (Oct 2026)** — lab reading only, not Studex endorsement:

| Source | Link |
|--------|------|
| Notebookcheck | [PS5 moves closer to becoming a Steam Machine alternative with Bazzite-deck port](https://www.notebookcheck.net/PS5-moves-closer-to-becoming-a-Steam-Machine-Alternative-with-Bazzite-deck-port.1438046.0.html) (2026-10-30; cites r/PS5_Jailbreak + TechPowerUp) |
| TechPowerUp | [PS5s become Steam Machines with unofficial Bazzite Linux installer](https://www.techpowerup.com/354305/ps5s-become-steam-machines-with-unofficial-bazzite-linux-installer) |
| VideoCardz | [PS5 Steam games through Bazzite, optional 40 CU](https://videocardz.com/newz/playstation-5-can-now-run-steam-games-through-bazzite-linux-with-up-to-40-gpu-compute-units) |
| TechRadar | [Turn your PS5 into a Steam Machine — proceed at your own risk](https://www.techradar.com/gaming/ps5/cant-afford-a-steam-machine-you-can-now-turn-your-ps5-into-one-with-a-new-spin-on-linux-but-i-really-wouldnt-recommend-it) |
| Geeky Gadgets | Roundup of the same port (share links expire; search “PS5 Bazzite Deck” on [geeky-gadgets.com](https://www.geeky-gadgets.com/)) |

**What it is:** Bazzite in **Steam Gaming Mode** (Deck-style UI), booted from **USB/SSD** via **rmux’s PS5 Linux loader**. Optional **KDE** desktop. Sony’s PS5 OS stays on internal storage when the drive is unplugged. Recent stable track uses **bootc** images (atomic updates + `bootc rollback`) — see [releases](https://github.com/VivaLaVent/ps5-bazzite-deck/releases) (e.g. **v2.5**).

**Why it matters for “edge” thinking:** It is another **local Linux shell** with GPU and offline Steam — useful for **personal** experiments (Proton, local tools), not for Rwanda/PwC **sovereign agent** deployments.

**Hard limits (do not gloss over):**

- Requires **jailbreak** + **firmware** supported by the loader (commonly cited **3.00–13.60**; confirm on [loader releases](https://github.com/rmux/ps5-linux/releases)).
- **Legal / PSN / warranty / ToS:** your responsibility; press coverage uniformly warns against treating this as a consumer-safe path.
- **Anti-cheat** titles may still fail on Linux; check [Are We Anti-Cheat Yet](https://areweanticheatyet.com/).
- Optional **40 CU GPU unlock** (vs Sony’s 36 on base PS5): developer **warns against** — crashes, artifacts, or display issues on some consoles.
- Follow project **release bundles** on GitHub (split `.7z` or bootc loader), not generic Bazzite desktop updates.
- **PS5 settings (from project README):** Rest Mode → USB power **Always**; disable **HDMI Device Link** to avoid black screen.

**Community game reports (YMMV, via press/Reddit):** e.g. Palworld, RimWorld, Genshin Impact, Horizon Zero Dawn, XCOM 2; failures reported for some titles (e.g. Marvel Rivals).

**If you experiment anyway (lab only):**

1. Read the project [README](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/README.md) and [releases](https://github.com/VivaLaVent/ps5-bazzite-deck/releases).
2. Flash **32 GB+** external **SSD**; use **fast rear USB** on original PS5 / Slim (avoid slow front ports for boot).
3. On KDE or terminal, you could clone **Portable-agents** and run:
   - `mission-control/live-agent-demo/agent.py` (pulse watcher)
   - `integrations/cactus-needle/` if Cactus publishes a **Linux x64** engine for that environment  
   Studbot **web** UI via local browser to `http://127.0.0.1:8080/studbot/` after `python3 -m http.server`.

That does **not** integrate with PlayStation OS or PSN; it is parallel Linux on the same hardware.

## Comparison (mental model)

```
Studex product path          Lab / hobby edge
─────────────────────        ─────────────────────────────
Black Cloud Node             PS5 + Bazzite USB (jailbreak)
Studbot Android (Play Store) Termux + AbuZar Needle
Mission Control (demo)       Steam Gaming Mode on PS5 Linux
Shopify @ studexmeat.com     (same subscription story if browser works)
```

## Linux dev box baseline

After a fresh Linux install on a **normal PC** (recommended for building `studbot-android` and running Cactus tools), a sensible baseline matches common post-install guides ([example checklist](https://www.howtogeek.com/things-i-do-after-installing-linux/)): full system update, firewall, backups, codecs/drivers as needed, then clone this repo and run `npm run typecheck`.

## TMOG (optional)

When an edge host feels slow (on-device model load, parallel agents), **[TMOG](https://tmog.org/)** is a native process monitor (Linux AppImage/.deb) to see **which process** owns CPU/GPU — complementary to Mission Control’s mission view, not part of this repo.

---

*Experimental hosts stay out of PLAN.md commercial phases unless Studex explicitly productizes them.*
