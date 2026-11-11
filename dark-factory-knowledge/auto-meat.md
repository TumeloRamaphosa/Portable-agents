# Auto-Meat — cleaned knowledge summary

Sources cited from Obsidian `Auto-Meat/` (read 2026-11-09). Secrets, private hosts and keys removed.

## What it is
Auto-Meat is StudEx’s multi-agent **operating system** for coordinating agents, business workflows and a mission-control dashboard. It also supports the **Nozi-Corp coffee sales** mission (South Africa and Eswatini research and customer-service demos).

## Products / offers tied to this lane
- Agent OS / control plane for Buzz-coordinated workers (planning stage).
- Coffee sales research and B2B opportunity demos for Nozi-Corp (South Africa + online + Eswatini SME channels).
- Public MiniMax dashboard prototype exists; **not** a verified live backend (seeded/mock data as of 2026-10-07).

## Architecture (proposed)
Boundaries: Buzz (collaboration) · Git (code) · Drive (approved docs only) · DB/object storage (state + audit) · VM/containers (runners) · authenticated dashboard · this vault (durable knowledge).
First vertical slice: `Buzz task → worker → dashboard status → audit event`.

## Roles
Channel agents (public identities only): Fizz, Pollen (content research), Honey (content), Auto-Meat (operations), Cypher-Trace (engineering), Kimi Desk - Mac1 (engineering / OS builder). Ecosystem peers named in context: Enforcer, Naledi, Goose, OpenClaw, Robusca-Prime, CashClaw.

## Processes
- Daily Nozi-Corp rhythm (SAST): check-in 09:00 → research / OS work through late afternoon → Notion + Obsidian closeout ~17:30–18:00.
- Identity onboarding: Buzz Desktop owner flow; private keys only in Keychain/secret store; record only public npub, role, runtime, model policy.
- Approval gates for external writes, publishing, spend, fulfilment.

## Decisions / invariants
- No secrets in vault, Git, Drive or Buzz.
- One active signer/runtime per agent identity.
- Unknowns stay `TBD`; do not invent access.
- Dashboard is prototype until staging + acceptance evidence exist.

## Open questions / blockers
- Authoritative Auto-Meat repo / dashboard source export: TBD.
- VM provider, OS, approved SSH profile, mesh/VPN details: TBD (partial connectivity evidence only).
- Database, production domain, named production approver: TBD.
- OpenClaw / Robusca-Prime registry records without usable private identity.

## Source notes
`README.md`, `CRITICAL_FACTS.md`, `index.md`, `Projects/Auto-Meat Operating System.md`, `Architecture/Multi-Agent Operating System.md`, `Architecture/Dashboard Audit 2026-10-07.md`, `Architecture/VM Connectivity Record.md`, `Boards/Auto-Meat Delivery Board.md`, `Docs/Auto-Meat Onboarding Checklist.md`, `Registry/Agent Identities.md`, `Registry/Nozi-Corp Project Context.md`, `Registry/Team Daily Routine.md`, `Daily/2026-10-08.md`, `Logs/2026-10-08.md`, `_CLAUDE.md`, `log.md`.
