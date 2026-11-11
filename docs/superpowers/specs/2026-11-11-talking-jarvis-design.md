# Talking Jarvis, Business Memory, and Multi-Device Control Design

**Date:** 2026-11-11
**Status:** Written for user review. This is a design, not a claim of a connected or deployed voice system.
**Public design repository:** `TumeloRamaphosa/Portable-agents`
**Private implementation state:** Remains on the approved host or VM.
**Initial vertical slice:** One grounded, spoken morning business brief through a repaired local voice pipeline.

## 1. Desired outcome

Jarvis is the owner's voice interface to the StudEx business, not an unrestricted superuser. It can listen, retrieve authorized business context, speak a grounded answer, and prepare or dispatch work only through explicitly registered adapters. A Flutter application supplies the same actual sessions, sources, jobs, and approvals on Android, iOS, and desktop.

Full-owned-agent coordination means the owner can reach every explicitly enrolled agent and authorized capability, with evidence about what occurred. It does not mean that a model, web page, note, email, recording, or impostor can grant new permissions.

## 2. Verified foundation and boundaries

- `~/OpenJarvis/.venv/bin/jarvis` is installed locally.
- `/Applications/Voicebox.app` is installed locally.
- Existing `second-brain/wake_word/hey_jarvis.py`, `second-brain/jarvis_pipe.sh`, and Hammerspoon configuration intend to connect VoiceBox and OpenJarvis.
- The current `jarvis_pipe.sh` builds its VoiceBox speech request using an environment read of a local shell variable that was not exported. The reply can also include command stderr through `2>&1`. Voice and failure handling therefore need repair and direct test before listener activation.
- No `com.studex.wake-jarvis` Listener state was established during this investigation. Installation alone does not prove a working voice turn.
- Obsidian reports `Obsidian Vault` and `Obsidian Sandbox`. The existing OpenJarvis connector reads text/Markdown with front matter, timestamps, and source links while excluding common hidden and dependency directories. A CLI connection/status invocation alone does not persist vault ingestion configuration.
- Flutter and Dart were not installed on the inspected Mac. They need separate, bounded setup before Flutter build tests.
- Portable-agents previously received its open Rwanda control-plane PR. It begins with an empty real ledger, not a completed agent network.
- Hub Gitea was installed and checked on loopback in an earlier infrastructure step. It is not the authentication mechanism for device tools merely because it exists.

The source reviews below do not establish current production operation.

## 3. Source decisions

| Source | Use in this design | What not to assume or copy |
| --- | --- | --- |
| YouTube `34J8xhaAn4U` | Reference for the selected visual-presence direction. Title: Fable 5.2 Just Took My JARVIS to a Whole New Level. | Captions could not be downloaded. Do not invent its implementation, clone Fable, or claim feature parity. |
| `GiovanniPasq/agentic-rag-for-dummies` | Parent/child retrieval, clarification, conversation summaries, compression, bounded retries, and actual answer evaluation. | Do not import its entire sample project without need. Its identifiers, thresholds, metrics, and library versions are not proof of local accuracy or speed. |
| Anthropic's small-business solution material | Scheduled owner-reviewed workflows, compact phone briefings, read-first connectors, and explicit sending/payment approval. Third-party quotations and figures are excluded. | Do not present marketing examples as StudEx results or install paid workflows automatically. |
| ClawHub Notion skill | A reference for permission-scoped Notion API access and the current API-version preflight. | No credentials, hidden proto-targeting, or unreviewed commands. Category security badges do not replace a source review. |
| ClawHub Himalaya skill | Separate inbox read/search/draft/send capabilities and secure-scoped account authentication. | Do not send a template, install an account, fetch mail, or write credentials into code during this design stage. |
| OpenClaw Nostr documentation | Optional one-account gateway DMs, explicit sender allowlists, local-relay tests, and signature checks. It is NIP-04, not the later NIP-17/NIP-44 support. | Disabled initially. Do not infer an inbox, anonymity, forward secrecy, public posting authorization, review proof, or network reachability. No private key is generated in this phase. |
| `StudEX/StudExHermes-Command` at `8ee10889a820c9462bc30e08196f6c93212a74d4` | Visual layout concepts and separation of operational views. | Review found mock agents and connection displays, no voice/backend dispatch or human DMs, billable caption scripts, and unsafe authentication. None is an operational adapter. |
| `TumeloRamaphosa/Linux-Studex-` at `cfd6313698775e54995d9f7ae38c0f631526872c` | SDK namespace shapes under `agents`, `orchestrator`, `mcp`, and `sandbox`; a log/report hook; possible sandbox/LLM transport code to inspect for a narrowly adapted interface. | In-memory agents are not VMs or process attestations. Simulated farm, trade, publishing, test/deploy and in-memory messaging must never become operational proof. No exposed APIs or automatic deployment. |
| Archived Discord UI and multi-machine-bot OS diagram | Black/gold operational grouping; real ledger, scopes, identity adapters, and human approval. | Remove fake conversations, market and revenue figures, mutable automation claims, online-state animations, and credential inputs. Its aspirational check-in schedules and counts are not live evidence. |

