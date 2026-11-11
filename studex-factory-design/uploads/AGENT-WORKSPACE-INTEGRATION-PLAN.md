# AGENT WORKSPACE INTEGRATION PLAN
## Wiring 7 Named Agents + Unified Command Center

**Status:** Ready to Wire | **Timeline:** Oct 22-31 | **Owner:** Claude + Tumelo

---

## WHAT YOU HAVE (Agent Infrastructure)

**7 Named Agents, Each With:**
- ✅ Google Drive (work output)
- ✅ Notion workspace (assignment tracking)
- ✅ Obsidian vault (session logs)
- ⏳ Gitea repo (pending port selection)
- ⏳ RAG indexing (pending setup)

```
AGENTS:
├─ Claudio (researcher/content)
├─ Adam Smasher (CTO/infrastructure)
├─ Robusca (operations/coordination)
├─ Sentinel (security/compliance)
├─ Codex (multi-provider reasoning)
├─ Base44 Scribe - Elara (documentation/writing)
└─ Katjana (sales/business development) ← Currently on RFQ-001 (Jordan)
```

**Shared Data Room:** Google Drive for all company docs

---

## WHAT I'VE BUILT (Command Center)

- ✅ Terminal automation (`.zshrc.studex-init`)
- ✅ Zero-touch engineering (DeepSeek harness + validation gates)
- ✅ Unified dashboard blueprint (VNC + terminals + models + APIs)
- ✅ Research auto-export (to Google Drive)
- ✅ Infrastructure monitoring (cache, token accounting)
- ✅ Company operations framework (daily check-ins, agent registry)

---

## THE WIRING PLAN (7 Steps)

### STEP 1: Agent Workspace Routing (This Week)

**Goal:** Each agent's work auto-routes to their workspace

```yaml
CLAUDIO (Researcher):
  drive: "https://drive.google.com/drive/folders/1IPqhpSCsVV6KSkZC_rsmQy7T_cu86Pyk"
  notion: "Claudio workspace"
  obsidian: "/Users/tumeloramaphosa/Documents/StudEx Agent Brains/Claudio"
  work_type: ["research", "content_strategy", "copywriting"]
  auto_save: true

ADAM_SMASHER (CTO):
  drive: "https://drive.google.com/drive/folders/1MVuk7RUaBaploz035RiDsJy4FQuehIqx"
  notion: "Adam Smasher workspace"
  obsidian: "/Users/tumeloramaphosa/Documents/StudEx Agent Brains/Adam Smasher"
  work_type: ["architecture", "code", "infrastructure", "deployment"]
  auto_save: true

ROBUSCA (Operations):
  drive: "https://drive.google.com/drive/folders/1sqGQEXRS5o1p6W2b8qDWR66WJOgfakAG"
  notion: "Robusca workspace"
  obsidian: "/Users/tumeloramaphosa/Documents/StudEx Agent Brains/Robusca"
  work_type: ["coordination", "checkpoint", "task_tracking", "deployment"]
  auto_save: true

SENTINEL (Security):
  drive: "https://drive.google.com/drive/folders/1yxU1KZPDm-vWjka3pXiS4kEAStcrJ5Oh"
  notion: "Sentinel workspace"
  obsidian: "/Users/tumeloramaphosa/Documents/StudEx Agent Brains/Sentinel"
  work_type: ["security_audit", "compliance", "risk_assessment"]
  auto_save: true

CODEX (Multi-Provider):
  drive: "https://drive.google.com/drive/folders/1AOPx8AEuAa7bMzzoas5wGwCpehHRbou1"
  notion: "Codex workspace"
  obsidian: "/Users/tumeloramaphosa/Documents/StudEx Agent Brains/Codex"
  work_type: ["reasoning", "architecture", "second_opinion", "complex_logic"]
  auto_save: true

ELARA (Documentation):
  drive: "https://drive.google.com/drive/folders/106BeuCZe7DM3pFIAzwi-YjsvE_FDEMuE"
  notion: "Base44 Scribe - Elara workspace"
  obsidian: "/Users/tumeloramaphosa/Documents/StudEx Agent Brains/Base44 Scribe Elara"
  work_type: ["documentation", "writing", "reports", "guides"]
  auto_save: true

KATJANA (Sales/Business):
  drive: "https://drive.google.com/drive/folders/1ED4jNO_T2dXbDBt4zU80t5B2CEnEkmQP"
  notion: "Katjana workspace"
  obsidian: "/Users/tumeloramaphosa/Documents/StudEx Agent Brains/Katjana"
  work_type: ["sales", "business_development", "deals", "customer_success"]
  auto_save: true
```

