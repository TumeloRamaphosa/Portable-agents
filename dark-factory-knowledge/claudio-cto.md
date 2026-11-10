# Claudio-CTO — cleaned knowledge summary

Sources: Obsidian `Claudio-CTO/` (read 2026-11-09). Private IPs/hosts, tokens and mesh/proxy names replaced with codenames or `[REDACTED_*]`.

## Role of this folder
Human-readable CTO control plane: decisions, schedules, system map, research and inbox for StudEx agents/infrastructure. Git holds code; Drive is exchange layer; credentials never belong in Obsidian/Drive/Git.

## Current system map (high level)
Local: OpenClaw / ClawX, Hermes, PicoClaw, Ollama, Gitea, Buzz/Katya containers, OrbStack.  
Cloud/tools: Google Drive, GitHub, Warmwind, Orgo.ai disposable workers, multiple model providers (Anthropic, OpenAI, MiniMax, OpenRouter, etc.).  
Scale risk: hundreds of OpenClaw agent definitions vs a much smaller active team; OrbStack/Gitea health issues noted historically.

## StudBot / CashClaw deployment decision (15 Oct 2026 themes)
- StudBot Client OS and CashClaw deployment roles, launch boundary and production gates documented.
- Same-day commercial launch boundary: safe offers vs do-not-enable list; public-site warnings; production gates; 30-day path with success measures.
- Ghost-managed StudBot slide/visual briefs exist in Inbox (Influencial drop) for presentation packaging.

## Ecosystem integration (Nov 2026 plan themes)
Three layers (local infrastructure, vaults/knowledge, agent rosters). Daily ops morning ~06:00 SAST; evening personal time ~19:00. Roadmap phases toward Black Cloud MVP, Robusca mobile, integration/launch. Tech choice notes compare OpenJarvis vs build-from-scratch; model selection guidance.

## OpenJarvis integration
Plan-level integration for a talking/orchestrating Jarvis-style layer over the StudEx stack — treat as plan, not deployed fact, unless separately verified.

## Meat agent connection plan
StudEx Meat agent connection plan (5 Oct) covers how meat-store agents plug into OS, approvals and store workflows — use for PRD intake context, not live credentials.

## MacBook VM deployment plan
Large plan for VM placement on Robuska's house (MacBook) — infrastructure planning only; no secrets reproduced here.

## Risks called out in notes
Treat any credential ever seen in chat or notes as compromised and rotate it; never reuse it. Disk pressure and oversized OpenClaw state. Prefer least privilege and approval gates.

## Source notes
`HOME.md`, `Systems/Current System Map.md`, `Decisions/*`, `ECOSYSTEM-INTEGRATION-NOV2026.md`, `OPENJARVIS-INTEGRATION-PLAN.md`, `MACBOOK-VM-DEPLOYMENT-PLAN.md`, `Plans/2026-10-05 - StudEx Meat Agent Connection Plan.md`, `Reports/*`, `Research/*`, `Automations/Schedule.md`, `Skills/Solo Founder Skills.md`, `Drive/Shared Agent Files.md`, `Inbox/Infulencial/*`. Skipped non-text: `Diagrams/studex-multi-machine-bot-os.html`.