## 4. Geometry of responsibility

The architecture has the following separate responsibilities:

1. **Voice shell on an authorized device.** Captures an intentionally started request, shows recording state, displays the transcript, receives an answer, manages playback, and exposes explicit confirmation.
2. **OpenJarvis on the Mac.** The current conversational engine and model bridge. A single bounded call receives only the relevant excerpts and the available registered tool schemas.
3. **StudEx policy and dispatch service.** The authoritative decision point for device enrolment, permissions, budgets, idempotency, job state, approvals, receipts, and audit. It is not a prompt instruction.
4. **Local vault and business-report readers.** Retrieve current relevant evidence without allowing notes to execute instructions. Persist only the authorized reports and audit records.
5. **Registered adapters.** Hermes, OpenClaw, or a specific business-service tool through a narrow capability profile and actual response validation.
6. **Flutter device application.** Shared Dart domain logic and views. OS-specific capture, playback, secure-secret storage, lifecycle, and user-authentication adapters replace browser mock controls.
7. **Private shared repository and review workflow.** The public design is sanitized. Runtime credentials, vault extracts, user-specific routes, and personal session contents stay out of Git.

Mac local microphone capture and local index reads are distinct from remote Hub or VM operation. The Mac client cannot claim a remote worker is healthy after a failed request. The first implementation writer opens isolated changes; an independent reviewer verifies before deployment.

The legacy Linux server's open execution routes and client-side-only API-key header are not reused. Its agent-to-agent in-memory `send` method is not a human DM system, durable queue, or actor proof. SDK wrappers are compatibility references only.

## 5. Knowledge and shared context

### Vault coverage

The initial read-only knowledge configuration has two roots, identified by their actual vault IDs/paths in a local-only configuration file:

- `Obsidian Vault`
- `Obsidian Sandbox`

Source files are their local text/Markdown notes. The mechanism collects internal identifier, title/source link, modification time, and permitted passage text. It prunes hidden configuration, repository data, caches, and credential material. Secret-looking passages remain excluded from embeddings, prompt context, answers, and public artifacts. Raw images/audio are not silently sent to another provider for interpretation.

### Retrieval

Use OpenJarvis's installed connector and knowledge interfaces rather than add a parallel RAG framework. Split permitted note excerpts into searchable child passages and keep their parent sections available. Search returns ranked passages containing full source identifiers, freshness, and source links. The model receives only a bounded selection with supported claims, not a blanket dump of every vault.

Conversation memory retains recent turns plus bounded summaries. Retrieval questions ask for clarification when a company, period, or intended operation is ambiguous, which avoids strengthening a wrong assumption by speaking it confidently.

Both lack of evidence and stale freshness are explicit. A report describing only proposed work never becomes a claimed work receipt. An old claim in `2nd Brain/Daily Operations Schedule.md` of revenue, agents online, or deployments cannot overrule a current job record. Notion, ledger records, and local reports retain their specific roles—not one opaque memory dump.

