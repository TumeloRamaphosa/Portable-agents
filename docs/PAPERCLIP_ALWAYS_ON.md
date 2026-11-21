# Paperclip + Hermes Lead — always-on with VM backup

**Short answer:** Yes — but Studex splits **roles**, not duplicate Leads fighting each other.

| Role | Primary (today) | Always-on backup |
|------|-----------------|------------------|
| **Paperclip control plane** `:3100` | Mac Mini (`macmini`) | **GCP GCE hub VM** (warm standby) or co-primary when Mini sleeps |
| **Hermes Lead** (`hermes_local`) | Same host as **active** Paperclip | Moves with Paperclip — **one** Lead only |
| **Hermes gateways** | MSI, Dark Factory, Naledsi | **Already 24/7 on VM** — keep working when hub blips |
| **Obsidian / Herdr** | Mac Mini + MacBook | Not on VM required for queue uptime |

Paperclip does **not** ship active-active HA in our setup. Use **primary + backup host + daily state backup + tailnet DNS swap**.

---

## Recommended topology

```
                    Tailscale (Studex)
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
   Mac Mini (primary)                    hub-gcp (standby)
   Paperclip :3100                        Paperclip :3100 STOPPED
   Hermes Lead                            OR hot standby (see below)
   home:hub :3088                          Hermes Lead (standby)
        │                                     │
        └──────────────┬──────────────────────┘
                       │
         MSI · dark-factory · naledsi
         Hermes gateway :8642 (always-on workers)
```

**While Mac Mini is up:** `PAPERCLIP_URL=http://macmini:3100` everywhere in `lab-mesh.env`.

**When Mini is down / asleep:** fail over to VM (manual or scripted):  
`PAPERCLIP_URL=http://hub-gcp:3100` after restore + start.

Gateways on **dark-factory** / **naledsi** continue heartbeats **only if** Paperclip is reachable — hence the VM backup for the **queue**, not just workers.

---

## Mode A — Mac Mini primary (keep Obsidian hub at home)

Best when Mini is truly **24/7** (no sleep, UPS, Ethernet).

1. Paperclip `--bind tailnet` on Mini ([AGENT_COMPANY_SETUP.md](./AGENT_COMPANY_SETUP.md)).
2. **Daily backup** (Mini cron):

   ```bash
   ./scripts/paperclip-backup.sh
   ```

   Upload tarball to Stud-Bot-Depo / Drive (no secrets in git).

3. **Standby VM** (`hub-gcp` or `dark-factory`):

   - Ubuntu 22.04 on GCE `e2-standard-2`, Tailscale, **Paperclip not running** until failover.
   - Weekly: restore latest backup to VM, verify `curl http://127.0.0.1:3100/api/health`, stop again.

4. **Always-on execution** without moving Paperclip: ensure **Hermes gateways** on GCE stay up ([GCP_SETUP.md](./GCP_SETUP.md)) — workers keep local Herdr work; **new** company tasks wait for `:3100`.

---

## Mode B — GCP VM primary (maximum uptime)

Best when Mac Mini sleeps or travels often.

1. **Primary Paperclip + Hermes Lead** on GCE `hub-gcp` (Johannesburg / `africa-south1`).
2. Mac Mini: **standby** copy of `~/.paperclip` OR read-only admin via tailnet to VM.
3. `PAPERCLIP_URL=http://hub-gcp:3100` in all `lab-mesh.env`.
4. Mac Mini keeps **home hub** `:3088`, Obsidian, Herdr for **local** panes only.
5. **Never** expose `:3100` on a public GCP load balancer — Tailscale or IAP only ([DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md)).

Hermes on VM:

```bash
./scripts/gcp-dark-factory-vm-bootstrap.sh   # base
curl -fsSL .../hermes-agent/.../install.sh | bash
npx paperclipai@latest onboard --yes --bind tailnet
# Agents → Hermes Lead → hermes_local
```

---

## Mode C — Hot standby (automation-light)

VM runs Paperclip **only when** Mini health fails:

1. Mini: `scripts/paperclip-backup.sh` every 6h → shared Drive path.
2. VM cron: `tailscale ping macmini` fails 3× → pull backup, `onboard`, start Paperclip, send alert (Hermes / phone).
3. Human updates Notion + `lab-mesh.env` `PAPERCLIP_URL` to VM name.
4. When Mini returns: backup VM state, stop VM Paperclip, revert URL to `macmini`.

**One Hermes Lead:** stop Lead on old host before starting on new host (avoid duplicate heartbeats).

---

## What the VM backup does *not* replace

| Still on Mac Mini (typical) | On VM backup |
|----------------------------|--------------|
| Obsidian vault + Herdr Bridge socket | Optional git clone only |
| OpenBot desktop | Optional |
| Home hub `:3088` | Not required for Paperclip |
| Phone Hermes (task_bridge) | Points at **active** `PAPERCLIP_URL` |

---

## lab-mesh.env (all hosts)

```bash
PAPERCLIP_URL=http://macmini:3100
# Failover target (document only until switch):
# PAPERCLIP_STANDBY_URL=http://hub-gcp:3100
LAB_HOST_MACMIN=macmini
LAB_HOST_HUB_GCP=hub-gcp
LAB_HOST_DARK_FACTORY=dark-factory
```

Verify from any box:

```bash
scripts/agent-fleet-check.sh paperclip "$PAPERCLIP_URL"
curl -fsS "${PAPERCLIP_URL%/}/api/health"
```

---

## Tie-in to Studex OS

- [STUDEX_OPERATING_SYSTEM.md](./STUDEX_OPERATING_SYSTEM.md) — company queue layer  
- [STUDEX_FLEET_MESH.md](./STUDEX_FLEET_MESH.md) — gateways always-on  
- [NOTION_VM_COMMAND.md](./NOTION_VM_COMMAND.md) — register `hub-gcp` in VM Registry  

Factory: **ZTE-016** (Paperclip backup + standby VM drill).

---

## Related Paperclip docs

- [Tailscale private access](https://docs.paperclip.ing/reference/deploy/tailscale-private-access)
- [hermes_local](https://docs.paperclip.ing/reference/adapters/hermes-local) / [hermes_gateway](https://docs.paperclip.ing/reference/adapters/hermes-gateway)