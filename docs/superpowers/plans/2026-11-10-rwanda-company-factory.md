# Rwanda Company Factory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish one auditable internal Rwanda coffee job before scaling this template to other companies.

## Architecture

The public `TumeloRamaphosa/Portable-agents` repository holds the structural company contract, validation tests, and the empty local evidence ledger. The Hub VM is the intended private Gitea host and coordination point; the Rwanda VM is one future execution node. Only the named deployment writer may write deployment state at one time. An independent reviewer evaluates run evidence before a human authorizes release. The read-only mission-control page renders ledger data and cannot initiate work.

This plan defines no live company, production service, sale, partnership, or agent readiness. Current blockers are retained as blockers: Rwanda containers were healthy while fetches failed, Mac model generation timed out, and Gitea is not installed on the Hub.

## Tech Stack

Python 3.12 standard library (`unittest`, `json`, `argparse`) validates contracts. Node.js built-in `node:test` validates the browser-independent ledger module. Semantic HTML, CSS, and ECMAScript modules provide the static read-only UI. Future runtime integration uses the supported `hermes chat --query-file --oneshot --max-turns 4 --run-budget 180` command and OpenClaw only after a real minimal provider generation and identity checks succeed. HTTPS and authenticated private Gitea are future infrastructure tasks, not current state.

### Task 1: Establish the bounded company contract

**Files:** `factory/rwanda.json`, `docs/RWANDA-PILOT.md`, `docs/superpowers/plans/2026-11-10-rwanda-company-factory.md`

- [ ] In `/opt/studex/portable-agents`, define schema version 1 for `rwanda-coffee`, status `planned`, country `Rwanda`, the `coffee-distribution` sector, and the six bounded agent scopes.
- [ ] Name `hermes-rwanda` as coordinator and `integration-lead` as sole deployment writer; record intended—not verified—tool access only.
- [ ] Require human approval for external outreach or commitments, public announcements or publication, production deployment, purchases/APIs/renewals, pricing, and shipping. External actions are single-person authorized actions, never autonomous fleet behavior.
- [ ] Require sanctions, legal, export-control, data-transfer, ownership, payment-route, and end-use review before any Russia-linked counterparty agreement claim.
- [ ] Run `python3 -m unittest discover -s tests -v`; confirm the configuration reports no live execution or commercial outcomes.

### Task 2: Validate the structural contract

**Files:** `factory/validate_company.py`, `tests/test_company_contract.py`

- [ ] Write failing tests for a valid fixture, status other than `planned`, integer schema version 1 excluding booleans, malformed agents, duplicate case-sensitive agent IDs, coordinator membership, missing approvals, optional fields, stable sorted errors, and input immutability.
- [ ] Implement `validate_company(document: dict) -> list[str]` without network calls or caller-input mutation. Validate only the documented top-level shape and known optional fields.
- [ ] Add an argparse CLI accepting one or more JSON paths. Print each invalid path and its errors; return 1 for malformed JSON or any invalid document and 0 only when every document is valid.
- [ ] Run `python3 -m unittest discover -s tests -v` and `python3 factory/validate_company.py factory/rwanda.json` from `/opt/studex/portable-agents`.

### Task 3: Add ledger integrity and a read-only renderer

**Files:** `work/rwanda/jobs.json`, `work/rwanda/README.md`, `mission-control/jobs.json`, `mission-control/rwanda-ledger.html`, `mission-control/rwanda-ledger.mjs`, `tests/rwanda_ledger.test.mjs`

- [ ] Create schema version 1 with `company_id: rwanda-coffee`, an actual current UTC `generated_at` ending in `Z`, and `jobs: []`; copy the identical static fixture to mission-control.
- [ ] Test sorted schema and per-job field errors, unsupported states, missing HTTP resources, invalid JSON, and no-store Accept-JSON requests before implementing.
- [ ] Implement `validateLedger(data)` and Promise-returning `loadLedger(url)`. Default the browser request to `./jobs.json`; surface all request, parsing, and validation errors through the visible `role=status` element.
- [ ] Render job strings with `textContent`, use semantic rows/cards, show `No jobs recorded.` for an empty ledger, and clearly state `Not connected to agent execution` and `Read-only ledger`.
- [ ] Add no dispatch, persistence, credential, external-resource, social, or approval controls. Archived Discord, meat-image HTML, and fleet SVG material may inform black/gold styling only, never supply data or functionality.
- [ ] Run `node --test tests/rwanda_ledger.test.mjs` and `python3 -m unittest discover -s tests -v`.

### Task 4: Prepare private Hub Gitea with HTTPS authentication

**Files:** future operator runbook and reviewed configuration, outside this structural change

- [ ] Record the observed blocker that the Hub has no Gitea installation; do not claim a repository or authentication path exists.
- [ ] In a separately approved infrastructure change, install private Gitea on the Hub, configure HTTPS, and use authenticated operations without storing tokens in this public repository. Retain existing Mac repositories for later migration.
- [ ] Establish `studex-rwanda` only after the host is verified; make Hub Gitea canonical for cloud/VM work while retaining this public planning repository.
- [ ] Verify single-writer deployment exclusion, explicit actor scopes, idempotency keys, audit timestamps, and backup/restore evidence. Do not deploy from this plan or alter existing production configuration.

### Task 5: Build a real bounded runtime adapter

**Files:** future adapter and adapter evidence tests

- [ ] Preserve compatibility with `docs/AGENT-CONNECTIONS.md` on `origin/codex/agent-operator-onboarding`: verified adapter identity, capabilities, health timestamp, acceptance ID, run status, result URI, audit timestamps, explicit scopes, idempotency, and receipt-versus-completion distinctions. No merge is implied.
- [ ] Write failing adapter tests using a deterministic local transport double, then implement invocation only through `hermes chat --query-file --oneshot --max-turns 4 --run-budget 180`; do not invent Hermes delegation APIs or invoke Grok.
- [ ] Return structured receipt, completion, error, and timeout records without treating container health as execution. Keep external actions awaiting explicit human approval.
- [ ] Run `python3 -m unittest discover -s tests -v`; keep runtime status unverified until a real minimal provider generation succeeds.

### Task 6: Prove two-stage evidence after provider generation succeeds

**Files:** future redacted evidence records, adapter integration tests, optional mission-control presentation updates

- [ ] Treat the Mac generation timeout and Rwanda fetch failure as unresolved blockers; do not substitute simulated success.
- [ ] After a real minimal provider generation succeeds, run one bounded internal Rwanda coffee job through Hermes and then OpenClaw. Capture acceptance ID, identity, capability and health evidence, timestamps, run status, result URI, idempotency key, logs, and independent QA review.
- [ ] Verify that the first stage is a receipt rather than completion and that the second stage supplies actual result evidence. Transition `planned -> dispatched -> completed_work -> reviewed` only when supported; use `blocked` or `awaiting_approval` where appropriate.
- [ ] Require human approval before `released` and before every external, public, paid, pricing, production, or shipping action. Keep tests free of external requests.
- [ ] Optionally adapt the archived UI references into the existing read-only dashboard style without copying mock agents, images, metrics, or activity. Run `node --test tests/rwanda_ledger.test.mjs` and `python3 -m unittest discover -s tests -v`.
