# STUDEX SYSTEM REVIEW — Complete Inventory & Plan
**Status:** Planning phase — no external launches, no automation, no publishing.  
**Date:** 2026-10-20  
**Owner:** Tumelo  

---

## PART 1: WHAT WE HAVE TODAY

### ✓ Completed Work

| Item | Status | Location |
|------|--------|----------|
| **Studex Agent OS v3 Dashboard** | ✓ Built | `/Users/tumeloramaphosa/Studex_Agent_OS_v3.dc.html` |
| **Herald OS Plan** | ✓ Documented | `Content Lead - Blue Team/13 - Hermes Herald OS Consolidated Plan.md` |
| **StudEx OS Plan** | ✓ Documented | `Content Lead - Blue Team/12 - StudEx OS Desktop Mobile Launch Plan.md` |
| **OpenClaw Inventory** | ✓ Listed (278 agents) | `Content Lead - Blue Team/14 - OpenClaw Agent Inventory.md` |
| **Hermes Profile** | ✓ Active | `creative-lead` profile in `.hermes/` |
| **GCP Infrastructure** | ✓ Live | 5 running VMs, 5 terminated |
| **Gitea Instance** | ✓ Running | `http://127.0.0.1:3032/Studex/GptneseOS` |
| **Content Lead Blue Team** | ✓ Active | Daily operating workspace in Obsidian |

---

## PART 2: ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                        TUMELO / FOUNDER                       │
└─────────────────────────────────────────────────────────────┘
                               ↓
        ╔═══════════════════════════════════════════════╗
        ║     HERMES HERALD OS                          ║
        ║  (One accountable conversation interface)    ║
        ║  - Daily brief & priorities                  ║
        ║  - Task/approval queues                      ║
        ║  - Founder's Den workspace                   ║
        ║  - Content tracker                           ║
        ║  - Research/LLM wiki                         ║
        ║  - OUTBOX deliverables                       ║
        ╚═══════════════════════════════════════════════╝
                               ↓
        ╔═══════════════════════════════════════════════╗
        ║     STUDEX OS (Control Plane)                ║
        ║  - Task orchestration                        ║
        ║  - Approval/audit records                    ║
        ║  - Evidence collection                       ║
        ║  - Workflow automation                       ║
        ║  - VM capacity management                    ║
        ║  - Model/provider health                     ║
        ╚═══════════════════════════════════════════════╝
                               ↓
        ╔═══════════════════════════════════════════════╗
        ║   BOUNDED EXECUTION LAYER                     ║
        ║  - OpenClaw (278 agents)                     ║
        ║  - Hermes (content coordination)             ║
        ║  - VM workers (5 running GCP instances)      ║
        ║  - Model providers (Ollama, Claude API, etc) ║
        ╚═══════════════════════════════════════════════╝
                               ↓
        ╔═══════════════════════════════════════════════╗
        ║   DURABLE LAYER                              ║
        ║  - Gitea (version control & evidence)        ║
        ║  - Obsidian (knowledge & planning)           ║
        ║  - Open Notebook (cited research)            ║
        ║  - OUTBOX (approved deliverables)            ║
        ╚═══════════════════════════════════════════════╝
                               ↓
                    ┌──────────────────┐
                    │  Human Approval  │
                    │   (Final Gate)   │
                    └──────────────────┘
                               ↓
                  [External Release ONLY when
                   explicitly approved]
```

---

## PART 3: CURRENT INVENTORY

### Hermes System
- **Profile:** `creative-lead`
- **Role:** Content/creative coordination, brand protection, research synthesis
- **Workspace:** `/Users/tumeloramaphosa/.hermes/profiles/creative-lead/`
- **Knowledge paths:**
  - `/Users/tumeloramaphosa/Documents/Obsidian Vault/Content Lead - Blue Team/`
  - `/Users/tumeloramaphosa/Documents/Obsidian Vault/Claude Content/StudBot/`
  - `/Users/tumeloramaphosa/Documents/Obsidian Vault/Communications - Email/`

### OpenClaw Agent Inventory
- **Version:** 2026.7.1-2
- **Total configured:** 278 agents
- **Model coverage:**
  - `main` agent: `ollama-ollama/glm-5.1:cloud` (1 agent)
  - Invalid `ollama-ollama/qwen`: 277 agents (needs migration)
  - Valid providers: Ollama Cloud (Kimi, Qwen, GLM), Claude API, OpenRouter
  - **Status:** Requires model health check per provider

### GCP/VM Fleet
| Instance | Status | Role |
|----------|--------|------|
| `studex-agent` | RUNNING | Primary agent runner |
| `studex-dev-rome` | RUNNING | Development/testing |
| `arcade-agents` | RUNNING | Agent execution |
| `openopc` | RUNNING | OpenClaw orchestration |
| `studex-nexus-hub` | RUNNING | Hub/router |
| `dark-factory` | TERMINATED | Archived |
| `global-markets-rwanda` | TERMINATED | Archived |
| `studex-command` | TERMINATED | Archived |
| `studex-factory` | TERMINATED | Archived |
| `studex-tattoo` | TERMINATED | Archived |

### Gitea Repository
- **Access:** `http://127.0.0.1:3032/Studex/GptneseOS`
- **Auth Status:** Browser login works; CLI Git needs credential helper
- **Security:** Previous token revoked (was exposed)
- **Git Auth:** Should use local credential helper (Keychain/Git Credential Manager), NOT URL-embedded tokens