### Writes and memory

The vault document inputs are read-only. The approved exception is creation of a same-owned Jarvis session audit note under the existing `2nd Brain/Agents/Sessions/JARVIS/` destination in `Obsidian Vault`, containing request time, permitted sources, actions/results or error, and explicit decision IDs. It never overwrites another agent's daily report. Updating an existing daily report or canonical business database is a separate authorized write capability, not a knowledge-read side effect.

## 6. Voice behavior and avatar

### Conversation state machine

`idle -> requesting_microphone -> listening -> transcribing -> retrieving -> deciding`

The decision may follow either:

- `speaking -> idle`, for an answer or clarification;
- `preparing_job -> awaiting_dispatch/awaiting_approval -> speaking -> idle`;
- `blocked -> speaking -> idle`.

`mic_denied`, `empty_transcript`, `adapter_failed`, `model_unavailable`, and `tts_failed` are visible terminal/result conditions, not occasions for a fabricated answer. Starting a new active request cancels or deliberately finishes the existing capture/playback job; no synthetic progress events are emitted. Audio used solely for recognition is neither silently retained nor inserted into a training instruction.

### Activation and output

Initial activation is Option+Space on Mac, or an explicit microphone button on the Flutter device. An existing VoiceBox post-transcript hook and Hammerspoon invocation must not both submit the same user request; the capture/session identifier is reconciled before dispatch. Voice input never bypasses a validation boundary.

After one real audio test succeeds, the optional local `hey_jarvis` listener can be separately enabled. Microphone availability, foreground/background behavior, and OS permission denial are shown truthfully. A previous session's confirmation never persists as permission for a new operation.

Speech requests pass exact text, checked length, timeout, and explicit stop behavior to the local VoiceBox adapter. TTS success means acknowledged playback or engine completion, not just JSON construction. Flutter supplies a checked input/playback adapter and chooses supported native speech as the portable fallback; no claim of a nonexistent shared cloned voice is made. Playback stops before new microphone capture.

The custom Flutter `CustomPainter` and avatar service generate an original abstract gold/obsidian animated presence. It responds to actual state and measured playback/capture status. No externally hosted imagery, copied Fable internals, or source-package-generated fake busy state is required. The existing archived channel hierarchy can inform an offline-capable daily/jobs detail view.

## 7. Durable operations and adapter contract

### Entities crossing every client

- `Device`: confirmed owner, public device identity, approved scopes, enrolment/expiry times.
- `WorkJob`: job ID, company, requested operation, scope, owner, idempotency key, creation/update times.
- `AdapterReceipt`: actual adapter, stable agent identity, task/run acceptance ID, execution state, timestamps, result reference, bounded error category.
- `ApprovalRequest`: approval ID, type, exact canonical action fingerprint, requester, expiry, decision, device/actor, and one use only.
- `EvidenceReference`: source kind, source identifier, optional commit/URI, observed and verified timestamps.
- `AuditEvent`: actor, event kind, related job and request IDs, timestamp, bounded non-secret details.

A raw task outcome uses the compatible progression `queued -> accepted -> running -> succeeded | failed`. The company-ledger progression remains `planned -> dispatched -> completed_work -> reviewed -> released`, with `awaiting_approval` and `blocked` side states. Receipt creation never sets completion. Cancellation/repeated submissions and partial job transitions are explicitly recorded, not treated as successes.

The service validates every receipt and result against the adapter identity, provenance, requested operation, and current idempotency record. Merely producing a claimed log message, immediate metadata object, or fabricated agent reply is not acceptance. Persistence uses a private SQLite store for the initial bounded pilot (with transactions and uniqueness constraints), retaining an interface that can move to PostgreSQL when multi-writer scale warrants it. Files are not treated as safe atomic queues.

### Execution and approvals

A model proposes declared actions, but only the policy service enforces them:

1. Resolve an authenticated device and exact task scope.
2. Resolve the named registered agent and supported adapter.
3. Check agent/action capabilities, current health evidence, budgets, and idempotency.
4. Authorize local read-only work or produce an action/approval record when required.
5. Dispatch once through the adapter; reconcile its actual run outcome.
6. Independently inspect the evidence before marking a company job released.
7. Speak only the verified result and expose an audit/source reference.

