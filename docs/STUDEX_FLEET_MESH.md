# Studex fleet mesh — this computer + ops SSM + AutoMeat + VMs

Connect **this machine**, **operations SSM** (Studex Session Mesh), **AutoMeat**, **Dark Factory VM**, and **Naledsi VM** on one tailnet under Paperclip + Hermes + Herdr.

**SSM here** = **Studex Session Mesh**: Tailscale MagicDNS, `tailscale serve` for Hermes `:8642`, Paperclip `:3100`, health scripts — not AWS SSM unless you add it below.

## Fleet map

```
                    Paperclip :3100 (Mac Mini hub)
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    THIS COMPUTER      Dark Factory VM         Naledsi VM
    Herdr + Claude     Hermes gateway           Hermes gateway
    (build / Cursor)   ZTE factory worker      ops / AutoMeat ally
         │                    │                    │
         └────────────────────┴────────────────────┘
                    Tailscale SSM (same tailnet)
         AutoMeat agent  ← registered on hub only
         Obsidian herdr/*.md  →  Herdr workspaces
         OpenBot per host     →  speak / handoff between agents (docs/OPENBOT_NODE_MESH.md)
```

| Node | Typical role | Env key | Hermes | Herdr workspace |
|------|----------------|---------|--------|-----------------|
| **This computer** | Cursor cloud / MacBook dev | `STUDEX_ROLE=this-host` | optional gateway | `portable-agents` |
| **Mac Mini** | Hub, AutoMeat, Paperclip | `LAB_HOST_MACMIN` | `hermes_local` Lead | `automeat`, `studex-ops` |
| **Dark Factory VM** | Grokbots ZTE / factory | `LAB_HOST_DARK_FACTORY` | `hermes_gateway` | `dark-factory` |
| **Naledsi VM** | Ops / intake / mirror workloads | `LAB_HOST_NALEDSI` | `hermes_gateway` | `naledsi` |

Also **Naledi - GoBot** (Notion) under Auto-Meat — same VM role; Claude sessions doc: [CLAUDE_CODE_SESSIONS.md](./CLAUDE_CODE_SESSIONS.md).
| **MSI** | GPU + Buzz | `LAB_HOST_MSI` | `hermes_gateway` | `msi-buzz` |

Fill **Tailscale names** in `docs/lab-mesh.env` (gitignored). LAN fallbacks optional.

---

## One-shot: connect this computer + fleet

```bash
cp docs/lab-mesh.env.example docs/lab-mesh.env
# edit hosts: macmini, dark-factory, naledsi, ...

./scripts/studex-fleet-connect.sh --soft-fail
```

From a **Mac with SSH** to all VMs (adds Herdr remote machines):

```bash
./scripts/studex-fleet-connect.sh --herdr-add-machines
```

---

## This computer (agents here)

Already on **Cursor Cloud** images: Herdr server, Claude Code, factory scripts.

```bash
export PATH="$HOME/.local/bin:/usr/local/bin:$PATH"
npm run ops:up
herdr                    # attach; workspace portable-agents
# pane: claude  or  hermes (after install)
```

**Hermes on this host** (if this box should join Paperclip as a worker):

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
hermes model
./scripts/studex-local-ops-up.sh --start-hermes-gateway --soft-fail
tailscale serve --bg 8642
```

Paperclip → invite external agent → point at `https://THIS_HOST.tailnet.ts.net`.

---

## Operations SSM (session mesh)

1. **Tailscale** on every node — same Studex login.
2. **MagicDNS** on — `ping dark-factory`, `ping naledsi`.
3. **Hub URL** in `lab-mesh.env`:

```bash
PAPERCLIP_URL=http://macmini:3100
```

4. **Preflight** (any node):

```bash
./scripts/lab-mesh-preflight.sh
./scripts/studex-fleet-connect.sh
```

5. **Hermes loopback only** — expose via `tailscale serve`, never public `:8642`.

Optional **AWS SSM**: use Session Manager port forward to a private VM instead of Tailscale; set `HERMES_VIA_SSM=true` and `AWS_SSM_TARGET实例` in `lab-mesh.env` (advanced; script prints manual `aws ssm start-session` template).

---

## Dark Factory VM (ZTE worker)

**Purpose:** `factory/`, `npm run factory:status`, Grokbots queue, dark-themed **Factory OS** (`mission-control/factory/index.html`).

On the VM:

```bash
git clone https://github.com/TumeloRamaphosa/Portable-agents.git
./scripts/msi-herdr-claude-bootstrap.sh   # Herdr + Claude (+ Hermes if installed)
curl -fsSL .../hermes-agent/.../install.sh | bash
./scripts/hermes-gateway-tmux.sh
tailscale serve --bg 8642
```

Obsidian: `integrations/obsidian-herdr/dark-factory.md.example` → `herdr/dark-factory.md`  
Frontmatter: `herdr-workspace: dark-factory`

Paperclip adapter: same pattern as [paperclip-hermes-adapter.example.json](../integrations/automeat/paperclip-hermes-adapter.example.json) with `apiBaseUrl` = Dark Factory tailnet HTTPS.

---

## Naledsi VM

**Purpose:** sibling worker for ops automation (intake, archives, Gitea mirror, regional jobs). Same Hermes + Herdr pattern as Dark Factory.

```bash
# On Naledsi VM — same as Dark Factory bootstrap
./scripts/hermes-gateway-tmux.sh
./scripts/gitea-mirror-push.sh
./scripts/agent-work-archive.sh
```

Workspace **`naledsi`** in Herdr; note template `integrations/obsidian-herdr/naledsi.md.example`.

Invite in Paperclip as **external agent**; manager **Hermes Lead**; tasks from `factory/intake/queue.json`.

---

## AutoMeat (hub only)

Does **not** run on every VM — registers on **Mac Mini** Paperclip:

```bash
# Mac Mini
./scripts/studex-local-ops-up.sh --automeat-check
```

Obsidian `herdr/automeat.md` can still **send checklist lines** to a Hermes pane on **Naledsi** if that pane is running AutoMeat deploy scripts — but **secrets stay on the hub**.

See [AUTOMEAT_CLICKCLACK.md](./deployments/AUTOMEAT_CLICKCLACK.md).

---

## Herdr: see all VMs from one UI

On **MacBook** (interactive):

```bash
herdr machine add dark-factory --label "Dark Factory"
herdr machine add naledsi --label "Naledsi"
herdr machine add msi-gpu --label MSI
herdr
```

Or run `./scripts/studex-fleet-connect.sh --herdr-add-machines` (non-interactive where SSH keys work).

---

## Checklist (paste back)

```text
Studex fleet mesh — date
- Tailscale: this host ✓  macmini ✓  dark-factory ✓  naledsi ✓
- This computer: herdr ✓  claude ✓  hermes gateway ✓
- Paperclip :3100 ✓
- AutoMeat registered (Mac Mini only) ✓
- Dark Factory Hermes invited ✓
- Naledsi Hermes invited ✓
- Herdr machines visible in UI ✓
```

---

## Related

- [STUDEX_LOCAL_OPS.md](./STUDEX_LOCAL_OPS.md)
- [STUDEX_FIVE_NODE_DEPLOY.md](./STUDEX_FIVE_NODE_DEPLOY.md)
- [PSTACK_GROKBOTS_ZTE.md](./PSTACK_GROKBOTS_ZTE.md)