**Implementation:**
```bash
# On every agent's terminal init, load their workspace config
source ~/.studex-agent-config/${AGENT_NAME}.yaml

# Auto-save all work to:
# - Drive: ${AGENT_DRIVE_FOLDER}/work-${DATE}.json
# - Notion: Auto-create task with work summary
# - Obsidian: Append to Agent Sessions/${AGENT_NAME}/${DATE}.md
```

---

### STEP 2: Gitea Setup (This Week)

**Goal:** All agent work versions in git

```bash
# Start Gitea on Mac (choose port)
docker run -d --name gitea \
  -p 3000:3000 \
  -v /Users/tumeloramaphosa/.gitea:/data \
  gitea/gitea:latest

# Create repos for each agent:
# - agent-claudio (research outputs)
# - agent-adam-smasher (code, architecture)
# - agent-robusca (operations, checkpoints)
# - agent-sentinel (security audits)
# - agent-codex (reasoning, second opinions)
# - agent-elara (documentation)
# - agent-katjana (deals, business docs)
# - shared-data-room (company-wide)

# Each agent auto-commits their work:
git config user.email "agent-${AGENT_NAME}@studex.dev"
git config user.name "Agent ${AGENT_NAME}"

# Pre-commit hook auto-tags:
git tag -a "agent-${AGENT_NAME}-$(date +%Y%m%d-%H%M)" \
  -m "Work checkpoint: $(head -1 CHECKPOINT.md)"
```

---

### STEP 3: RAG Indexing (Oct 24)

**Goal:** Unified knowledge graph across all agent workspaces

```bash
# Index agent work + shared data room
chromadb-index \
  --sources \
    Drive:1IPqhpSCsVV6KSkZC_rsmQy7T_cu86Pyk \
    Drive:1MVuk7RUaBaploz035RiDsJy4FQuehIqx \
    Drive:1sqGQEXRS5o1p6W2b8qDWR66WJOgfakAG \
    Drive:1yxU1KZPDm-vWjka3pXiS4kEAStcrJ5Oh \
    Drive:1AOPx8AEuAa7bMzzoas5wGwCpehHRbou1 \
    Drive:106BeuCZe7DM3pFIAzwi-YjsvE_FDEMuE \
    Drive:1ED4jNO_T2dXbDBt4zU80t5B2CEnEkmQP \
    Drive:1KWbI7s9WTYg3MJZURaqb-OO2-pgBbuGI \
  --output /Users/tumeloramaphosa/.studex-rag \
  --policy "original_source_links, author_agent, date, company_scope"

# Query endpoint:
curl http://localhost:8000/query \
  -d "agent=claudio&query=previous research on founder tool monetization"
```

**Result:** Agents can ask "What has Claudio learned about content monetization?" → RAG returns prior work with sources

---

### STEP 4: Notion Fleet Configuration (Oct 24)

**Goal:** Agents see each other's work, shared task board

