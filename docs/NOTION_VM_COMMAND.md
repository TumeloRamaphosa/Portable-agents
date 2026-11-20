# Notion Virtual Machine Command ↔ Portable-agents

Wire your Notion command pages to repo runbooks. **New fleet connects use GCP + Tailscale, not Orgo** (legacy rows may still say Orgo in the registry until you re-verify).

## Notion pages (your workspace)

| Page | Role |
|------|------|
| [Virtual Machine Command](https://app.notion.com/p/41e3ef07399280d6ac21da4b39f9d1bf) | **CC2 home** — phone + VMs + tailnet (this doc seeds it) |
| [Studex Command Centre](https://app.notion.com/p/3f53ef07399281548222f765b9cac2f9) | Daily ops, Agent Dashboard, Factory Board |
| [Studex VM Registry](https://app.notion.com/p/41b3ef073992811bbd0ac2201d2e5f1d) | One row per machine — **no keys, no IPs** |
| [Agent Server Warehouse](https://app.notion.com/p/41b3ef073992818b9beffc455c219ec9) | Proposed GCP warehouse — **approve before spend** |

## Repo command surfaces (HTML + docs)

| CC | HTML | Runbook |
|----|------|---------|
| Hub | `mission-control/hub/index.html` | [COMMAND_CENTERS.md](./COMMAND_CENTERS.md) |
| CC1 GCP | `mission-control/gcp/index.html` | [GCP_SETUP.md](./GCP_SETUP.md) |
| CC2 VMs | `mission-control/vms/index.html` | [STUDEX_FLEET_MESH.md](./STUDEX_FLEET_MESH.md) |
| CC0 local | `mission-control/local/index.html` | [STUDEX_LOCAL_OPS.md](./STUDEX_LOCAL_OPS.md) |

---

## Phone (Android now · iOS later) — register as edge node

**Not a QEMU VM.** Register as **Type = Physical machine**, **Provider = Own hardware**, **Company = Platform**.

| Field | Example (no secrets) |
|-------|----------------------|
| **Name** | `android-studex-phone` |
| **Role** | Mobile mesh: Tailscale + Hermes + Termux; Paperclip task_bridge |
| **Vault path** | `Fleet/Machines/android-studex-phone.md` |
| **Console** | `https://github.com/TumeloRamaphosa/Portable-agents/blob/main/docs/PHONE_OS_TAILSCALE.md` |
| **Agents running** | Hermes, OpenBot (optional), Termux bootstrap |
| **Status** | Unverified → **Running** after `phone-os-preflight.sh` PASS on Mac |
| **Last verified** | Date of preflight |

**Android today:** [PHONE_OS_TAILSCALE.md](./PHONE_OS_TAILSCALE.md) · `PHONE_OS=android-termux`  
**iOS later:** same doc § iOS; `PHONE_OS=ios`; Shortcuts + Hermes (no Termux).

When MagicDNS name is known, set `LAB_HOST_PHONE` in `docs/lab-mesh.env` on Mac Mini (not Notion).

---

## VM Registry update workflow (after each health check)

1. Run the matching repo preflight on the **verifying host** (not from Notion).
2. Update **Status** + **Last verified** only — never paste tokens or tailnet IPs.
3. Stage proof: `./scripts/agent-work-archive.sh` → [Stud-Bot-Depo](https://drive.google.com/drive/u/2/folders/1HpmisLt5bLxAMtjtU5pwt2PxKIqxwvs6).
4. Optional: mirror summary to Obsidian `Fleet/Machines/NAME.md` (Warehouse vault contract).

| Machine class | Preflight script |
|---------------|------------------|
| Phone (Android) | `phone-os-preflight.sh` |
| MSI | `msi-brain-preflight.sh` |
| GCP project | `gcp-preflight.sh` |
| Full tailnet | `studex-fleet-connect.sh` |

---

## Warehouse plan vs current repo (Nov 2026)

Notion **Agent Server Warehouse** still lists Orgo + Pangolin as **proposed**. Portable-agents **default path**:

- **GCP** GCE + Cloud Run ([GCP_SETUP.md](./GCP_SETUP.md))
- **Tailscale** mesh (no public agent ports)
- **Orgo** — do not add new registry rows; migrate frozen rows when renewing

Do not install warehouse spend until Agent Chief Lord approves.

---

## Related

- [PHONE_OS_TAILSCALE.md](./PHONE_OS_TAILSCALE.md)
- [DEPLOY_TIMELINE_AND_SAVES.md](./DEPLOY_TIMELINE_AND_SAVES.md)
- Factory **ZTE-008** (phone) · **ZTE-014** (GCP not Orgo)