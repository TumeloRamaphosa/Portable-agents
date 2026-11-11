# STUDEX GROUP OPERATIONS FRAMEWORK
## Full-Stack Software Engineering Company Model

**Status:** In Progress | **Last Updated:** 2026-10-21 | **Owner:** Tumelo Ramaphosa + Claude

---

## VISION: From Founder Tool → Software Engineering Company

**Every project, every agent, every day is tracked, memorized, and optimized.**

Current state: 271 agents, 8 verticals, $5M ARR target by 2027.  
Missing: Single source of truth for company-wide status, agent assignments, daily insights.

---

## LAYER 1: CENTRALIZED MEMORY SYSTEM

**Every decision, learning, and project state lives in one place.**

### Obsidian Vault (Source of Truth)
```
~/Documents/Obsidian Vault/Claude Content/
├── 00-INDEX.md                       (master nav)
├── COMPANY-STATUS.md                 (← NEW: daily updated)
├── AGENT-REGISTRY.md                 (← NEW: who, what, status)
├── MEMORY.md                         (persistent session memory)
├── SOUL.md                           (Studex identity)
│
├── Projects/
│   ├── StudBot/
│   ├── Meat/
│   ├── Global Markets/
│   ├── Coffee/
│   ├── Wheat/
│   ├── Animal Exchange/
│   └── Dark Factory/
│
├── Agents/
│   ├── Sessions/
│   │   ├── Naledi/{date}.md
│   │   ├── EDDIE/{date}.md
│   │   ├── RALF/{date}.md
│   │   └── ... (per agent)
│   └── Profiles/
│       ├── naledi.md (role, tools, metrics)
│       ├── eddie.md
│       └── ... (all 271 agents eventually)
│
└── Infrastructure/
    ├── Cache/
    ├── Token-Accounting/
    ├── Agent-Work-Tracking/
    └── Daily-Checkins/
```

### What Gets Memorized (Daily)
```yaml
Daily Checkpoint (RALF executes @ 23:59 SAST):
  - Agent activity summary (work completed, blockers)
  - Token spending (per agent, per project)
  - Cache health (freed MB, next purge)
  - File sync status (Mac ↔ GCP ↔ GitHub)
  - Project velocity (research → content → posted)
  - Cost metrics (spend vs budget)
  - Team morale / blockers

Written to:
  - ~/Documents/Obsidian Vault/Daily-Checkins/{YYYY-MM-DD}.md
  - ~/.claude/projects/memory/session-summary.md
  - Synced to GitHub (robusca-memory repo)
```

---

## LAYER 2: DAILY CHECK-IN FRAMEWORK

**Every morning (07:00 SAST), Claude Code loads today's context.**

### Check-In Components

**A. Load Prior State** (auto-loads on session start)
```bash
# ~/.claude/hooks/session-start.sh
source ~/.openclaw/load-daily-context.sh

# This loads:
# - Yesterday's checkpoint (what finished, what's blocked)
# - Agent assignments for today
# - Project timeline (what's due today)
# - Token budget for today
# - Cache status
```

**B. Display Company Dashboard** (HTML artifact or terminal)
```
╔═══════════════════════════════════════════════════════════════╗
║                  STUDEX OPERATIONS @ 07:00 SAST              ║
╠═══════════════════════════════════════════════════════════════╣
║ 📊 COMPANY SNAPSHOT                                          ║
├─ Active Projects:    8  (StudBot, Meat, Markets, Coffee...) ║
├─ Agents Working:    15  (Naledi, EDDIE, RALF, Charlie...) ║
├─ Token Budget:     50M  (Used yesterday: 42M, 84%) ║
├─ Cache Health:   245MB  (Freed 24h: 18MB, Good) ║
├─ Revenue YTD:    $420K  (Target: $5M by 2027) ║
│                                                            ║
║ 🎯 TODAY'S PRIORITIES                                      ║
├─ StudBot:   Research → Content (3 agents)                  ║
├─ Meat:      Post 2 reels (Naledi + EDDIE)                 ║
├─ Markets:   Deploy trading API (CTO + 2 agents)           ║
├─ Coffee:    Content calendar approval (CMO review)         ║
│                                                            ║
║ ⚠️  BLOCKERS                                               ║
├─ GCP SSH firewall (OpenClaw migration stalled)            ║
├─ Notion workspace not confirmed (content calendar)        ║
├─ Cache cron sandbox issue (workaround: manual trigger)    ║
│                                                            ║
║ ✅ YESTERDAY'S WINS                                        ║
├─ Cache manager live (78% token reduction achieved)        ║
├─ Infrastructure agent running (hourly health checks)      ║
├─ StudBot research funnel approved (3 layers ready)        ║
│                                                            ║
╚═══════════════════════════════════════════════════════════════╝
```