```yaml
# Create unified task board in Notion
"Studex Operations"
├─ Tasks by Agent (filter by Claudio, Adam, Robusca, etc.)
├─ Tasks by Vertical (StudBot, Meat, Markets, Coffee)
├─ Tasks by Status (Backlog, In Progress, Blocked, Done)
├─ Tasks by Deadline (Due Today, This Week, Overdue)
└─ Agent Workspace Sync (pull from each agent's Notion workspace)

# Each agent's Notion auto-syncs to:
#  - "Studex Operations" shared board (visibility)
#  - Their own private workspace (they work in private, post to public)
```

**Implementation:**
```bash
# Notion bot auto-pulls from agent Notion workspaces hourly:
for agent in claudio adam_smasher robusca sentinel codex elara katjana; do
  notion-sync \
    --from "https://app.notion.com/p/${AGENT_NOTION_ID}" \
    --to "https://app.notion.com/p/STUDEX_OPERATIONS_ID" \
    --filter "Status = 'In Progress' OR Status = 'Blocked'"
done
```

---

### STEP 5: Obsidian Fleet (Oct 25)

**Goal:** Agent brains connected, shared learning

```bash
# Link all agent Obsidian vaults to a master vault
ln -s /Users/tumeloramaphosa/Documents/StudEx\ Agent\ Brains/* \
  /Users/tumeloramaphosa/Documents/Obsidian\ Vault/Agent\ Brains/

# Master vault now contains:
Obsidian Vault/
├─ Agent Brains/
│   ├─ Claudio/ (linked, read-write)
│   ├─ Adam Smasher/ (linked, read-write)
│   ├─ Robusca/ (linked, read-write)
│   ├─ Sentinel/ (linked, read-write)
│   ├─ Codex/ (linked, read-write)
│   ├─ Elara/ (linked, read-write)
│   └─ Katjana/ (linked, read-write)
├─ Master Index (cross-links all agents)
└─ Company Operations (centralized)

# Agents use wikilinks to share knowledge:
# Claudio writes: "See [[Adam Smasher#Architecture Notes]] for infrastructure decisions"
# → Adam's notes auto-load, linked, version-tracked
```

---

### STEP 6: Terminal + VNC Unified Dashboard (Oct 26-27)

**Goal:** See all agents + all machines on one page

```
UNIFIED DASHBOARD (localhost:3333)
├─ TAB: AGENT WORKSPACES
│  ├─ Claudio: Drive + Notion + Obsidian (live view)
│  ├─ Adam Smasher: Drive + Notion + Obsidian (live view)
│  ├─ Robusca: Drive + Notion + Obsidian (live view)
│  └─ [5 more agents] (all visible, clickable)
│
├─ TAB: VNC GRID
│  ├─ Mac: localhost:5900 (Claudio's workstation)
│  ├─ Windows: 192.168.1.114:5901 (GPU box)
│  ├─ GCP-1: 10.128.0.8:5902 (studex-dev-rome, OpenClaw)
│  ├─ GCP-2: 10.218.0.4:5903 (arcade-agents)
│  └─ GCP-3: 10.218.0.2:5904 (studex-nexus-hub)
│
├─ TAB: TERMINALS (Broadcast)
│  ├─ Type here → run on selected agent(s)
│  └─ Output: real-time from all machines
│
├─ TAB: AGENT ACTIVITY
│  ├─ Claudio: Writing narratives (2h elapsed)
│  ├─ Adam Smasher: Coding order-matching (4h elapsed)
│  ├─ Katjana: Validating Jordan RFQ (1h elapsed)
│  └─ [Real-time status for all 7 agents]
│
├─ TAB: MODELS + APIS
│  ├─ Ollama (localhost:11434): phi4-mini, qwen2.5:14b
│  ├─ LM Studio (Windows:1234): 8 models, GPU accelerated
│  ├─ DeepSeek (GCP:11434): 7B-70B ready
│  └─ LiteLLM (:4000): All routes, active now
│
└─ TAB: RESEARCH + DEALS
   ├─ StudBot monetization (Claudio's research)
   ├─ Meat RFQ-001 Jordan (Katjana's deal status)
   └─ Auto-synced to Google Drive hourly
```

