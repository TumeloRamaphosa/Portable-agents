# Cash Claw — forward strategy (Studex)

**Decision (2026-11-19):** Cash Claw is part of the agent stack going forward — as **financial intelligence** inside Mission Control **and**, when chosen, as **agent monetization** on trusted hosts. It does not replace Paperclip, Hermes Lead, or the factory ZTE queue.

## Two layers (run both; wire separately)

| Layer | Name in ops | Purpose | Where it lives |
|-------|-------------|---------|----------------|
| **A — Finance lane** | **CASHCLAW** (Mission Control) | ROM, pricing, raise prep, weekly roll-up | `PLAN.md`, vault notes, `claude` / Hermes on hub |
| **B — Agent economy** | **CashClaw** (vendor) | Paid tasks, skills, Guard/cost caps (optional) | OpenClaw-capable worker only; never on phone |

Layer **A** is always on strategy. Layer **B** is **opt-in per host** after hub mesh (Phase 1) is healthy.

## How it fits the stack

```
Board (NALEDI-CEO) ──► Paperclip :3100 (tasks, budgets)
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    Hermes Lead          Factory ZTE           CASHCLAW lane
    (delivery)           (Grokbots ship)       (ROM / pricing)
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
              Optional: vendor CashClaw on one MSI/Naledsi pane
              (Stripe / marketplace — sandbox first)
```

| System | Cash Claw relationship |
|--------|-------------------------|
| **Paperclip** | Company spend and agent budgets stay here; CashClaw marketplace agents are **not** auto-registered as Lead |
| **Hermes** | Runs delivery; CASHCLAW pane produces models and decks, not customer-facing send |
| **Herdr + Obsidian** | Checklist: `integrations/obsidian-herdr/cashclaw.md.example` → vault `herdr/cash-claw.md` |
| **Stud-Bot GTM** | Merchant pricing on pitch deck must match CASHCLAW ROM (single price source) |
| **Drive** | Sanitized ROM exports via `agent-work-archive.sh` stubs only |

## Vendor choices (pick in vault section 0 — one primary)

| Track | When to use | Start command (on trusted host) |
|-------|-------------|----------------------------------|
| [ertugrulakben/cashclaw](https://github.com/ertugrulakben/cashclaw) | OpenClaw + skills + Stripe + Guard | `npx cashclaw init` |
| [moltlaunch/cashclaw](https://github.com/moltlaunch/cashclaw) | Marketplace bid/work/pay loop | `npm i -g cashclaw-agent moltlaunch` |
| Repo-only CASHCLAW | No vendor until INVESTMENT.md aligned | Obsidian checklist only |

Default recommendation: **repo-only CASHCLAW until Paperclip health PASS**; then pilot **ertugrulakben** on **one** non-hub machine with Guard caps documented in vault.

## Sequencing (do not invert)

1. **Unblock Layer A:** resolve `INVESTMENT.md` vs actual company model (`PLAN.md` blocker).
2. **Hub:** Paperclip + Hermes Lead (`AGENT_COMPANY_SETUP.md`).
3. **Obsidian:** copy `cashclaw.md.example` → `herdr/cash-claw.md`; workspace `cashclaw` in Herdr.
4. **Optional Layer B:** sandbox vendor CashClaw on Dark Factory or Naledsi; no production secrets in git.
5. **ZTE-009** verification (see factory queue).

## Metrics (CASHCLAW lane)

- Weekly: one ROM snapshot + pricing delta note in vault
- Before any pitch: Stud-Bot deck figures reconciled with CASHCLAW (speaker notes already flag placeholders)
- Before vendor pilot: Guard daily USD cap written in vault (not in chat)

## Related

- [OBSIDIAN_HERDR_BRIDGE.md](./OBSIDIAN_HERDR_BRIDGE.md)
- [AGENT_COMPANY_SETUP.md](./AGENT_COMPANY_SETUP.md)
- [PROJECT_STATUS.md](./PROJECT_STATUS.md)