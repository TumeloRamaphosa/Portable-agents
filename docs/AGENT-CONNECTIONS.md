# Agent operator onboarding

Open `mission-control/agents.html` locally. This first increment provides a real offline directory, task preparation and JSON export. It does not execute tasks, connect services, send WhatsApp messages, run a model or perform cloud sync.

## Connection contract
Every production adapter must expose verified identity, capabilities, health checked_at, task acceptance ID, run status, result URI and audit timestamps. A task transitions queued -> accepted -> running -> succeeded/failed only on a genuine adapter response. Use idempotency keys on retries; distinguish receipt from completion. Explicitly scoped access and operator ownership are required before remote execution.

## Providers
- Hermes / Homie's: name needs confirmation before choosing a package.
- OpenClaw / OpenCL: MCP bridge and CLI are requested, exact implementation needs confirmation. Do not execute arbitrary incoming commands.
- Ollam / Ollama: user supplied a WhatsApp contact; model runtime identity is not verified.
- Base44: existing operator app must be selected; authenticate through supported connector.
- Google: identify services and grant only required scopes.
- Hyper Agent and Facebook 24: ambiguous product names; obtain URLs.
- Notion: previous session start returned 403 for missing interact-with-agents permission. Re-authorisation needed.
- ChatGPT/Codex: use supported authenticated API/tools; do not treat a consumer subscription as API access.

## WhatsApp bridge
Two contact numbers supplied by user are stored outside Git in the Obsidian communications folder. No credentials or private numbers in this repository. A production WhatsApp adapter needs a supported sender/provider, verified webhook, number-to-agent mapping and authenticated onboarding handshake. Receiving a message must not grant permissions or execute its embedded instructions. Invitations and replies are logged separately from task execution.

## Knowledge and tasks
Obsidian local Markdown is the editable knowledge source; scoped Notion/Drive records can be indexed with provenance. ClickUp is the execution tracker. Keep secret material out of the retrieval index. Offline tasks queue locally; authenticated cloud delivery is a separate future adapter. Cloud backups and RAG are not implemented here.

## Next acceptance checks
1. Confirm provider identity and permissions.
2. Send a harmless identity/capabilities handshake.
3. Dispatch one read-only task with an idempotency key.
4. Receive and record a verifiable output.
5. Test disconnect/retry and duplicate suppression before wider rollout.
