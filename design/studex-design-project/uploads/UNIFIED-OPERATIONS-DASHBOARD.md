# STUDEX UNIFIED OPERATIONS DASHBOARD
## Remote VNC + Terminals + Models + APIs (All Machines, One Page)

**Status:** Implementation Plan | **Target:** Oct 22-25 | **Owner:** Claude + Tumelo

---

## ARCHITECTURE: Multi-Machine Unified View

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDEX COMMAND CENTER                        │
│                   (Web Dashboard, Single URL)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  MAC (M1 Max)    │  │ WINDOWS GPU      │  │  GCP VMs     │ │
│  │ 192.168.1.110    │  │ 192.168.1.114    │  │ (3 instances)│ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│         ↓                     ↓                      ↓          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  UNIFIED DASHBOARD (localhost:3333)                    │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  TAB 1: VNC GRID (All machines visible)                │  │
│  │  ├─ Mac: VNC @ 5900 (ANTML proxy)                      │  │
│  │  ├─ Windows: VNC @ 5901 (Tailscale relay)             │  │
│  │  └─ GCP VMs: VNC @ 5902-5904 (SSH tunnel)            │  │
│  │                                                         │  │
│  │  TAB 2: TERMINALS (Terminal multiplexer)               │  │
│  │  ├─ [Mac Terminal]  [Windows Terminal]  [GCP SSH]     │  │
│  │  ├─ Type here → broadcast to all or select            │  │
│  │  └─ Real-time output from all machines                │  │
│  │                                                         │  │
│  │  TAB 3: MODEL STATUS                                   │  │
│  │  ├─ Mac: Ollama (phi4-mini, qwen2.5:14b)             │  │
│  │  ├─ Windows: LM Studio (8 models, GPU accelerated)    │  │
│  │  ├─ GCP: DeepSeek (7B-70B, ollama)                   │  │
│  │  └─ Load/unload models, monitor VRAM                  │  │
│  │                                                         │  │
│  │  TAB 4: API ROUTING                                    │  │
│  │  ├─ LiteLLM Gateway (:4000) - active routes           │  │
│  │  ├─ OpenClaw Gateway (:18789) - agent dispatch        │  │
│  │  ├─ Claude API, OpenRouter, Ollama endpoints          │  │
│  │  └─ Switch models/providers in real-time              │  │
│  │                                                         │  │
│  │  TAB 5: RESEARCH & FILES                              │  │
│  │  ├─ Google Drive folder mounted (auto-sync)           │  │
│  │  ├─ GCP files synced here                             │  │
│  │  ├─ Research exports (markdown, JSON)                 │  │
│  │  └─ Version history (git-tracked)                     │  │
│  │                                                         │  │
│  │  TAB 6: AGENT ACTIVITY                                │  │
│  │  ├─ 271 agents + status (idle, running, blocked)      │  │
│  │  ├─ Work outputs (real-time)                          │  │
│  │  ├─ Token spending (per agent, per model)             │  │
│  │  └─ Cache health (hourly purge status)                │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## IMPLEMENTATION LAYERS

### LAYER 1: VNC Configuration (All Machines)

**Mac (M1 Max)**
```bash
# Enable VNC on Mac
sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart \
  -activate -configure -access -on -users admin -privs -all -restart -agent -menu

# VNC server: localhost:5900
# In dashboard: iframe with noVNC proxy
```

**Windows GPU Box (192.168.1.114)**
```bash
# Install VNC server (TightVNC or UltraVNC)
# Configure: listening on port 5901
# Network: Tailscale relay (encrypted tunnel)

# Access from dashboard via Tailscale → SSH tunnel → VNC
```

**GCP VMs (studex-dev-rome + 2 more)**
```bash
# Install VNC on each VM
gcloud compute ssh studex-dev-rome --zone=us-central1-a \
  --command="sudo apt-get install -y tightvncserver"

# Start VNC on port 5902
# Dashboard accesses via: gcloud compute ssh + local port forward
```

### LAYER 2: Terminal Multiplexer

**tmux + Web UI**
```bash
# On each machine, start tmux session
tmux new-session -d -s studex -x 200 -y 50

# Run command across all machines
tmux send-keys -t studex "whoami" Enter  # Broadcast to all
```

**Dashboard Terminal Tab (HTML/WebSocket)**
```javascript
// Browser connects to WebSocket server
ws://localhost:3333/terminal/mac
ws://localhost:3333/terminal/windows
ws://localhost:3333/terminal/gcp-dev-rome

// Input broadcasts to selected or all machines
```

### LAYER 3: Model Status Dashboard

