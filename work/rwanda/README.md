# Rwanda work ledger

`jobs.json` is the local, measured initial ledger for `rwanda-coffee`. Its empty `jobs` array means that no jobs have run; it is not backfilled with sample or historical work.

## Lifecycle

The primary lifecycle is `planned -> dispatched -> completed_work -> reviewed -> released`. A job can enter `blocked` when evidence or infrastructure is insufficient, or `awaiting_approval` when a requested action crosses a human-approval boundary.

Only one deployment writer may write at a time. Review is independent of execution, and release requires human approval. Receipt of a request is not completion; evidence and audit timestamps are required before a state transition can support a completion claim.

The mission-control UI is read-only. An empty ledger correctly displays `No jobs recorded.` and zero jobs; it does not imply that agents are online or that execution is connected.
