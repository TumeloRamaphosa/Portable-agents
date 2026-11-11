# Rwanda company pilot

This branch contains only a bounded structural definition for one planned Rwanda coffee-distribution company. It includes the JSON contract and validator, Python and Node tests, an empty current ledger, and a read-only ledger UI. It is not evidence of production, sales, partnerships, model readiness, or completed agent execution.

## Verify locally

From `/opt/studex/portable-agents` on the Hub VM:

```sh
python3 -m unittest discover -s tests -v
python3 factory/validate_company.py factory/rwanda.json
node --test tests/rwanda_ledger.test.mjs
```

Open `mission-control/rwanda-ledger.html` through a static file server if desired. Its sole default data request is `./jobs.json`; a missing or invalid ledger is shown as an error. The page cannot dispatch work or approve releases.

## Boundaries and unfinished work

Gitea was not installed on the Hub at the start of this work. Real model generation, runtime adapters, Rwanda fetch behavior, and two-stage Hermes/OpenClaw evidence remain unverified. Later provider authentication must be verified interactively with a real provider; this document is not an installer or an authentication claim.

Only one deployment writer may act at a time, with independent review. Human approval is required for outreach and commitments, publication and public announcements, production deployment, purchases and renewals, pricing, and shipping. Russia-linked counterparties additionally require sanctions, legal, export-control, data-transfer, ownership, payment-route, and end-use review before any agreement claim.

The future adapter contract remains compatible with [`docs/AGENT-CONNECTIONS.md` on `origin/codex/agent-operator-onboarding`](https://github.com/TumeloRamaphosa/Portable-agents/blob/codex/agent-operator-onboarding/docs/AGENT-CONNECTIONS.md), including verified identity, capabilities, health timestamp, acceptance ID, run status, result URI, audit timestamps, explicit scopes, idempotency, and receipt-versus-completion evidence. That branch has not been merged.

See the [implementation plan](superpowers/plans/2026-11-10-rwanda-company-factory.md), [company contract](../factory/rwanda.json), and [ledger lifecycle](../work/rwanda/README.md).