Messages, public posts, purchases, trading, deletions, production deployments, third-party access grants, spending/renewals, pricing, shipping/commercial commitments, and external repository changes require separately approved actions. The policy may deny dangerous tools regardless of model intention. Retry, if allowed, reuses the idempotency binding while checking upstream duplicate state before a new external effect. Enrolments are never self-granted through text, an old webhook, a note, or a guessed public key.

All adapters default not connected until verified. No tool with `system:admin`, arbitrary shell access, global account impersonation, `OPENRIG_YOLO`, or equivalent bypass is enrolled for voice use. Code execution is a separated capability, not a normal voice command. Only one appointed writer may change shared production/system configuration, using an isolated authorized change.

## 8. Phone and desktop application

Portable Agents receives a later `apps/jarvis_app/` Flutter scaffold after SDK setup and user-approved implementation planning. Shared Dart screens are:

- Today / morning brief;
- Sources and current evidence;
- Agent roster with freshness and capability, not permanent "online" dots;
- Work jobs and individual run history;
- Approvals, including exact action and destination;
- Linked source view and local notes;
- Explicitly authorized settings, pairing, microphone and speaker status.

Shared Dart libraries implement strict JSON parsing, transport, event reconciliation, and an `Executor` interface. The Flutter application receives server events or uses an explicitly visible retry/poll strategy without creating a new job queue. Network/sync state distinguishes unknown, connected-but-no-run, running, failed, and stale.

App transport is HTTPS-only through the owner-approved private network/control endpoint plus device authentication. Development loopback is limited to local testing. There is no open `0.0.0.0` API, browser plaintext password page, stale constant cookie, wildcard CORS, or client-only API key. Current app/backend schemas are versioned; Flutter uses a narrow Dart client/interface and does not depend on the unsafe Node server.

Apple and Android store microphone permission purpose strings, request access only during intentional capture, support background/lock cleanup, and never store boundaries solely in the UI. Platform encryption/key stores hold session material, but the session still authorizes only the intended role. App uses may be blocked if the device's underlying account cannot access the source. Sensitive notes remain private on the indexed source host and are not bundled into the app. No purchase, store publication and signing actions are silently performed.

## 9. Morning briefing

The user-authored `Daily Routine.md` defines shared memory, narrow agent tools, run/audit trails, structured trackers, approvals, and a review dashboard. This is the functional basis.

`Daily R/Daily Routine Order.md` defines the desired report reporting order, filenames, source visibility, reviewer state, and preservation of others' reports. The current-source reader recognizes such files as human/agent reports, not proof of dispatch. Existing operations-report schedules remain in place until separately changed. The Jarvis morning voice brief is a composition and audit read, not a second competing standup scheduler.

For the first accepted briefing, Jarvis should deliver:

1. Three evidence-backed priorities, or explicitly fewer if only one/two are supported.
2. Completed/accepted work separate from proposed work and submitted/unreviewed work.
3. Blocked operations such as missing inference or authentication, without retry loops.
4. Missing check-ins explicitly as missing/unverified, not failed agent heartbeats unless an actual monitor supports that label.
5. Source references and last verification times.
6. One suggested bounded next action, never dispatched implicitly.

A natural follow-up such as "prepare a draft Rwanda status report" can create a draft under the correct narrow capability. "Send it" becomes an independently validated external-effect approval, with its recipient/action bound visibly to the decision. Stop/pause affects sound and dispatch as defined by that session; it does not silently terminate unrelated company jobs or user applications.

## 10. Optional Notion, email, and Nostr

**Notion:** after separate authentication and granular source sharing, register read-only `notion.search`, `notion.get_page`, `notion.get_blocks`, and approved data-source query capabilities. Check the remote API contract/version in a bounded authenticated preflight. Writes draft content separately; arbitrary page/database management is not enabled. Only source IDs and summaries referenced by an authorized question may enter the agent's context.