---

### STEP 7: Zero-Touch Go Live (Oct 28-31)

**Goal:** All systems autonomous, fully wired

```
WORKFLOW (Autonomous Loop):

1. MORNING (07:00 SAST)
   ├─ Dashboard loads daily checkpoint
   ├─ Each agent sees their work + others' context
   ├─ Terminal opens with .studex.json context
   └─ Agent declares work ("Researching founder tool pricing models")

2. WORK (Throughout day)
   ├─ DeepSeek generates code/content (local)
   ├─ Pre-commit hooks validate (tests, types, linting)
   ├─ Auto-commit to Gitea with agent signature
   ├─ Work auto-saves to Drive + Notion + Obsidian
   └─ RAG indexes new work immediately

3. COORDINATION (Hourly)
   ├─ Robusca polls all agent workspaces
   ├─ Updates shared Notion board
   ├─ Flags blockers (missing info, approvals needed)
   ├─ Syncs to Google Drive
   └─ Updates unified dashboard in real-time

4. ESCALATION (As needed)
   ├─ Sentinel detects security issue → alerts Tumelo
   ├─ Katjana needs buyer contact → escalates to you
   ├─ Architecture decision needed → Codex gets second opinion
   └─ Everything else runs lights-off

5. CHECKPOINT (23:59 SAST)
   ├─ Robusca collects day's work
   ├─ Writes "Daily Checkpoint.md"
   ├─ Tags all Gitea repos
   ├─ Syncs to shared Drive
   └─ Next morning: agents load context and continue
```

---

## IMPLEMENTATION TIMELINE

| Date | Step | Deliverable | Owner | Status |
|------|------|-------------|-------|--------|
| Oct 22 | Workspace routing | Config for all 7 agents | Claude | ⏳ TODO |
| Oct 22 | Gitea setup | Repos running, auto-commits wired | Claude | ⏳ TODO |
| Oct 24 | RAG indexing | Knowledge graph across all workspaces | Claude | ⏳ TODO |
| Oct 24 | Notion fleet | Shared task board + agent sync | Claude | ⏳ TODO |
| Oct 25 | Obsidian linking | Master vault with agent brains | Claude | ⏳ TODO |
| Oct 26-27 | Dashboard | Unified view (agents, VNC, terminals, models) | Claude | ⏳ TODO |
| Oct 28-31 | Go live | All systems autonomous, zero-touch | All agents | ⏳ TODO |

---

## IMMEDIATE ACTIONS FOR TUMELO

1. **Confirm Gitea port** → 3000 (standard) or 3030 (Docker)?
2. **Confirm RAG indexing** → Index all agent workspaces + shared data room?
3. **Confirm agent list** → Are there more than 7 agents to wire?
4. **Confirm escalation owners** → Who handles security alerts? Business decisions? Architecture reviews?

---

## RESULT

**By Nov 1:**
- ✅ 7 agents working autonomously
- ✅ All work versioned in git + indexed in RAG
- ✅ All workspaces visible on one dashboard
- ✅ Unified terminal access (broadcast or select)
- ✅ Research auto-exported to Google Drive
- ✅ Daily checkpoints automated
- ✅ Zero-touch engineering live

**What you see every morning:**
```
STUDEX OPERATIONS STATUS (07:00 SAST)
├─ Claudio: Researching competitor pricing (continuing from yesterday)
├─ Adam Smasher: Deploying order-matching engine (4/5 tests passing)
├─ Katjana: Following up on Jordan RFQ (awaiting buyer contact)
├─ Robusca: Syncing all workspaces, no blockers
├─ [3 more agents working]
│
├─ Budget: 42M/50M tokens (84%, under control)
├─ Revenue: $0 StudBot (launching), $500K Meat (deal in motion)
└─ Escalations: None (all systems green)
```

**Ready to wire it all together?**
