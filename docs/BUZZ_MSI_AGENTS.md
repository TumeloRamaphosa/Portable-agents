# Buzz (buzz.xyz) agents on MSI

Run **[Buzz](https://buzz.xyz/)** — Block’s team chat + **local coding agents** — on the **MSI** box (Windows 11 or **Bazzite**), alongside **Hermes** for Paperclip and **Portable-agents** as the git worktree.

| Layer | MSI role |
|-------|----------|
| **[Buzz desktop](https://github.com/block/buzz-app)** | Channels, humans + agents in one UI |
| **Hermes gateway** | Paperclip external worker ([STUDEX_FIVE_NODE_DEPLOY.md](./STUDEX_FIVE_NODE_DEPLOY.md)) |
| **OpenClaw + `@openclaw/buzz`** (optional) | Headless OpenClaw bot in Buzz rooms ([OpenClaw Buzz channel](https://docs.openclaw.ai/channels/buzz)) |

```
Tailscale
   Mac Mini — Paperclip :3100, optional Buzz relay :3000
   MSI      — Buzz app + agents (Goose / Pi / Claude*), Hermes :8642
   * Claude/Codex agents: macOS/Linux only — on MSI use Goose or Pi on Windows
```

---

## 1 — Install Buzz on MSI

### Windows (MSI default)

1. Download latest **Windows x64** from [block/buzz-app releases](https://github.com/block/buzz-app/releases) (`Buzz_*_x64_unsigned.exe`).
2. SmartScreen: **More info → Run anyway** (unsigned alpha).
3. **Settings → Relay** — point at your team relay:
   - Studex self-host on Mac Mini: `http://macmini:3000` (Tailscale) or `http://127.0.0.1:3000` if relay runs on MSI.
   - Or Block/community hosted relay your team already uses.
4. Create or import **identity** (Nostr key — back it up; Buzz does not recover lost keys).

### Bazzite (Linux)

1. Use **`Buzz_*_amd64.deb`** or **AppImage** from releases (Ubuntu 24.04-compatible).
2. Prefer **home dir** install; use **distrobox** if you need a newer deps stack.
3. Same relay URL as Windows (tailnet to Mac Mini is fine).

---

## 2 — Agent harness on MSI (pick one)

| Harness | MSI Windows | MSI Bazzite | Notes |
|---------|-------------|-------------|-------|
| **Goose** | Yes | Yes | Built into Buzz; API keys in **Settings → Agent setup** |
| **Pi** | Yes | Yes | Enable **Pi** in **Settings → Plugins**; **Node.js ≥ 22.19** (24+ recommended) |
| **Claude (Claude Code)** | No | Yes | Install via Buzz **Install Claude** + sign-in |
| **Codex** | No | Yes | Install via Buzz **Install Codex** |
| **buzz-agent** | Yes | Yes | Default Buzz runtime |

**Studex MSI agent (recommended on Windows):**

1. **Agents → New agent → Create**
2. Name: `Studex-MSI`
3. Harness: **Goose** or **Pi**
4. Working directory: `C:\Users\<you>\Portable-agents` or `~/Portable-agents` (clone below)
5. Instructions (short): ship Portable-agents PRs, run `scripts/lab-mesh-preflight.sh`, never commit secrets; archive with `scripts/agent-work-archive.sh`.

**Claude on Windows (if you use Claude Code already):**

```powershell
npm install -g @anthropic-ai/claude-code
# Buzz may also need the Claude ACP adapter — see block/buzz README if Claude doesn't appear
```

---

## 3 — Clone repo on MSI (agent workspace)

```bash
git clone https://github.com/TumeloRamaphosa/Portable-agents.git
cd Portable-agents
git checkout cursor/pov-course-needle-1375   # or main after merge
```

Point the Buzz agent **workdir** at this folder so edits and `git` stay in Studex repo.

**Gitea mirror** (optional): [STUDEX_FIVE_NODE_DEPLOY.md](./STUDEX_FIVE_NODE_DEPLOY.md) → `./scripts/gitea-mirror-push.sh`

---

## 4 — Hermes on MSI (same machine, different path)

Buzz agents ≠ Hermes. Keep Hermes for **Paperclip** tasks:

```bash
# WSL or Bazzite terminal
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
# gateway + tailscale serve 8642 — see STUDEX_LAB_MESH.md
```

Buzz handles **chat + harness agents**; Hermes handles **company org / heartbeats** when Mac Mini assigns work.

---

## 5 — Optional: OpenClaw bot in Buzz rooms (MSI or Mac Mini)

Use when you want a **24/7 Gateway** replying in Buzz without the desktop open.

**Requirements:** Node **24+**, OpenClaw on the host that runs 24/7 (often **Mac Mini**; MSI Bazzite possible in distrobox).

```bash
openclaw plugins install @openclaw/buzz
openclaw channels add --channel buzz
# BUZZ_RELAY_URL=wss://your-relay  BUZZ_PRIVATE_KEY=... (bot identity only — not human key)
```

Room admin adds bot pubkey with **Bot** role:

```bash
buzz channels add-member --channel <ROOM_UUID> --pubkey <BOT_PUBLIC_KEY> --role bot
```

Copy env template: `integrations/buzz/openclaw-buzz.env.example` → machine-local file (gitignored).

---

## 6 — Self-hosted relay on Mac Mini (team LAN)

For a private Studex relay (desktop clients on MSI point here):

- Upstream: [block/buzz](https://github.com/block/buzz) — `docker compose` / `just setup` (relay **:3000**).
- Bind on tailnet only; MSI **Settings → Relay** = `http://100.x.x.x:3000`.

Do not expose relay to the public internet without TLS and auth.

---

## 7 — Preflight on MSI

```bash
# Git Bash / WSL / Bazzite
cd Portable-agents
./scripts/msi-buzz-preflight.sh
./scripts/agent-work-archive.sh --dry-run
```

Set in `docs/lab-mesh.env`:

```bash
LAB_HOST_MSI=msi-gpu
BUZZ_RELAY_URL=http://macmini:3000
MSI_BUZZ_AGENT_NAME=Studex-MSI
```

---

## 8 — Deliverables → Google Drive

After agent sessions: `./scripts/agent-work-archive.sh` → [Lenovo Drive folder](https://drive.google.com/drive/folders/16Ke46oCGb_Xd0CmlL9bjDtXEvgmKsEmR) (`msi-bazzite/` or hostname subfolder).

---

## Related

- [STUDEX_FIVE_NODE_DEPLOY.md](./STUDEX_FIVE_NODE_DEPLOY.md)
- [OPENCLAW_LOBSTER.md](./OPENCLAW_LOBSTER.md)
- [Buzz engineering blog — configuring agents](https://engineering.block.xyz/blog/configuring-agents-in-buzz)
