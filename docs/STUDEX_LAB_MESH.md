# Studex lab mesh — MacBook, Mac Mini, MSI

Connect **three physical machines** to the same Studex agent stack (Paperclip/ClickClack `:3100`, Hermes workers, Portable-agents repo, Claude Code). This is the continuation runbook for the MacBook + Mac Mini + MSI plan.

> **Secrets:** Tailscale auth keys, API keys, and `studex-api-keys/.env.complete` stay on each host only. This repo stays public-safe.

## Recommended roles (defaults until you rename hosts)

| Machine | Role | Services |
|---------|------|----------|
| **Mac Mini** | 24/7 **orchestrator hub** | Paperclip/ClickClack `:3100`, optional Ollama `:11434`, Hermes Lead (`hermes_local`) |
| **MacBook Pro** | **Primary dev** | Claude Code, git, Hermes (OAuth MiniMax), optional local LLM |
| **MSI (Windows)** | **GPU + Windows worker** | Tailscale, WSL2 Ubuntu, Hermes `hermes_gateway`, Ollama/LM Studio on GPU (lab) |

Legacy LAN node `192.168.1.114` (2× GTX 1080) in Mission Control may be this MSI or an older box — update the IP in `docs/lab-mesh.env` on your side when confirmed.

## Architecture

```
Tailscale tailnet (Studex)
        │
   Mac Mini ── Paperclip :3100 (bind tailnet)
        │
        ├── hermes_local → Hermes Lead
        ├── hermes_gateway → MacBook (when online)
        └── hermes_gateway → MSI WSL (8642 + tailscale serve)

MacBook / MSI: clone Portable-agents, Claude Code /init → CLAUDE.md
```

Deep orchestration steps: [AGENT_COMPANY_SETUP.md](./AGENT_COMPANY_SETUP.md).  
AutoMeat on ClickClack: [deployments/AUTOMEAT_CLICKCLACK.md](./deployments/AUTOMEAT_CLICKCLACK.md).

---

## Phase 1 — One tailnet (all three machines)

1. Install [Tailscale](https://tailscale.com/download) on Mac Mini, MacBook, MSI (Windows app).
2. Sign in with the **same Studex org** account on each.
3. In Tailscale admin, note stable names, e.g. `macmini`, `macbook-pro`, `msi-gpu`.
4. Copy `docs/lab-mesh.env.example` → **`docs/lab-mesh.env`** (gitignored) and fill tailnet hostnames/IPs.

Test from MacBook:

```bash
ping macmini        # MagicDNS if enabled
curl -fsS http://macmini:3100/api/health   # after Phase 2
```

---

## Phase 2 — Mac Mini: bring `:3100` back

On the **Mac Mini** (Node **24.11+**):

```bash
git clone https://github.com/TumeloRamaphosa/Portable-agents.git
cd Portable-agents
cp -a ~/.paperclip ~/.paperclip.bak-$(date +%F) 2>/dev/null || true
npx paperclipai@latest onboard --yes --bind tailnet
curl -fsS http://127.0.0.1:3100/api/health
scripts/agent-fleet-check.sh paperclip http://127.0.0.1:3100
```

Set guardrails in Paperclip UI before heartbeats (budgets, hire approval) — see AGENT_COMPANY_SETUP Step 5.

---

## Phase 3 — Hermes on MacBook + MSI

### MacBook

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
hermes doctor && hermes model   # MiniMax OAuth on laptop
hermes chat -q "Reply READY"
```

Use **`hermes_local`** only if Paperclip runs on the same machine; otherwise invite as **external agent** (Step 4 of AGENT_COMPANY_SETUP).

### MSI (WSL2 Ubuntu recommended)

In WSL:

```bash
# Tailscale: install inside WSL or use Windows tailnet with subnet routing — prefer tailscale in WSL for simple SSH/hermes
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
touch ~/.hermes/.env && chmod 600 ~/.hermes/.env
grep -q '^API_SERVER_ENABLED=' ~/.hermes/.env || echo 'API_SERVER_ENABLED=true' >> ~/.hermes/.env
grep -q '^API_SERVER_KEY=' ~/.hermes/.env || echo "API_SERVER_KEY=$(openssl rand -hex 32)" >> ~/.hermes/.env
hermes gateway run --replace --accept-hooks
tailscale serve --bg 8642
```

From WSL, preflight against the Mini hub (set `PAPERCLIP_URL` in your local `lab-mesh.env`):

```bash
source docs/lab-mesh.env
scripts/agent-fleet-check.sh hermes "$PAPERCLIP_URL"
```

In Paperclip: **Agents → Invite external agent** → paste onboarding prompt on MSI Hermes → manager **Hermes Lead**.

---

## Phase 4 — Claude Code on each Mac

On **MacBook** and **Mac Mini** (and Claude Code on Windows if you use it):

1. Open the **Portable-agents** folder in Claude Code.
2. Run **`/init`** once per machine if you want a local override, **or** rely on repo root **`CLAUDE.md`** (committed — same rules everywhere).
3. Same org: `t.ramaphosa@studex.dev`.

Claude sessions are **per machine**; sync work through **git**, not a shared terminal.

---

## Phase 5 — Repo preflight (any machine)

```bash
source docs/lab-mesh.env   # your local copy
scripts/lab-mesh-preflight.sh
npm run typecheck
npm run factory:status
```

---

## Checklist (report format)

```text
Studex lab mesh — YYYY-MM-DD HH:MM SAST
- Tailscale: Mac Mini ✓/✗  MacBook ✓/✗  MSI ✓/✗
- Paperclip :3100 on Mac Mini: ✓/✗
- Hermes MacBook: ✓/✗  Hermes MSI gateway: ✓/✗
- Claude Code + CLAUDE.md on dev Macs: ✓/✗
- Blockers: …
```

---

## Open choices (edit `lab-mesh.env` when decided)

| Question | Default in this doc |
|----------|---------------------|
| Paperclip 24/7 host | Mac Mini |
| MSI = same as 192.168.1.114? | Confirm and update env |
| GPU on MSI | Ollama/LM Studio lab only; not customer path |

When you confirm MSI OS (Windows-only vs dual-boot) and the Mini’s Tailscale name, update **`docs/lab-mesh.env`** and Mission Control infra labels locally.
