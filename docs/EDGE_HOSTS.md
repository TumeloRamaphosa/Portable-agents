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

[Notebookcheck summary](https://www.notebookcheck.net/PS5-moves-closer-to-becoming-a-Steam-Machine-Alternative-with-Bazzite-deck-port.1438046.0.html) · Project: **[VivaLaVent/ps5-bazzite-deck](https://github.com/VivaLaVent/ps5-bazzite-deck)**

**What it is:** Bazzite in **Steam Gaming Mode** (Deck-style UI), booted from **USB/SSD** via **[rmux PS5 Linux loader](https://github.com/rmux/ps5-linux)**. Optional KDE desktop. Sony’s PS5 OS stays on internal storage when the drive is unplugged.

**Why it matters for “edge” thinking:** It is another **local Linux shell** with GPU and offline Steam — useful for **personal** experiments (Proton, local tools), not for Rwanda/PwC **sovereign agent** deployments.

**Hard limits (do not gloss over):**

- Requires **jailbreak** + **firmware** supported by the loader; unsupported firmware = no Linux.
- **PS5 Pro** is **not** supported by the Bazzite image (as of project docs).
- **Anti-cheat** titles may still fail on Linux; check [Are We Anti-Cheat Yet](https://areweanticheatyet.com/).
- Optional **40 CU GPU unlock** (vs Sony’s 36): can **crash or corrupt display** — leave off unless you accept instability.
- **Not** normal Bazzite updates; follow project **release bundles** on GitHub.
- **Legal/warranty/ToS:** your responsibility; Studex does not recommend jailbreak as a customer delivery path.

**If you experiment anyway (lab only):**

1. Read the project [README](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/README.md) and [releases](https://github.com/VivaLaVent/ps5-bazzite-deck/releases) (e.g. v1.4.x split `.7z` image).
2. Flash **32 GB+ SSD**, use **fast rear USB** on original PS5 (avoid slow front port for boot).
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