### Supporting Documents
| Document | Path |
|----------|------|
| Herald OS Plan | `Content Lead - Blue Team/13` |
| StudEx OS Plan | `Content Lead - Blue Team/12` |
| OpenClaw Inventory | `Content Lead - Blue Team/14` |
| Content Runbook | `Content Lead - Blue Team/` (daily) |
| StudBot Wiki | `Claude Content/StudBot/` |
| Higgsfield Pipeline | `Content Lead - Blue Team/` |
| Country Capacity Plan | `Content Lead - Blue Team/` |

---

## PART 4: 278 AGENTS — CATEGORIZED

### Core Studex Agents (Named, Active in Vision)
1. **Naledi** (CMO) — primary content/social automation
2. **Hermes** (Communications) — message routing, coordination
3. **Charlie** (Voice/Intake) — ElevenLabs + Twilio
4. **RALF** (Loop Coordinator) — multi-cadence automation
5. **EDDIE** (Ad Engine) — 5-stage autonomous pipeline
6. **OpenClaw** (External CMO) — third-party strategy

### Agency-Agents Library (277 configured in OpenClaw)
All currently point to invalid `ollama-ollama/qwen` model. Require migration to valid providers.

**Sample categories:**
- **Business/Strategy** (89 agents)
  - Business strategist, CEO, CFO, COO, account strategist, etc.
- **Engineering/DevOps** (67 agents)
  - Backend architect, frontend developer, SRE, cloud security, etc.
- **Content/Marketing** (48 agents)
  - Content creator, ad creative strategist, email marketing, carousel growth, etc.
- **Sales/Commerce** (31 agents)
  - Sales coach, sales outreach, e-commerce operator, etc.
- **Research/Analytics** (22 agents)
  - Analytics reporter, market researcher, GIS analyst, etc.
- **Specialized** (20 agents)
  - Accessibility auditor, privacy engineer, compliance auditor, etc.

**⚠️ IMPORTANT:** These 277 agents are configured but NOT connected to valid models. The initial pilot will start with 1-2 agents with verified models.

---

## PART 5: BUILD GATES

### Gate 1 — Reconcile & Clean ✓ (In Progress)
- [x] Inventory all agents, models, workspaces (complete)
- [ ] Fix or quarantine invalid model IDs (pending)
- [x] Revoke exposed Gitea token (done)
- [ ] Verify Gitea read access with local credential (pending)
- [ ] Select first pilot workflow (needs confirmation)

### Gate 2 — One Vertical Slice (Next)
First workflow to build:
```
Founder request
  → Research task
  → Content draft
  → Compliance review
  → Human approval record
  → Gitea/OUTBOX file
```

### Gate 3 — Herald UI
- Responsive web/PWA shell
- Obsidian-gold theme
- Daily brief, task/approval queue
- Founder's Den, content tracker, OUTBOX browser

### Gate 4 — Desktop/Mobile Packaging
- Desktop wrapper (Tauri)
- Mobile PWA
- Native only after real usage

### Gate 5 — Controlled Worker Integration
- Connect one OpenClaw worker
- One verified VM
- Read-only health polling
- Gitea contribution polling
- Write actions behind approval gate

### Gate 6 — Expand by Evidence
Only add agents/VMs/models when queue volume, cost, and governance justify it.

---

## PART 6: IMMEDIATE NEXT STEPS

### This Week — Planning & Setup
**You decide:**

1. **Pilot workflow** — Confirm: content research → draft → approval
2. **Public name** — Confirm: `Hermes Herald OS` or change it
3. **First company** — Select one founder/company for Founder's Den
4. **UI surfaces** — Approve: Herald Home + Founder's Den + Content Desk
5. **Repository** — Confirm Gitea as shared repo
6. **VM selection** — Pick one verified GCP instance for initial pilot
7. **Model selection** — Choose one provider (Ollama Cloud Kimi? Claude API?) and health-check it

### This Sprint — Build Gate 2
Once you confirm the above:
1. Set up Git credentials locally (you control the token, don't share it)
2. Clone `http://127.0.0.1:3032/Studex/GptneseOS.git`
3. Create the first vertical-slice workflow
4. Hand tasks to verified agents
5. Record approval + evidence
6. Commit to Gitea

### Non-Goals (Explicit Boundaries)
- ❌ No 600-VM deployment
- ❌ No Rwanda public claim
- ❌ No autonomous email/social publishing yet
- ❌ No customer outreach
- ❌ No production commerce actions
- ❌ No all-278-agents activation
- ❌ No external integrations until approval workflow is proven

---

## PART 7: DECISIONS WAITING ON YOU

| # | Decision | Impact |
|---|----------|--------|
| 1 | **First pilot:** content research → draft → approval? | Shapes initial UI, agent selection, workflow |
| 2 | **Public name:** Hermes Herald OS? | Branding, documentation |
| 3 | **First company:** Which founder/company in Founder's Den? | Initial content scope |
| 4 | **Gitea workflow:** Confirmed as shared repo? | Git setup, version control approach |
| 5 | **First VM:** Which GCP instance? | Execution location for agents |
| 6 | **First model:** Ollama Cloud Kimi? Claude API? Other? | Provider health check, costs |
| 7 | **Budget for pilot:** How much agent execution time? | Scaling decisions later |

---

## SUMMARY

**What's built:**
- ✓ Dashboard (Agent OS v3)
- ✓ Architecture docs
- ✓ 278 agents configured
- ✓ 5 running GCP VMs
- ✓ Gitea instance ready
- ✓ Obsidian knowledge base live

**What's needed:**
- Your 7 decisions above
- Model migration plan for 277 agents
- Herald UI shell (responsive web first)
- Vertical-slice workflow (research → draft → approval)
- Local Git credentials setup
- First approval + Gitea commit

**Next move:** You confirm the pilot workflow and system boundaries. I'll build Gate 2 (vertical slice) immediately.