**Tab shows:**
```
MAC MODELS:
├─ Ollama @ http://localhost:11434
├─ phi4-mini (loaded, 4.2GB)
├─ qwen2.5:14b (unloaded)
└─ gemma3 (loaded, 9GB)

WINDOWS MODELS:
├─ LM Studio @ http://192.168.1.114:1234
├─ mistral-7b (loaded, GPU)
├─ neural-chat (unloaded)
└─ dolphin-mixtral (loaded, GPU)

GCP MODELS:
├─ Ollama @ http://10.128.0.8:11434
├─ deepseek-coder:7b (loaded)
├─ deepseek-coder:70b (unloaded, waiting)
└─ qwen-coder (unloaded)
```

**Click to load/unload, monitor VRAM in real-time**

### LAYER 4: API Routing Dashboard

**LiteLLM Gateway** (localhost:4000)
```yaml
routes:
  - alias: "claude-main"
    provider: "anthropic"
    model: "claude-opus-4-20250514"
    status: "active"
    cost: "$0.015/1K tokens"
  
  - alias: "deepseek-local"
    provider: "ollama"
    endpoint: "http://localhost:11434"
    model: "deepseek-coder:70b"
    status: "loaded"
    cost: "$0/month (local)"
  
  - alias: "openrouter-fallback"
    provider: "openrouter"
    model: "meta-llama/llama-2-70b-chat"
    status: "ready"
    cost: "$0.0009/1K tokens"
```

**Dashboard shows:** Switch providers, health status, latency, cost tracking

### LAYER 5: Research Repository (Google Drive)

**Structure saved to Drive:**
```
1OK95PVtIDigPk4Q6YNX5CoSYP2BjNbl3/
├── Research/
│   ├── StudBot-Content-Strategy.md
│   ├── Founder-Tool-Monetization.md
│   ├── Competitor-Analysis.md
│   └── Revenue-Projections.json
│
├── Infrastructure/
│   ├── Cache-Management-Report.md
│   ├── Token-Accounting-Daily.json
│   ├── Agent-Performance-Metrics.json
│   └── Cost-Optimization.md
│
├── GCP-Exports/
│   ├── OpenClaw-Config-Backup.json
│   ├── Agent-Registry.json
│   ├── Workspace-State.tar.gz
│   └── Infrastructure-Logs/
│
└── Live-Syncs/ (auto-updated hourly)
    ├── Daily-Checkpoint.md
    ├── Agent-Activity.json
    ├── Token-Budget.json
    └── Production-Metrics.json
```

**Dashboard:** Browse, download, version history (Git-tracked)

### LAYER 6: Agent Activity Monitor

**Real-time grid:**
```
Agent Name       │ Status    │ Current Work            │ Tokens Used │ Last Checkpoint
─────────────────┼───────────┼────────────────────────┼─────────────┼──────────────────
Naledi           │ Running   │ Writing narratives      │ 1.2M        │ 10:23 SAST
EDDIE            │ Idle      │ Waiting for approval    │ 340K        │ 09:45 SAST
Charlie          │ Running   │ Recording voiceovers    │ 580K        │ 11:02 SAST
RALF             │ Running   │ Monitoring + syncing    │ 0 (meta)    │ Continuous
QA Agent         │ Idle      │ Queue empty             │ 0           │ 10:50 SAST
Adam-Smasher     │ Idle      │ Waiting for code review │ 2.1M        │ 08:30 SAST
CashClaw         │ Running   │ Analyzing spend trends  │ 650K        │ 11:15 SAST
```

---

## IMPLEMENTATION CHECKLIST

### Week 1: Infrastructure

- [ ] **VNC Setup**
  - [ ] Mac: Enable Screen Sharing (System Preferences)
  - [ ] Windows: Install TightVNC + Tailscale tunnel
  - [ ] GCP VMs: Install tightvncserver + configure firewall
  
- [ ] **Terminal Multiplexer**
  - [ ] Deploy tmux on all machines
  - [ ] Create WebSocket bridge (Node.js: `xterm.js` + `ssh2`)
  - [ ] Test broadcast input across all machines

- [ ] **Model Dashboard**
  - [ ] Query Ollama API for loaded models
  - [ ] Query LM Studio API for Windows models
  - [ ] Build React component (load/unload, VRAM charts)

- [ ] **API Routing**
  - [ ] Expose LiteLLM gateway status
  - [ ] Show active routes + latency
  - [ ] Add provider health checks

### Week 2: Integration + Research

- [ ] **Google Drive Sync**
  - [ ] Auto-mount Drive in dashboard
  - [ ] Export research files (markdown, JSON)
  - [ ] Git-track all exports (version history)

- [ ] **GCP File Sync**
  - [ ] Backup OpenClaw configs to Drive
  - [ ] Sync agent outputs to Drive hourly
  - [ ] Compress + archive old logs

- [ ] **Agent Monitor**
  - [ ] Query OpenClaw agent registry
  - [ ] Pull real-time activity from logs
  - [ ] Display token spend per agent