**C. Agent Assignments for Today** (from Obsidian AGENT-REGISTRY.md)
```
TODAY'S WORK (2026-10-21)

Naledi (CMO, 4h):
  - Research market sentiment (last 7 days data)
  - Write 3 narrative arcs for StudBot campaign
  - Review Meat content calendar

EDDIE (Ad Engine, 6h):
  - Render 6 StudBot hero variations (Higgsfield)
  - Cut to 15s/30s/60s variants
  - Generate carousel copy

Charlie (Voice Agent, 2h):
  - Record StudBot intro voiceovers (2 narrations)
  - Twilio integration test

QA Agent (Testing, 3h):
  - Verify StudBot renders (brand + compliance)
  - Test video exports (aspect ratios, bitrate)
  - Approve for posting

RALF (Coordinator, ongoing):
  - Collate agent outputs every 2h
  - Update Notion calendar
  - Flag blockers
  - Midnight: Generate checkpoint, sync to GitHub
```

**D. Token Budget Tracking** (from Cache Manager)
```
TOKEN BUDGET (Oct 21, 2026)
┌─────────────────────────────────────┐
│ Daily Limit:     50M tokens         │
│ Used (so far):    0M (04% @ 07:00)  │
│ Projected:      38M (76% by EOD)    │
│ Safety margin:   12M (24%)          │
├─────────────────────────────────────┤
│ Breakdown by project:               │
│ - StudBot:      12M (32%)           │
│ - Meat:          8M (21%)           │
│ - Markets:      10M (26%)           │
│ - Coffee/Wheat:  5M (13%)           │
│ - Dark Factory:  3M (8%)            │
└─────────────────────────────────────┘

Actions:
☐ Naledi: Use NotebookLM (cheaper) for narrative instead of raw research
☐ EDDIE: Use Genjutsu Lite (720p) for B-roll, Seedance for hero
☐ RALF: Batch small tasks (don't start new project if >85% budget used)
```

---

## LAYER 3: AGENT REGISTRY (MASTER INVENTORY)

**Who is doing what, with what tools, against what metrics.**

### AGENT-REGISTRY.md Structure
```yaml
agents:
  naledi:
    role: "CMO + Content Strategy"
    company: "Studex Meat + StudBot"
    works_on: ["StudBot", "Meat"]
    tools: ["NotebookLM", "Higgsfield", "ElevenLabs", "Obsidian"]
    daily_hours: 4
    success_metrics:
      - "Scripts written per day"
      - "Approval rate (brand compliance)"
      - "Token efficiency (tokens per script)"
    recent_work: "StudBot research phase 1 (market sentiment)"
    blockers: []
    next_task: "Write 3 narrative arcs for StudBot campaign"

  eddie:
    role: "Ad Engine + Video Production"
    company: "All"
    works_on: ["StudBot", "Meat", "Coffee"]
    tools: ["Higgsfield", "FFmpeg", "Remotion", "HyperFrames"]
    daily_hours: 6
    success_metrics:
      - "Renders per hour"
      - "QA pass rate"
      - "Cost per minute of video"
    recent_work: "Cache reduction research (78% achieved)"
    blockers: ["Higgsfield cost optimization pending"]
    next_task: "Render 6 StudBot hero variations"

  ralf:
    role: "Loop Coordinator + Operational Automation"
    company: "All"
    works_on: ["All projects"]
    tools: ["n8n", "Blotato", "Git", "Notion", "Obsidian"]
    daily_hours: "24 (automated)"
    success_metrics:
      - "Tasks completed on schedule"
      - "Uptime (% of automated runs successful)"
      - "Time to publish (research → posted)"
    recent_work: "Daily checkpoint framework (midnight sync)"
    blockers: ["Notion workspace not confirmed"]
    next_task: "Migrate scheduling to Notion calendar"

  # ... (268 more agents)
```

