# Deploy timeline — where agents save work

One map: **when** you deploy, **where** agent output lands. No secrets in any of these destinations.

## Save destinations (always the same four lanes)

| Lane | What gets saved | Who writes | Canonical location |
|------|-----------------|------------|-------------------|
| **1 — Code** | Scripts, docs, factory queue | Agents with git push | **`Portable-agents`** on GitHub |
| **2 — Local brain** | Notes, checklists, RAG text | You + agents in Obsidian | Vault **`brain/`** + **`herdr/`** (per machine) |
| **3 — Cloud depot** | Session manifests, deploy proofs, exports | `./scripts/agent-work-archive.sh` | **[Stud-Bot-Depo](https://drive.google.com/drive/u/2/folders/1HpmisLt5bLxAMtjtU5pwt2PxKIqxwvs6)** (`1HpmisLt5bLxAMtjtU5pwt2PxKIqxwvs6`) |
| **4 — Company memory** | Durable facts (paths, models, hosts) | Cursor / MacBook MCP | **Notion Memory** (not keys) |

Optional: **`brain/export/`** → same Drive depot → **Notebook LM** (sanitized only).

```
Agent session ends
       │
       ├─► git commit/push ─────────────► GitHub (Portable-agents)
       ├─► vault notes ─────────────────► Obsidian brain/ + herdr/
       ├─► agent-work-archive.sh ───────► ~/.studex/archive → Stud-Bot-Depo
       └─► notion-memory (manual/MCP) ─► Notion (facts only)
```

---

## Timeline (order of operations)

| Step | Phase | You deploy / wire | Agents save work **to** |
|------|--------|-------------------|-------------------------|
| **1** | **MSI local** | [MSI_BRAIN_SETUP.md](./MSI_BRAIN_SETUP.md) · ZTE-013 | Repo on MSI disk; vault `brain/`; archive → **Stud-Bot-Depo** under `<hostname>/<timestamp>/` |
| **2** | **Hub mesh** | Mac Mini Paperclip, Tailscale | Paperclip tasks (LAN); archives still **Drive** + git |
| **3** | **GCP platform** | [GCP_SETUP.md](./GCP_SETUP.md) · ZTE-010 / ZTE-014 | Cloud Run logs in **GCP Logging**; code in **git**; GCE VMs run same **archive script** → **Stud-Bot-Depo** |
| **4** | **Commerce** | [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) · Shopify + verify API | No agent secrets on storefront; verify config in **Secret Manager** only |
| **5** | **Dark Factory** | Firebase static + GCE worker | Factory UI on GCP; queue status in archive manifest `factory-status.txt` |
| **6** | **Phone on tailnet** | [PHONE_OS_TAILSCALE.md](./PHONE_OS_TAILSCALE.md) · ZTE-008 | Phone reaches `:3100` / `:3088`; work runs on Mac/MSI; archive from desktop |
| **7** | **Every node** | OpenBot + Herdr per host · ZTE-011–012 | Per-host `hostname` folder in Drive; Obsidian `herdr/<host>.md` checklists |

**Rule:** After any agent milestone on **any** host, run:

```bash
cd ~/Portable-agents   # or /opt/studex/Portable-agents on GCE
./scripts/agent-work-archive.sh
```

---

## Stud-Bot-Depo layout (create once)

Under folder **Stud-Bot-Depo**:

| Subfolder | Contents |
|-----------|----------|
| `MSI/` or `<hostname>/` | Staged archives from `agent-work-archive.sh` |
| `MSI/brain/export/` | Notebook LM–safe markdown exports |
| `gcp/` | Optional copies of deploy notes (no tokens) |
| `STUDEX_LAB_LAYOUT.md` | Index of what lives where (edit in Drive) |

Env (all hosts, `docs/lab-mesh.env`):

```bash
GDRIVE_ARCHIVE_FOLDER_ID=1HpmisLt5bLxAMtjtU5pwt2PxKIqxwvs6
STUDEX_ARCHIVE_ROOT=~/.studex/archive
# GDRIVE_RCLONE_PATH=Stud-Bot-Depo/archive
```

Default manifest includes: git HEAD, factory status, lab-mesh preflight — see `scripts/agent-work-archive.sh`.

---

## What does **not** count as “saved work”

- Chat transcripts (unless you paste summaries into `brain/`)
- Orgo / orphan VMs
- Uncommitted local-only changes (run git + archive)
- API keys in Notion, Obsidian, or Drive

---

## Related

- [MSI_BRAIN_SETUP.md](./MSI_BRAIN_SETUP.md)
- [GCP_SETUP.md](./GCP_SETUP.md)
- [OBSIDIAN_COMPANY_HUB.md](./OBSIDIAN_COMPANY_HUB.md)
- [STUDEX_FIVE_NODE_DEPLOY.md](./STUDEX_FIVE_NODE_DEPLOY.md) § Phase 5