### Week 3: Deployment

- [ ] **Launch Dashboard**
  - [ ] Deploy to localhost:3333 (or Vercel)
  - [ ] Test all tabs on all machines
  - [ ] Set up 24/7 monitoring

- [ ] **Go Live**
  - [ ] Agents use dashboard for context
  - [ ] Research saved automatically to Drive
  - [ ] Team uses for daily check-ins

---

## RESEARCH EXPORT STRUCTURE (Google Drive)

### Saved Daily (Automated):

**StudBot Content Strategy** (export from /last30days + NotebookLM)
```markdown
# StudBot Content Strategy — Oct 21, 2026

## Market Sentiment
- Founder tools valued at: $50-500/mo per user
- Pain points: Manual approval workflows (60% of complaints)
- Content that converts: Case studies + ROI calculators

## Monetization Model (3 Tiers)
- **Pilot:** $0 (free 30-day trial, 1 agent)
- **Professional:** $99/mo (5 agents, email support)
- **Enterprise:** Custom (unlimited agents, SLA, integrations)

## Revenue Projection
- Month 1: $0 (pilot phase)
- Month 2: $12K (50 founders × $99 + 5 enterprises)
- Month 3: $45K (scaling via word-of-mouth)
- Month 6: $180K (partnership with Make/Zapier)

## Content Calendar
- Week 1: Problem narrative (approval bottleneck)
- Week 2: Solution demo (StudBot in action)
- Week 3: Social proof (early founder testimonials)
- Week 4: Free trial CTA + waitlist

## Risk & Mitigation
- **Risk:** Founder tool market saturated
- **Mitigation:** Focus on "supervised execution" (unique angle)
- **Risk:** Agent hallucination on critical tasks
- **Mitigation:** Human approval gates for payment/auth
```

**Competitor Analysis** (auto-generated from /last30days)
```markdown
# Founder Tool Competitive Landscape

## Direct Competitors
| Tool | Pricing | Agents | Approval Gates | Market Share |
|------|---------|--------|---|---|
| Zapier | $19-99/mo | Workflows | Manual | ~40% |
| Make | $9-799/mo | Automations | Optional | ~35% |
| n8n | Self-hosted | Workflows | Yes | ~15% |
| StudBot | $99/mo | AI Agents | Yes (unique) | TBD |

## Differentiation (Why StudBot Wins)
1. **Supervised Execution:** Humans approve before action
2. **AI-Native:** Agents reason, not just automate
3. **Cost:** 3x cheaper than hiring operations team
4. **Speed:** Deploy workflow in minutes, not weeks
```

**Agent Performance Metrics**
```json
{
  "daily_summary": {
    "date": "2026-10-21",
    "agents_active": 15,
    "tasks_completed": 48,
    "avg_task_duration_minutes": 12,
    "token_efficiency": 0.78,
    "approval_rate": 0.94,
    "cost_per_task": 0.23
  },
  "by_agent": {
    "naledi": { "tasks": 8, "quality": "high", "tokens": 2400 },
    "eddie": { "tasks": 12, "quality": "high", "tokens": 3100 },
    "ralf": { "tasks": 1, "quality": "meta", "tokens": 0 }
  }
}
```

---

## QUESTIONS FOR TUMELO

1. **Preferred dashboard URL?** (localhost:3333 or public URL?)
2. **VNC screen sharing quality?** (720p vs 1080p vs raw)
3. **Terminal broadcast permissions?** (All machines or selective?)
4. **Research update frequency?** (Hourly, daily, on-demand?)
5. **Who accesses dashboard?** (Just you, or team + agents?)

---

## TECH STACK

| Component | Technology | Status |
|-----------|-----------|--------|
| VNC Proxy | noVNC (web VNC client) | Ready |
| Terminal | xterm.js + ssh2 (Node.js) | Ready |
| Model API | Ollama + LM Studio APIs | Ready |
| Dashboard | React + WebSocket | Building |
| Drive Sync | Google Drive API + git | Ready |
| Deployment | Vercel or localhost:3333 | Ready |

---

## RESULT

**One browser tab shows:**
- All machines (Mac, Windows, GCP) with VNC screens
- Unified terminal (broadcast or select)
- Model status + load/unload controls
- API routes + cost tracking
- Research repository (auto-synced to Drive)
- Agent activity + token spending

**For agents:**
- Context loaded automatically (current work, prior checkpoint)
- Can see other agents' outputs
- Models available for local use (DeepSeek, Ollama)
- APIs pre-configured (Claude, OpenRouter, LiteLLM)

**For you (Tumelo):**
- Single point of visibility
- Monitor all systems at once
- Access any machine's terminal instantly
- Download research with one click
- See spending + agent efficiency