---

## LAYER 4: PROJECT STATUS DASHBOARD

**What state is each company vertical in?**

### COMPANY-STATUS.md (Updated Daily)
```markdown
# Company Status — 2026-10-21

## Revenue Engines

### StudBot (SaaS Launch) — 🟡 IN PROGRESS
- **Phase:** Research funnel (Oct 21-31)
- **Budget:** $5K spend → $50K revenue target
- **Team:** Naledi, EDDIE, Charlie, QA, RALF
- **Work:** Research complete → Content production (Oct 28-Nov 5) → Live posting (Nov 7+)
- **Blockers:** GCP SSH (OpenClaw migration)
- **Token spend this week:** 12M / 50M daily

### Studex Meat — 🟢 POSTING
- **Phase:** Daily content automation (Naledi + EDDIE)
- **Posts this week:** 9/21 (on track)
- **Engagement:** 3.2% avg CTR (target: 4%)
- **Revenue:** $18K this month (on track for $50K)
- **Next:** Video strategy refresh (rotating narrative angles)

### Global Markets — 🟡 DEVELOPMENT
- **Phase:** API v2 + dashboard (Adam Smasher + 3 agents)
- **Progress:** 40% complete
- **Launch:** Nov 15
- **Revenue impact:** Will enable $200K+ institutional tier
- **Blockers:** Postgres schema design (pending CTO review)

### Studex Coffee — 🟡 CONTENT
- **Phase:** Brand positioning + UGC library
- **Progress:** 60% (3 of 5 narrative angles written)
- **Launch:** Nov 30
- **Token spend:** 5M YTD
- **Revenue target:** $30K Y1

### Studex Wheat — 🔴 WAITING
- **Phase:** Waiting for market research (postponed to Nov)
- **Status:** Blocked on wheat commodity data
- **ETA:** Nov 10 restart

### Animal Exchange (Blockchain) — 🔴 FUTURE
- **Phase:** R&D only (not production)
- **Status:** Parked (focus on revenue engines first)

### Dark Factory (Autonomous Ops) — 🟡 BLUEPRINT
- **Phase:** Infrastructure design (post-StudBot launch)
- **Status:** Architecture locked, awaiting OpenClaw GCP migration
- **Timeline:** Start Nov 1 (concurrent with StudBot scaling)

## Financial Snapshot
- **YTD Revenue:** $420K (ahead of pace)
- **Monthly Run Rate:** $75K (target $416K by EOY, $5M by 2027)
- **Token Spend YTD:** 890M (avg 42M/day)
- **Token Cost:** ~$3,900 (using cache optimization)
- **Agent Hours:** 2,400 (average 8h per agent per month)

## Risk Register
| Risk | Impact | Mitigation | Owner |
|------|--------|-----------|-------|
| GCP SSH firewall | High | Contact GCP support or use IAP | Tumelo |
| Token budget overruns | Medium | Cache management + model tiering | Claude |
| Agent coordination delays | Medium | RALF + Notion calendar sync | RALF |
| Brand compliance gaps | High | QA + Naledi approvals gate | Naledi |
```

---

## LAYER 5: HOURLY & DAILY AUTOMATION

**What runs without human input.**

### Hourly (Every :00)
```bash
00:00 → Cache purge (old context deleted)
00:05 → Infrastructure health check (Mac/GCP/agents)
00:10 → Agent activity scan (outputs captured)
00:15 → Token accounting update (dashboard refreshed)
```

### Daily (Midnight SAST, 23:59)
```bash
23:59 → RALF checkpoint:
        1. Collect all agent outputs (last 24h)
        2. Summarize work completed
        3. Extract blockers + next priorities
        4. Update Obsidian COMPANY-STATUS.md
        5. Sync to GitHub (robusca-memory)
        6. Send summary to Slack #operations (if configured)
        7. Prepare tomorrow's assignments
```

