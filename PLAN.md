# BLACK CLOUD — INTEGRATION PLAN

**Owner:** Tumelo Ramaphosa (NALEDI-CEO) · Studex Group
**Started:** 2026-09-08 · SAST
**Status:** ACTIVE — auto-pushed every 30 minutes
**Repo:** https://github.com/TumeloRamaphosa/Portable-agents

---

## THE ONE-LINE THESIS

Africa's only vertically-integrated, African-owned sovereign AI operator — we own the
physical floor, the portable compute, the agent layer and the sovereign distribution,
and we sell it to governments and enterprises who legally or geographically need what
only we can deliver.

---

## WHAT WE ARE ACTUALLY BUILDING

Three products, one stack. They are not separate businesses.

| # | Product | What it is | Who asked for it |
|---|---------|-----------|------------------|
| **P1** | **Mission Control** | Single pane of glass over business ops. AIOps / MLOps / LLMOps. Role-based views. | PwC MEA — explicit written requirement |
| **P2** | **Black Cloud Node** | Handheld/desk sovereign inference appliance. Runs the agents fully offline. | Rwanda — "bare metal, offline, on-premise" |
| **P3** | **The Data Centre** | Cape Town floor, Oct 2026 target. Modular African nodes after. | Russian consortium + Wesco supply chain |

P1 is the software. P2 is the box P1 runs on when there is no cloud. P3 is the floor
under both when there is. **Sell P1 first — it needs zero capital.**

---

## SEQUENCING — WHY THIS ORDER

1. **P1 closes with no capital.** PwC pays for execution capacity, not infrastructure.
2. **P1 revenue de-risks P2.** A signed MSA is the reference customer for the device.
3. **P2 proves the sovereignty claim.** Rwanda deployment = the case study.
4. **P3 is gated on contracted demand.** Do not buy a data centre before you have load.
5. **The raise comes after P1.** A priced round beats a pre-revenue round.

Do not invert this. The failure mode is buying the physical layer first.

---

## PHASES

### PHASE 0 — REPO + CONSOLE  ✅ DONE 2026-09-08
- [x] Claim `TumeloRamaphosa/Portable-agents`
- [x] Mission Control console — single-scroll, role-switched, Studex design system
- [x] Auto-push cron every 30 min
- [ ] Deploy console to a public URL (Vercel)

### PHASE 1 — PWC ANCHOR  ⏳ CRITICAL PATH · WEDNESDAY
- [ ] **Get AB's NDA executed** — blocks everything else. Do not release PRD first.
- [ ] AI Ops capability deck (white-label, PwC-brandable)
- [ ] End-to-end architecture flowchart
- [ ] Commercial ballpark matrix — consulting / implementation / run
- [ ] UAE + KSA architecture one-pager (data residency)
- [ ] Live Mission Control demo — this repo's console is the demo
- [ ] Decide: present Wednesday or push the date

### PHASE 2 — SOVEREIGN DEVICE
- [ ] Bill of materials, target sub-$900 at volume
- [ ] Offline stack image: Ollama + LiteLLM + agent fleet + local console
- [ ] Air-gap validation — full agent loop with no network
- [ ] Freeman / Apple channel pricing
- [ ] China OEM sourcing trip scope
- [ ] Rwanda pilot unit spec

### PHASE 3 — RWANDA DEPLOYMENT
- [ ] Confirm travel dates (government go-ahead already received)
- [ ] Infrastructure-first scope — infra lands before AI layer
- [ ] Ministerial meeting slots
- [ ] timbuktoo: AI/data infrastructure is **not** one of their eight verticals — pitch it as the cross-cutting gap
- [ ] Norrsken: build on the existing hub, do not start parallel

### PHASE 4 — CAPE TOWN DATA CENTRE
- [ ] Site shortlist
- [ ] Power: Eskom has ~6 GW surplus and is courting DC load — **grid access and wheeling is the binding constraint, not generation**
- [ ] Two physically diverse fibre paths
- [ ] Russian consortium terms (Intech, Fosagro, Evalca, Valka)
- [ ] Wesco supply chain quote — hold until Phase 1 closes
- [ ] Capex model gated on contracted demand

### PHASE 5 — CAPITAL
- [ ] Financial model — replace the `INVESTMENT.md` stub, which is a different company
- [ ] Investor-facing platform page
- [ ] Target list with real addresses
- [ ] AgentMail draft sequence

---

## THE RWANDA ARCHITECTURE

```
              UNDP + AFRICAN GOVERNMENTS
                          │
                     TIMBUKTOO
              (pan-African innovation, $1bn)
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
  Catalytic Capital    UniPods        Startup Hubs
        │
        ▼
  Startup Discovery → Acceleration → Funding Readiness
        │
        ▼
              STUDEX AGENTIC RISE
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   Business Ghost    AI Workforce    Execution Exchange
        │
        ▼
              GLOBAL MARKETS
```

**The gap we fill:** timbuktoo funds startups across eight verticals. AI and data
infrastructure is not one of them — yet it is cross-cutting across all eight. That is
the entry point, and it is the thing to raise at the CEO meeting.

**Division of labour (Rwanda side):** Timbuktoo brings the hub, unipods, capital, policy
and mentors. Studex brings Business Ghost, the Agent OS, cloud/VM, Execution Exchange
and Global Markets.

---

## COUNTERPARTIES

| Name | Org | Role | State |
|------|-----|------|-------|
| Anurag ("AB") | PwC Middle East | BD, PwC relationship, sales | **NDA unsigned** |
| Pele | Nedbank | Banking / finance connections | Warm |
| Schalk Bothma | Wesco | DC supply chain | Warm, do not commit |
| Natalia · Olga · Vyacheslav | Russian consortium | DC deployment + manufacturing | Active |
| Mr Hatega | Rwanda Govt | Route to Minister of ICT | Awaiting deck |
| Natalie | Timbuktoo / UNDP | Needs a UNDP-vettable proposal | **Owes: module catalog + demo** |
| Chris | GenTech (Silicon Valley) | Accelerator programs, Eve AI, $250M DC | Partner |
| Freeman | Apple supplier | Local hardware channel | Partner |
| Dr Karimov | SAKTCA / Kazakhstan | Central Asia corridor | Awaiting reply |

**Standing note on Natalie:** she pushed back hard on breadth. She wants *one or two
concrete things*, specified tightly enough to survive UNDP vetting. Lead with the module
catalog and a single pilot, not the ecosystem diagram.

---

## OPEN BLOCKERS

| Blocker | Impact | Owner |
|---------|--------|-------|
| AB has not signed the NDA | Cannot release PRD or architecture | SCHALK |
| Alibaba ECS SSH is publickey-only, no access | Cannot deploy client VMs | JENSEN |
| Paperclip Valley OS down 17+ days | Orchestration layer offline | RALF |
| Codex workers 0 of 10 up | No automated coding capacity | RALF |
| No DC site, power feed or fibre path identified | Phase 4 is a hypothesis, not a plan | NALEDI-CEO |
| `INVESTMENT.md` describes a different company | No usable financial model | CASHCLAW |

---

## DECISION LOG

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-08 | Platform + engine, both | Investor front door, deal-scoring engine behind it |
| 2026-09-08 | South Africa researched first | Cape Town DC is the live October commitment |
| 2026-09-08 | Emails drafted into AgentMail, never auto-sent | Tumi reviews before anything leaves |
| 2026-09-08 | Sell P1 before building P3 | Zero-capital anchor de-risks the physical layer |

---

*Auto-maintained. Every 30 minutes this repo pushes whatever state the build is in.*
