# OpenBot on every VM and computer

**Plan:** Each **VM** and each **physical computer** runs **[OpenBot](https://openbot.run/)** so humans can **speak to and hand off between agents** (Claude, Codex, Gemini, Cursor, local models) on that box. OpenBot is the **conversation UI**; **Obsidian + Herdr** stays the **checklist company record**; **Paperclip** stays **company tasks** on Mac Mini.

## One node, three layers

```
You (voice / chat)
       │
       ▼
  OpenBot (multi-agent threads, handoffs)
       │  uses provider you already pay for
       ▼
  LLM mesh (OmniRoute → Ollama)     Hermes / Claude CLI in Herdr panes
       │                                      ▲
       └──────── same machine ────────────────┘
                         ▲
              Obsidian Herdr Bridge (▶ next step)
```

| Layer | Tool | Job |
|-------|------|-----|
| **Talk to agents** | **OpenBot** | Named agents, delegate messages, workflows, phone → desktop |
| **Run checklist steps** | **Herdr + Obsidian** | `herdr/*.md` on that host |
| **Company queue** | **Paperclip** (hub only) | Issues, budgets, Hermes Lead |

OpenBot does **not** replace Herdr or Paperclip. Wire them: agent in OpenBot runs repo work; Obsidian lines still go to Herdr panes when you want deterministic steps.

## Where OpenBot runs (every node)

| Node | OpenBot install | Notes |
|------|-----------------|--------|
| **Mac Mini** (hub) | macOS app | Ops agents; optional multiplayer with team |
| **MacBook** | macOS app | Primary dev; Cursor provider |
| **MSI** | Windows or Linux AppImage | GPU box; local Ollama in OmniRoute |
| **Lenovo** | Linux AppImage | Lab worker |
| **Dark Factory VM** | Linux AppImage | **Bigger instance** — more agents + workspaces |
| **Naledsi / other GCP VMs** | Linux AppImage | Same pattern |
| **Studex Computer** (appliance) | Linux when image ships | **Subset** of agents — no factory secrets |

**VM note:** OpenBot expects a **graphical or desktop session** on the VM (or you run it on your Mac and only use **SSH tunnels** to that machine’s Ollama/Herdr). Practical pattern for headless GCP:

- **Preferred:** OpenBot on **MacBook** with agents pointed at `https://dark-factory.<tailnet>` OmniRoute via `tailscale serve`.
- **On-VM:** Install OpenBot inside the VM with **VNC or GCP desktop** for setup; keep **Tailscale** — no public RDP.

## Setup (per machine — same checklist)

1. Download from [openbot.run](https://openbot.run/) (macOS / Windows / Linux).
2. Connect **one provider** first (Claude Code, Codex, or Cursor on MacBook).
3. Point OpenAI-compatible tools at **OmniRoute** on **that same host**: `http://127.0.0.1:20128/v1` ([LLM_MESH_BRIDGE.md](./LLM_MESH_BRIDGE.md)).
4. Create **named agents** aligned with fleet (optional):

| OpenBot agent | Studex lane |
|---------------|-------------|
| Ada | Coordination / RALF-style |
| Linus | GROK-BUILD / pstack |
| Grace | Review / interrogate |
| Factory | Dark Factory ZTE only on DF VM |

5. **Multiplayer** (optional): invite teammates on OpenBot for shared channels — still tailnet-only for Studex.
6. Obsidian: copy `integrations/obsidian-herdr/openbot-node.md.example` → `herdr/openbot-<hostname>.md`.

## Tailnet + phones

- iOS/Android **OpenBot** apps talk to the **desktop that runs OpenBot** on your tailnet ([HERMES_PHONE.md](./HERMES_PHONE.md) stays Hermes/Paperclip for company bridge).
- Phone can use **OpenBot → Mac Mini** for chat while **Hermes on phone** handles Paperclip `task_bridge`.

## Security

- Agents can run shell and files — **same trust as Herdr**.
- **Studex Computer** image: limit OpenBot agent count and disable destructive tools in onboarding.
- **No API keys** in git; providers auth via OpenBot / OmniRoute on host.

## Verify

```bash
./scripts/llm-mesh-preflight.sh    # Ollama + OmniRoute on that host
# OpenBot: send test message agent-to-agent (manual)
```

Factory: **ZTE-012** in `factory/intake/queue.json`.

## Related

- [OBSIDIAN_COMPANY_HUB.md](./OBSIDIAN_COMPANY_HUB.md)
- [TWO_SITES_COMPUTE_TIERS.md](./TWO_SITES_COMPUTE_TIERS.md)
- [STUDEX_FLEET_MESH.md](./STUDEX_FLEET_MESH.md)