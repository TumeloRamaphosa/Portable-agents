# Studex operating system — Hermes + Obsidian Herdr + agents together

**One pattern:** humans and agents share **Obsidian checklists** → **Herdr** runs **Hermes / Claude** in panes → **Paperclip** assigns company work → **Tailscale** connects phones and VMs.

Use this doc as the **front door**. Deeper dives linked at the end.

---

## What “the OS” is (four layers)

| Layer | What you use | Where it runs |
|-------|----------------|---------------|
| **1 — Mesh** | Tailscale MagicDNS | Phone, Mac Mini, MacBook, MSI, GCP VMs |
| **2 — Company tasks** | Paperclip `:3100` + **Hermes Lead** | Mac Mini (hub) |
| **3 — Execution OS** | **Herdr** + **Obsidian Herdr Bridge** | Each machine with a vault folder `herdr/` |
| **4 — Agent runtimes** | `hermes`, `claude`, OpenBot | **Inside Herdr panes** on that machine |

```
                    Paperclip :3100 (Mac Mini)
                     Hermes Lead, budgets, ZTE tasks
                              │
           Tailscale tailnet  │
    ┌───────────┬─────────────┼─────────────┬───────────┐
    │ Phone     │ MacBook     │ MSI         │ GCP VM    │
    │ Hermes app│ Obsidian    │ Obsidian    │ herdr     │
    │ approve   │ + Herdr     │ + Herdr     │ + Hermes  │
    │           │ ▶ checklist │ ▶ checklist │ gateway   │
    └───────────┴─────────────┴─────────────┴───────────┘
              same vault herdr/*.md (sync) or per-host copies
```

**Phone:** Hermes chat + Paperclip **task_bridge** — not the Herdr socket. See [PHONE_OS_TAILSCALE.md](./PHONE_OS_TAILSCALE.md).

**Agents working together** means:

1. **Paperclip** creates the task (company-wide).
2. **Hermes** on the right host runs tools (gateway on MSI/VM, Lead on Mini).
3. **Obsidian** checklist line → Herdr Bridge **▶** → same or other pane (`claude` ↔ `hermes` handoff via OpenBot optional).
4. **OpenBot** = talk/handoff between named agents on one desktop ([OPENBOT_NODE_MESH.md](./OPENBOT_NODE_MESH.md)).

---

## Enter the OS — order of setup

Do this once on the **hub**, then each worker.

### A. Hub (Mac Mini) — company brain

```bash
cd ~/Portable-agents
cp docs/lab-mesh.env.example docs/lab-mesh.env   # edit paths, tailscale names
npm run ops:up:full    # or: ./scripts/studex-local-ops-up.sh --start-hermes-gateway --soft-fail
```

| Step | Command / action |
|------|------------------|
| Tailscale | Same Studex account on all devices |
| Paperclip | [AGENT_COMPANY_SETUP.md](./AGENT_COMPANY_SETUP.md) → `:3100` health |
| Hermes Lead | `hermes_local` on Mini, MiniMax OAuth |
| Herdr | `./scripts/install-herdr.sh` → `herdr` → socket live |
| Obsidian | Install [Herdr Bridge](https://github.com/Daniel-Steinberger/obsidian-herdr); folder `herdr` |
| Vault | Copy `studex-ops-standup.md.example` → `herdr/studex-ops.md` |
| Env | `AUTOMEAT_VAULT_PATH=...` in `lab-mesh.env` |

### B. MacBook — primary dev pane

```bash
./scripts/install-herdr.sh
herdr integration install claude    # after claude CLI installed
./scripts/install-claude-cli.sh
claude auth login
```

| Step | Action |
|------|--------|
| Vault | `herdr/macbook.md` from `macbook-llm-mesh.md.example` |
| Workspace | Frontmatter `herdr-workspace: portable-agents` |
| Pane | `claude` cwd = `~/Portable-agents` |
| Cursor | pstack / factory work (desktop only) |

### C. MSI — GPU worker

[MSI_BRAIN_SETUP.md](./MSI_BRAIN_SETUP.md) + `msi-brain-bootstrap.md.example`

Herdr workspace `msi-buzz` or `msi-brain`; pane **Hermes gateway** for Paperclip external invite.

### D. Phone (Android now)

[PHONE_OS_TAILSCALE.md](./PHONE_OS_TAILSCALE.md) — Tailscale + Hermes + Termux health checks; **no** Herdr on phone.

### E. GCP VM (Dark Factory)

[GCP_SETUP.md](./GCP_SETUP.md) + `gcp-dark-factory-vm-bootstrap.sh` + `herdr/dark-factory.md`

---

## Daily “boot into the OS”

| Time | You | Agents together |
|------|-----|-----------------|
| Open vault | Obsidian → `herdr/studex-ops.md` or today’s machine note | — |
| Start Herdr | `herdr` or `./scripts/herdr-server-start.sh` | Panes: `hermes`, `claude` |
| Ping mesh | `npm run fleet:connect -- --soft-fail` | Confirms tailnet |
| Company | Paperclip UI or phone Hermes task_bridge | Hermes Lead assigns work |
| Run a step | Herdr Bridge **▶** on next checklist line | Pane runs; checkbox when idle |
| Handoff | OpenBot “delegate to …” on MacBook | Between panes/agents |
| Close loop | `./scripts/agent-work-archive.sh` | Stud-Bot-Depo |

Factory queue: `npm run factory:status` — ZTE items map to vault checklists.

---

## Hermes + Herdr in one pane workflow

1. Paperclip issues task → **Hermes gateway** on MSI picks it up (Tailscale `:8642`).
2. You add a line to `herdr/msi.md`: “Run factory:status and fix failures.”
3. Bridge sends to pane **`claude`** or **`hermes`**.
4. Agent runs in `~/Portable-agents`; you **▶** next line when done.
5. Optional: **OpenBot** asks another agent to review before archive.

Hermes install on worker:

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
herdr integration install hermes
./scripts/hermes-gateway-tmux.sh
tailscale serve --bg 8642
```

Paperclip → Invite external agent → onboarding on that gateway → manager **Hermes Lead**.

---

## Verify you are “in” the OS

```bash
./scripts/studex-local-ops-up.sh --soft-fail   # hub
./scripts/phone-os-preflight.sh                # phone on tailnet (from Mac)
./scripts/llm-mesh-preflight.sh                # per GPU host
./scripts/claude-session-preflight.sh          # claude + herdr hook
```

Obsidian: **Test connection to Herdr (ping)** in command palette.

**Done when:** checklist ▶ runs a pane, Hermes answers in app on phone, Paperclip health OK, one agent-work-archive to Drive.

---

## Vault templates (copy → `herdr/`)

| Goal | Template |
|------|----------|
| OS entry checklist | `studex-os-boot.md.example` (this doc) |
| Phone | `android-phone-os.md.example` |
| MSI brain | `msi-brain-bootstrap.md.example` |
| Daily maps | `daily-app-map-report.md.example` |
| Client build | `client-build-planning.md.example` |

---

## Related

- [OBSIDIAN_COMPANY_HUB.md](./OBSIDIAN_COMPANY_HUB.md)
- [OBSIDIAN_HERDR_BRIDGE.md](./OBSIDIAN_HERDR_BRIDGE.md)
- [HERMES_PHONE.md](./HERMES_PHONE.md)
- [STUDEX_FLEET_MESH.md](./STUDEX_FLEET_MESH.md)
- [APP_MAP_DAILY_ROUTINE.md](./APP_MAP_DAILY_ROUTINE.md)