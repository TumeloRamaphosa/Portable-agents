# Five-node Studex deploy — Lenovo, MSI Bazzite, Mac Mini, MacBook

Single runbook to run **Portable-agents + Hermes** across the lab, mirror git to **local Gitea**, and archive agent deliverables to **Google Drive**.

| Asset | Location |
|-------|----------|
| **Public git (now)** | [github.com/TumeloRamaphosa/Portable-agents](https://github.com/TumeloRamaphosa/Portable-agents) |
| **This branch (latest work)** | `cursor/pov-course-needle-1375` — [PR #1](https://github.com/TumeloRamaphosa/Portable-agents/pull/1) |
| **Agent work archive (Drive)** | [Lenovo folder](https://drive.google.com/drive/folders/16Ke46oCGb_Xd0CmlL9bjDtXEvgmKsEmR) |
| **Mesh detail** | [STUDEX_LAB_MESH.md](./STUDEX_LAB_MESH.md) |
| **Hermes + Paperclip** | [AGENT_COMPANY_SETUP.md](./AGENT_COMPANY_SETUP.md) |

```
                    Tailscale (Studex tailnet)
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    Mac Mini              MacBook              Lenovo + MSI
   orchestrator              dev                GPU workers
   Paperclip :3100      Hermes local         Hermes gateway
   Home hub :3088       Claude Code          Bazzite / WSL
   Gitea (optional)     Gitea push           Ollama lab
         │                    │                    │
         └──────── git + agent archives ───────────┘
                              │
                    Google Drive (Lenovo folder)
                    deploy/ studbot/ hermes/ per-host/
```

## Machine roles

| Host | OS (your plan) | Role | Hermes adapter | Key services |
|------|----------------|------|----------------|--------------|
| **Mac Mini** | macOS | 24/7 hub | `hermes_local` (Lead) | Paperclip `:3100`, `home:hub` `:3088`, optional **Gitea** |
| **MacBook** | macOS | Primary dev | `hermes_gateway` or local when traveling | Claude Code, git, OpenClaw |
| **Lenovo** | Linux (Fedora/Ubuntu) | General worker | `hermes_gateway` | Portable-agents, factory scripts |
| **MSI** | **Bazzite** or Windows+WSL | GPU worker | `hermes_gateway` | Ollama, Moonlight host, Steam |

> **MSI Bazzite:** immutable gaming OS — prefer **toolbox/distrobox** or home dir for `git clone` and Hermes; see [EDGE_HOSTS.md](./EDGE_HOSTS.md) for Bazzite context (PS5 doc is separate; same “local Linux shell” idea).

---

## Phase 0 — Clone the repo (every machine)

```bash
git clone https://github.com/TumeloRamaphosa/Portable-agents.git
cd Portable-agents
git fetch origin cursor/pov-course-needle-1375
git checkout cursor/pov-course-needle-1375   # until PR #1 merges to main
```

Optional: track your own fork on Gitea (Phase 4).

---

## Phase 1 — Tailscale (all four physical hosts)

1. Install Tailscale on **Mac Mini, MacBook, Lenovo, MSI**.
2. Same Studex account/org on each.
3. Record MagicDNS names in `docs/lab-mesh.env`:

```bash
cp docs/lab-mesh.env.example docs/lab-mesh.env
# Edit: LAB_HOST_LENOVO, LAB_HOST_MSI, PAPERCLIP_URL, GITEA_URL, GDRIVE_ARCHIVE_FOLDER_ID
```

4. Test: `ping macmini` from MacBook; `tailscale ping msi-gpu` from Lenovo.

---

## Phase 2 — Mac Mini hub

**Paperclip (Node 24.11+):**

```bash
npx paperclipai@latest onboard --yes --bind tailnet
curl -fsS http://127.0.0.1:3100/api/health
```

**Home lounge:**

```bash
cp integrations/home-hub/home.env.example integrations/home-hub/home.env
npm run home:hub
```

**Studbot / Mission Control:** serve locally or via your existing deploy path.

---

## Phase 3 — Hermes on each worker

### Mac Mini (Lead)

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
hermes doctor && hermes model   # MiniMax OAuth
```

Paperclip → **Agents → New** → `Hermes Lead` → adapter `hermes_local` ([AGENT_COMPANY_SETUP.md](./AGENT_COMPANY_SETUP.md)).

### MacBook, Lenovo, MSI (gateways)

On each:

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
echo 'API_SERVER_ENABLED=true' >> ~/.hermes/.env
echo "API_SERVER_KEY=$(openssl rand -hex 32)" >> ~/.hermes/.env
chmod 600 ~/.hermes/.env
hermes gateway run --replace --accept-hooks
tailscale serve --bg 8642
```

Paperclip → **Invite external agent** → run onboarding on each gateway → manager **Hermes Lead**.

From Mac Mini:

```bash
source docs/lab-mesh.env
scripts/agent-fleet-check.sh hermes "$PAPERCLIP_URL"
```

### Bazzite-specific (MSI)

- Install Tailscale from Bazzite store / rpm-ostree docs.
- Clone repo under `~/Portable-agents` (writable home).
- Hermes + `tailscale serve 8642` same as Linux; use **distrobox** if you need packages not in the base image.
- GPU: Ollama for lab inference only — Hermes still uses MiniMax unless you point Hermes at local Ollama explicitly.

### Buzz agents on MSI ([BUZZ_MSI_AGENTS.md](./BUZZ_MSI_AGENTS.md))

1. Install **Buzz desktop** (Windows unsigned exe or Linux `.deb` / AppImage).
2. Relay → Mac Mini tailnet `http://macmini:3000` or team relay.
3. Create agent **Studex-MSI** (Goose/Pi on Windows; Claude on Bazzite).
4. Workdir = `Portable-agents` clone; run `./scripts/msi-buzz-preflight.sh`.

Optional headless bot: `openclaw plugins install @openclaw/buzz` on the 24/7 gateway host.

---

## Phase 4 — Local Gitea

Run Gitea on **Mac Mini** (or Lenovo) on the tailnet only — not on the public internet.

**Install (Mac Mini example, Homebrew):**

```bash
brew install gitea
# Or Docker: docker run -d -p 3000:3000 -v gitea-data:/data gitea/gitea
```

**Create org/repo** `studex/Portable-agents` in the Gitea UI.

**On every dev machine:**

```bash
./scripts/gitea-mirror-push.sh
# First time: copy integrations/gitea/remote.example → ~/.studex/gitea.remote (gitignored path on your machine)
```

Workflow:

1. **Commit + push GitHub** (backup / PRs).
2. **Mirror push Gitea** (LAN-fast source for agents).
3. Hermes agents use `git remote` `gitea` for everyday pushes; GitHub on release.

---

## Phase 5 — Google Drive archives (agents + Studbot)

**Folder:** [drive.google.com/.../16Ke46oCGb_Xd0CmlL9bjDtXEvgmKsEmR](https://drive.google.com/drive/folders/16Ke46oCGb_Xd0CmlL9bjDtXEvgmKsEmR?usp=sharing)

Set in `docs/lab-mesh.env`:

```bash
GDRIVE_ARCHIVE_FOLDER_ID=16Ke46oCGb_Xd0CmlL9bjDtXEvgmKsEmR
STUDEX_ARCHIVE_ROOT=~/.studex/archive
```

After a work session or deploy:

```bash
./scripts/agent-work-archive.sh
```

This script:

- Collects **sanitized** logs (preflight, `factory:status`, deploy checklists).
- Stages under `~/.studex/archive/<hostname>/YYYYMMDD-HHMM/`.
- If `rclone` is configured (`rclone copy` to `gdrive:Lenovo/...`), uploads to Drive; otherwise prints paths for **Google Drive Desktop** sync.

**Hermes policy:** never upload `~/.hermes/.env`, API keys, or raw invite tokens — only summaries and PASS/FAIL checklists.

Subfolders (create once in Drive or via Desktop sync):

- `deploy/`, `studbot/`, `hermes/`, `lenovo/`, `msi-bazzite/`, `macmini/`, `macbook/`

A layout file **`STUDEX_LAB_LAYOUT.md`** lives in the Drive folder as the canonical index.

---

## Phase 6 — Verify the mesh

On **each** host:

```bash
scripts/lab-mesh-preflight.sh
npm run typecheck
npm run factory:status
./scripts/agent-work-archive.sh --dry-run
```

Report format:

```text
Studex five-node — YYYY-MM-DD HH:MM SAST
- Tailscale: mini ✓ book ✓ lenovo ✓ msi ✓
- Paperclip :3100: ✓
- Hermes gateways: book ✓ lenovo ✓ msi ✓
- Gitea push: ✓
- Drive archive staged: ✓
- Blockers: …
```

---

## OpenClaw Lobster (optional on Mac Mini / MacBook)

```bash
openclaw plugins install @openclaw/lobster
```

See [OPENCLAW_LOBSTER.md](./OPENCLAW_LOBSTER.md).

---

## Factory intake

Extend **`factory/intake/queue.json`** item **ZTE-003** or add **ZTE-004** when all four hosts pass preflight.

---

## Related

- [STUDEX_LAB_MESH.md](./STUDEX_LAB_MESH.md)
- [STUDEX_HOME_LOUNGE.md](./STUDEX_HOME_LOUNGE.md)
- [HERMES_INTAKE.md](./HERMES_INTAKE.md) — commercial intake (Vercel), not Nous Hermes runtime
