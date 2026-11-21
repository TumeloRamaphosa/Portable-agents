# Phone OS on Tailscale — agents access and work in the mesh

**Goal:** The phone is a **first-class Studex node** on the tailnet — not a sideline. Agents on Mac Mini, MSI, and GCP reach the phone by **MagicDNS**; agents **on** the phone reach Paperclip, home hub, and workers the same way.

**ZTE-008** · complements [HERMES_PHONE.md](./HERMES_PHONE.md) · save path: [DEPLOY_TIMELINE_AND_SAVES.md](./DEPLOY_TIMELINE_AND_SAVES.md)

**Platform order:** **Android + Termux first** (your device). **iOS** — same tailnet steps later (`PHONE_OS=ios`).

**Notion VM Command:** [Virtual Machine Command](https://app.notion.com/p/41e3ef07399280d6ac21da4b39f9d1bf) · registry how-to → [NOTION_VM_COMMAND.md](./NOTION_VM_COMMAND.md)

---

## What “phone OS” means here

| Layer | What it is | Agents use it for |
|-------|------------|-------------------|
| **Mesh OS** | **Tailscale** on the phone (same account as hub) | Every host talks `macmini`, `msi-gpu`, `<phone>` by name |
| **Device OS** | iOS or Android | Hermes app, OpenBot mobile, browser |
| **Shell OS** (Android) | **Termux** (+ optional `sshd`) | `git`, `curl`, lightweight scripts; SSH **into** phone from Mac |
| **Company OS** | **Paperclip** on Mac Mini `:3100` | `task_bridge` scope for phone Hermes — approve tasks on the go |
| **Home OS** | Hub `npm run home:hub` `:3088` | Scenes / health from phone browser |

Heavy coding still runs on **MacBook / MSI / GCE**; the phone **controls, approves, and bridges** — or runs **Termux** jobs that call tailnet APIs.

```
        Tailscale tailnet (Studex)
 ┌──────────┬──────────┬──────────┬──────────┐
 │ macmini  │ msi-gpu  │  phone   │ dark-factory
 │ :3100    │ :8642    │ Termux   │ :8642
 │ Paperclip│ Hermes   │ Hermes   │ factory
 └────┬─────┴────┬─────┴────┬─────┴────┬─────
      │          │          │
      └──────────┴──────────┴── agents: ping, ssh, curl, Paperclip, OpenBot
```

---

## Phase 1 — Tailscale on the phone (required)

### iOS

1. App Store → **Tailscale** → sign in (**same** Studex tailnet as Mac Mini).
2. Settings → enable **Use Tailscale DNS** (MagicDNS).
3. Note device name (e.g. `iphone-studex`) — Settings → Tailscale → this device.

### Android

1. Play Store → **Tailscale** → same account.
2. Optional: **Subnet routes** off unless you know you need them.
3. Note name (e.g. `pixel-studex`).

### Hub config (MacBook / Mac Mini)

Copy `docs/lab-mesh.env.example` → `docs/lab-mesh.env`:

```bash
LAB_HOST_PHONE=iphone-studex          # exact MagicDNS name
PHONE_OS=ios                            # ios | android-termux | android-hermes-only
STUDEX_ROLE=mac-mini                    # on hub only
PAPERCLIP_URL=http://macmini:3100
HOME_HUB_URL=http://macmini:3088
HERMES_GATEWAY_PORT=8642
```

From **any** mesh machine:

```bash
tailscale ping iphone-studex
./scripts/phone-os-preflight.sh
```

---

## Phase 2 — Agents **reach** the phone (from MSI / Mac)

| Action | Command (from tailnet) |
|--------|-------------------------|
| Liveness | `tailscale ping $LAB_HOST_PHONE` |
| Health snapshot | `PHONE=$LAB_HOST_PHONE ./scripts/phone-os-preflight.sh` |
| SSH into phone shell | `tailscale ssh $LAB_HOST_PHONE` (Android Termux + `sshd` + TS SSH) |
| Herdr remote (desktop) | Mac: `herdr machine add iphone-studex --ssh ubuntu@...` only if SSH works |

**Mac Mini / fleet script** now pings the phone:

```bash
npm run fleet:connect -- --soft-fail
# or full: npm run fleet:connect:full
```

---

## Phase 3 — Agents **on** the phone work in the mesh

### All phones

1. **Hermes** — MiniMax OAuth; chat on cellular via tailnet ([HERMES_PHONE.md](./HERMES_PHONE.md)).
2. **Paperclip** — Safari/Chrome on tailnet: `http://macmini:3100` (admin UI) or Hermes **task_bridge** after invite.
3. **Home hub** — `http://macmini:3088/api/health`
4. **OpenBot** (optional) — mobile app → desktop hub agent ([OPENBOT_NODE_MESH.md](./OPENBOT_NODE_MESH.md)).
5. **Mission Control** — open `mission-control/hub/index.html` from git mirror or static host on tailnet.

**Claude Code (`claude` command):** not in git. **Termux / Linux on phone:** from `Portable-agents` run `bash scripts/termux-claude-setup.sh`, then `source ~/.bashrc` and `claude auth login`. If install fails (ARM), use **Hermes** app and run Claude on Mac/MSI. **MSI / WSL / Mac:** `./scripts/install-claude-cli.sh`.

### Android — Termux as phone “work OS”

On the phone (Termux):

```bash
pkg update && pkg install -y git curl openssh
curl -fsSL https://tailscale.com/install.sh | sh   # if not using Android VPN mode
# Or rely on Android Tailscale app only (simpler): skip Termux tailscale

mkdir -p ~/studex && cd ~/studex
git clone --depth 1 https://github.com/TumeloRamaphosa/Portable-agents.git
cd Portable-agents
bash scripts/phone-termux-bootstrap.sh
```

Bootstrap script: health checks to Mac Mini, optional shallow clone, **no secrets** in repo.

**Optional — agents SSH in:**

```bash
# Termux
pkg install openssh
sshd
# Tailscale → … → enable SSH on this device (Tailscale SSH or copy authorized_keys)
```

Then from MacBook: `tailscale ssh pixel-studex` → run `scripts/agent-work-archive.sh` is **not** typical on phone; instead trigger archive **on MSI** after phone-approved tasks.

### iOS — no Termux

- **Shortcuts**: HTTP GET `http://macmini:3088/api/health` on tailnet Wi‑Fi/cellular.
- Repo work: **never** on phone disk for production; use Hermes + Paperclip to assign Mac/MSI Hermes gateways.

---

## Phase 4 — Paperclip: phone as external agent

1. Mac Mini: Paperclip **Agents → Invite external**.
2. On phone Hermes (or gateway on a always-on Android box): run onboarding with **`task_bridge`** scope only — not company admin.
3. Manager stays **Hermes Lead** on Mac Mini ([AGENT_COMPANY_SETUP.md](./AGENT_COMPANY_SETUP.md)).

**Verify:** assign a test task; phone Hermes shows it; completion logs on Mac Mini.

---

## Phase 5 — Obsidian + Herdr (checklist lives on Mac)

Phone does **not** host the Herdr Unix socket. Desktop owns execution:

1. Copy `integrations/obsidian-herdr/phone-os-tailscale.md.example` → vault `herdr/phone-os.md`
2. Copy `hermes-phone.md.example` → `herdr/hermes-phone.md`
3. Herdr workspace **`phone-os`** on MacBook — panes run `claude` / `hermes` on **hub**, while you tick phone steps on mobile Obsidian (sync).

---

## Phase 6 — Archive and Drive (phone-initiated)

After a phone-driven milestone (approval, Termux check script PASS):

1. On **MacBook or MSI** (not phone): `./scripts/agent-work-archive.sh`
2. Manifest notes `phone-os-preflight` output under `deploy/`
3. Upload → [Stud-Bot-Depo](https://drive.google.com/drive/u/2/folders/1HpmisLt5bLxAMtjtU5pwt2PxKIqxwvs6)

---

## Verify (ZTE-008 done when)

| Check | How |
|-------|-----|
| Phone on tailnet | `tailscale ping` OK from Mac |
| Hub reachability | `phone-os-preflight.sh` PASS |
| Hermes chat | MiniMax works on LTE |
| Paperclip | task_bridge invite accepted OR `:3100` health from phone browser |
| Optional Termux | `phone-termux-bootstrap.sh` prints PASS lines |
| Vault | `herdr/phone-os.md` all critical boxes checked |

---

## Related

- [HERMES_PHONE.md](./HERMES_PHONE.md)
- [STUDEX_FLEET_MESH.md](./STUDEX_FLEET_MESH.md)
- [NEEDLE_AND_OPS_STACK.md](./NEEDLE_AND_OPS_STACK.md) (Cactus / Termux reference)
- [DEPLOY_TIMELINE_AND_SAVES.md](./DEPLOY_TIMELINE_AND_SAVES.md)