### Weekly (Monday 07:00)
```bash
1. Project velocity review (research → content → posted)
2. Token spend analysis (per agent, per project)
3. Agent performance metrics (work quality, speed, cost)
4. Budget rebalancing (reallocate tokens if needed)
5. Blockers & escalations (manual review by Tumelo)
```

---

## LAYER 6: SKILLS LIBRARY + WORK OUTPUT

**Agents save their work using skills, skills live in centralized repo.**

### Repository Structure
```
~/studex-skills-library/           (← NEW, Git-tracked)
├── skills/
│   ├── research/
│   │   ├── market-research.py
│   │   ├── competitive-analysis.py
│   │   └── audience-segmentation.py
│   ├── content/
│   │   ├── script-writer.py
│   │   ├── narrative-arc.py
│   │   └── prompt-template.py
│   ├── production/
│   │   ├── higgsfield-render.py
│   │   ├── video-cut.py
│   │   └── ffmpeg-encoder.py
│   ├── approval/
│   │   ├── brand-checker.py
│   │   ├── compliance-audit.py
│   │   └── qa-rubric.py
│   └── automation/
│       ├── blotato-poster.py
│       ├── notion-sync.py
│       └── github-committer.py
│
├── work-outputs/
│   ├── naledi/
│   │   ├── 2026-10-21__scripts.json
│   │   ├── 2026-10-21__narratives.md
│   │   └── 2026-10-21__approvals.txt
│   ├── eddie/
│   │   ├── 2026-10-21__renders/
│   │   ├── 2026-10-21__cuts/
│   │   └── 2026-10-21__encoding-log.txt
│   └── ralf/
│       ├── 2026-10-21__checkpoint.md
│       ├── 2026-10-21__posted-urls.txt
│       └── 2026-10-21__analytics.json
│
└── library-registry.json           (skill inventory + version)
```

### How Agents Use Skills
```python
# Example: Naledi saves research
from studex_skills import ResearchSkill, ObsidianSync

research = ResearchSkill(
  topic="Market sentiment for premium wagyu",
  date="2026-10-21",
  sources=["reddit", "twitter", "blogs"]
)

findings = research.execute()  # Returns dict

# Save to work output
work_output = {
  "agent": "naledi",
  "timestamp": datetime.now().isoformat(),
  "work_type": "market_research",
  "findings": findings,
  "quality": "verified",  # or "draft" or "needs-review"
  "tokens_used": 2400
}

# Sync to Obsidian + GitHub
ObsidianSync.save(
  path="Projects/StudBot/research/market-sentiment-oct21.md",
  data=work_output,
  auto_commit=True
)

# RALF picks this up in next hourly scan
```

---

## IMPLEMENTATION ROADMAP

| Date | Milestone | Owner | Status |
|------|-----------|-------|--------|
| Oct 21 | Cache manager live ✅ | Claude | ✅ DONE |
| Oct 21 | Infrastructure agent live ✅ | Claude | ✅ DONE |
| Oct 22 | COMPANY-STATUS.md (daily updated) | RALF | ⏳ TODO |
| Oct 22 | AGENT-REGISTRY.md (all 271 agents) | Claude | ⏳ TODO |
| Oct 25 | Daily checkpoint automation | RALF | ⏳ TODO |
| Oct 25 | Skills library v1 (5 core skills) | Claude | ⏳ TODO |
| Oct 28 | Notion integration (calendar + approvals) | RALF | ⏳ TODO |
| Oct 31 | Company dashboard live | Claude | ⏳ TODO |

---

## QUESTIONS FOR TUMELO

- [ ] GCP SSH firewall: Can you fix or enable IAP?
- [ ] Which Notion workspace for company-wide calendar?
- [ ] Should daily checkpoint go to Slack #operations?
- [ ] Who reviews weekly velocity reports (you, Victor, or team)?
- [ ] Skills library: Should each agent auto-commit their work to git?