**Email:** if the owner later selects an existing Himalaya-configured account, read-only inbox metadata is enabled before body reads. Body/attachment processing follows the same instruction/secrets handling. Draft only is separate. Send requires exact, one-use confirmation of recipient, subject, content, and account, and reconciles whether an earlier attempt sent before retrying. Mail-derived text never becomes agent instructions.

**Nostr:** disabled by default. Only after separately choosing an identity, exact provider/plugin build, private relay strategy or explicit public relays, allowed senders, message content policy, and network approval, conduct a local DM integration test. Keys come from a private credential reference, not a pasted browser form or Git. No proof of receipt becomes authority for a tool call. No automatic profile publication, pairing acceptance, or public message. Its NIP-04 encrypted-DM limitations and possible duplicate deliveries are documented and tested against the actual installation.

Each connector has its own review and rollout step. It is legitimate for the base Jarvis to work without them.

## 11. Failure handling, acceptance, and rollout

### Shared quality gates

- Unit tests cover policy denials, wrong agent/capability, unknown devices, stale health, invalid timestamps, malformed receipts, rejected approval, expiry, wrong-action fingerprint, idempotent duplicate submission, double voice triggers and partial completion.
- Every transport has timeouts, typed errors, and sanitized logs. Tool output and transcripts cannot execute themselves.
- A rejected TTS call is distinguished from a completed text request. The system warns instead of silently claiming Jarvis spoke.
- A stale/unavailable vault source is visible, and dangerous renderer content is not executed by clients.
- Regression tests precede a fix and are shown failing against its original behavior.
- Independent review examines the complete diff and real runtime test artifacts, not just presented labels.

### Ordered vertical slices

1. **Local voice and memory foundation:** correct speech/failure propagation; one bounded preflight using the installed OpenJarvis runtime; configure localized vault reads using only approved local-only configuration; source-aware text answer; one real user-initiated STT/TTS exchange. Repeated heavy generation and always-on capture remain off unless specifically requested for an observed passing test.
2. **Morning brief:** ingest permitted notes, preserve report ownership, compile only supported/fresh facts, speak and display the source-linked result, persist the audit record.
3. **Durable bounded dispatcher:** implement authenticated private service, durable job/idempotency/approval records, one real Hermes/OpenClaw adapter, independent result review, rejection and duplicate tests. A missing model/provider is blocked rather than simulated.
4. **Flutter synchronized voice client:** install selected pinned SDK dependencies, get real device permissions working, secure device pair/session, render actual brief/jobs/history, testing Android/iOS/desktop paths where tools and compatible devices exist. No public-store or deployment claims from localhost screens.
5. **Further scoped agents and connectors:** separately enabled capability by capability after credential, network, compliance and owner-approval gates. Vendor cost and private content exposure remain opt-in.

### Acceptance evidence

The first milestone is not "a good-looking agent dashboard." It is:

- A genuine request initiated by the authorized user.
- A raw and normalized captured transcript retained only per approved local memory policy.
- A source-aware response supported by the selected permitted notes or an explicit insufficient-evidence result.
- A verified speech adapter request/response and actual audio playback on the user's device.
- A sanitized audit record that distinguishes those completed subsystems from unverified model/agent dispatch.
- All relevant tests passing, with independent review and no modification to existing working services outside the planned integration points.

Only those milestones that are actually observed may be pronounced working. Everything else remains explicit design pending its own plan, review, and acceptance.

## 12. Rollback and privacy

Initial feature writes are new isolated files or minimal controlled changes to the local voice chain, with original paths backed up only in a designated private recovery location. An activation change records its stop/revert command and preserves existing Obsidian data and user applications. An unsuccessful bounded proof is logged as blocked, with no repeated activation loop.

Private voice, personal sources, contact materials, session artifacts, keys and account-specific configurations stay in approved local stores. The public Git branch carries schemas, sanitized configuration examples, tests, and documentation only. Device/app release, cloud API activation, external channels, migrations, production deployment, and commercial use are separate approvals.
