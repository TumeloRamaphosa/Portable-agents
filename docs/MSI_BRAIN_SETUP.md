# MSI first — brain, repo, agents, Obsidian, Notion, Drive

**Run this on the MSI** (Windows + WSL2 Ubuntu recommended for Herdr/Hermes). This cloud agent cannot SSH to your MSI; use this doc + vault checklist on the machine.

## Target layout (one brain per host)

```
MSI (msi-gpu)
├── Portable-agents/          ← git workdir (agents code here)
├── OpenBot                   ← speak / handoff between agents
├── Ollama (GPU) + OmniRoute  ← models
├── herdr + claude | hermes   ← execution panes
├── Obsidian vault
│     brain/                  ← your notes, exports, RAG sources (no secrets)
│     herdr/msi.md            ← checklists only
└── ~/.studex/archive/        ← staged → Google Drive
```

| Piece | Tool | MSI path |
|-------|------|----------|
| **Repo** | git | `~/Portable-agents` (WSL) or `D:\Portable-agents` |
| **Speak to agents** | [OpenBot](https://openbot.run/) | Windows or Linux build |
| **Run steps** | Herdr + Obsidian Bridge | Socket on **MSI**, vault synced or local |
| **Long-term memory** | Notion Memory (MCP) | Cursor/Claude on MacBook; facts **about** MSI in Notion |
| **Notebook RAG** | Obsidian `brain/` + Drive copies | See § RAG below |
| **Archive** | `agent-work-archive.sh` | → folder `GDRIVE_ARCHIVE_FOLDER_ID` |

---

## Phase 1 — MSI base (day one)

### A. WSL2 + Tailscale

```bash
# In WSL Ubuntu on MSI
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
hostname  # note MagicDNS → LAB_HOST_MSI=msi-gpu in lab-mesh.env on hub
```

### B. Clone repo (agent workdir)

```bash
git clone https://github.com/TumeloRamaphosa/Portable-agents.git ~/Portable-agents
cd ~/Portable-agents
git checkout cursor/pov-course-needle-1375   # or main when merged
cp docs/lab-mesh.env.example docs/lab-mesh.env
# edit: STUDEX_ROLE=msi, LAB_HOST_MSI, OLLAMA_HOST, paths
```

### C. LLM mesh (GPU)

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5:14b   # adjust to VRAM
npm install -g omniroute
omniroute   # dashboard :20128 — add Ollama + create API key → lab-mesh.env only
./scripts/llm-mesh-preflight.sh
```

### D. Herdr + Claude on MSI

```bash
curl -fsSL https://herdr.dev/install.sh | sh
./scripts/herdr-server-start.sh
herdr integration install claude
claude auth login   # once, interactive
herdr integration install hermes   # if Hermes installed
```

### E. OpenBot (Windows or WSL desktop)

1. Install from [openbot.run](https://openbot.run/).
2. Provider: Claude or Codex; base URL `http://127.0.0.1:20128/v1` when using OmniRoute.
3. Agents: e.g. **MSI-GPU**, **Buzz**, **Factory-helper** (names local).

### F. Hermes gateway (for Paperclip when hub is up)

```bash
# WSL — after Hermes install.sh
./scripts/hermes-gateway-tmux.sh
tailscale serve --bg 8642
```

---

## Phase 2 — Obsidian brain + Herdr

1. **Vault** on MSI or sync via Obsidian Sync / Syncthing / Drive (read-only brain ok from Drive).
2. Create folders:
   - `brain/` — projects, specs, pasted research (**RAG source**)
   - `herdr/` — checklists only
3. Copy templates → vault:
   - `msi-llm-mesh.md.example` → `herdr/msi.md`
   - `msi-brain-bootstrap.md.example` → `herdr/msi-brain.md`
   - `openbot-node.md.example` → `herdr/openbot-msi.md`
4. Enable [obsidian-herdr](https://github.com/Daniel-Steinberger/obsidian-herdr) plugin; **Herdr folder** = `herdr`.
5. Set `AUTOMEAT_VAULT_PATH` in `lab-mesh.env` to vault root.

**Obsidian on MacBook controlling MSI Herdr:** SSH socket forward — [OBSIDIAN_HERDR_BRIDGE.md](./OBSIDIAN_HERDR_BRIDGE.md).

---

## Phase 3 — Notion (company memory, not secrets)

| Use | Where |
|-----|--------|
| Durable facts, preferences | Notion Memory via Cursor MCP (`notion-memory-search` on MacBook) |
| Tasks / projects | Notion databases (optional; factory queue stays in git) |

On MSI after a milestone:

- [ ] Human or MacBook agent saves **non-secret** MSI facts to Notion Memory (“MSI workdir=~/Portable-agents”, “Ollama model=qwen2.5:14b”).
- [ ] Never store API keys in Notion.

Skill: `.cursor/skills/permanent-memory/SKILL.md`.

---

## Phase 4 — Notebook RAG (your information)

**Three layers — same content, different retrieval:**

| Layer | How | MSI role |
|-------|-----|----------|
| **Obsidian `brain/`** | Search + Copilot/local plugins | Primary **on-machine** knowledge |
| **Notebook LM** | Upload **sanitized** PDFs/notes from Drive export | Weekly export from `brain/export/` |
| **Ollama** (optional) | Embed `brain/*.md` with local tooling later | GPU on MSI |

**Safe workflow**

1. Write / paste research into `vault/brain/` (no tokens, no keys).
2. Agents in **OpenBot / Claude** use `~/Portable-agents` as cwd for code.
3. After session: `cd ~/Portable-agents && ./scripts/agent-work-archive.sh`
4. Optional: copy `brain/export/*.md` into Drive folder (same `GDRIVE_ARCHIVE_FOLDER_ID` or subfolder `MSI/brain/`).
5. Notebook LM: use Drive-synced **export** folder only.

---

## Phase 5 — Google Drive

**Target folder (verified):** [Stud-Bot-Depo](https://drive.google.com/drive/u/2/folders/1HpmisLt5bLxAMtjtU5pwt2PxKIqxwvs6) — `1HpmisLt5bLxAMtjtU5pwt2PxKIqxwvs6`.

In `docs/lab-mesh.env` (MSI, gitignored):

```bash
GDRIVE_ARCHIVE_FOLDER_ID=1HpmisLt5bLxAMtjtU5pwt2PxKIqxwvs6
STUDEX_ARCHIVE_ROOT=~/.studex/archive
STUDEX_ROLE=msi
# Optional upload:
# GDRIVE_RCLONE_REMOTE=gdrive
# GDRIVE_RCLONE_PATH=Studex/MSI/archive
```

```bash
./scripts/agent-work-archive.sh          # stage + rclone if configured
./scripts/agent-work-archive.sh --dry-run
```

Drive MCP on Cursor cloud can **read** parent folder when authenticated; MSI **writes** via rclone or Google Drive Desktop pointing at `~/.studex/archive`.

---

## Verify MSI “agents working”

```bash
cd ~/Portable-agents
./scripts/msi-brain-preflight.sh
```

Pass criteria:

- Ollama + OmniRoute (or SKIP if key not set)
- `herdr` socket + `claude --version`
- git repo HEAD logged
- Archive manifest written
- OpenBot + Obsidian = manual check in vault checklist

Factory: **ZTE-013** (MSI brain stack).

---

## After MSI works

MacBook: `herdr machine add msi-gpu --label MSI` (from [HERDR_MSI_PAIRING.md](./HERDR_MSI_PAIRING.md)).  
Lenovo and VMs repeat the same pattern with their templates.

**Cloud (not Orgo):** public verify + factory site + GCE workers → [GCP_SETUP.md](./GCP_SETUP.md).

## Deploy order + save paths

Full timeline (MSI → GCP → Drive depot): [DEPLOY_TIMELINE_AND_SAVES.md](./DEPLOY_TIMELINE_AND_SAVES.md).

## Related

- [OPENBOT_NODE_MESH.md](./OPENBOT_NODE_MESH.md)
- [LLM_MESH_BRIDGE.md](./LLM_MESH_BRIDGE.md)
- [OBSIDIAN_COMPANY_HUB.md](./OBSIDIAN_COMPANY_HUB.md)
- [BUZZ_MSI_AGENTS.md](./BUZZ_MSI_AGENTS.md)