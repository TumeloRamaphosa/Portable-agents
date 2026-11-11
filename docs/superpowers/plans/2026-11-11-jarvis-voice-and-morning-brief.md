# Jarvis Voice and Morning Brief Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver one reviewable, user-initiated vertical slice that repairs the existing Mac VoiceBox/OpenJarvis caller, retrieves fresh authorized Obsidian evidence with native OpenJarvis storage, renders and optionally speaks a truthful source-linked morning brief, and proves one bounded real voice turn without starting a daemon or listener.

## Architecture

Public Hub code contains a dependency-free Python VoiceBox JSON-RPC client, native-OpenJarvis ingestion wrapper, deterministic briefing types/classifier, dry-run CLI, synthetic tests, and the existing read-only HTML Morning card. Private Mac-only work separately backs up and minimally repairs `/Users/tumeloramaphosa/second-brain/jarvis_pipe.sh`, creates local vault configuration after resolving the two roots, and records private diagnostics. The public repository never receives notes, absolute personal paths, contacts, credentials, transcripts, or runtime databases. No server, scheduler, wake word, Hammerspoon trigger, tunnel, Flutter application, dispatcher, or external connector is enabled.

The existing `mission-control/rwanda-ledger.html` remains the live ledger route. Its added Morning card loads an explicit, user-selected sanitized brief export; it does not invent agent activity. Existing black/gold tokens and the local round `agent-avatar.png` inform presentation; `Studex Factory Red.dc.html` and `Studex Factory copy.dc.html` inform channel/workspace and morning composition only. Copy the avatar as a public asset only after confirming it contains no private imagery. No mock agents, metrics, tasks, in-memory declarations, or automatic speech are copied.

The installed CLI supports `jarvis ask -m -e -t --max-tokens --json --no-stream --no-context -a --tools --profile --research --knowledge-db -i -S --persona`; screen access is forbidden. `--research` uses `KnowledgeStore`/`HybridSearch`, not `jarvis memory index`. Native `ObsidianConnector -> SyncEngine -> IngestionPipeline -> KnowledgeStore` supplies chunking, metadata, timestamps, URLs, and search. The first model proof is one direct, bounded CLI call after `jarvis model list` succeeds. The later research call uses the same explicit model and no tools beyond its internal knowledge search. VoiceBox is not launched automatically: after strict parser regression tests, the owner starts it and permits real `tools/list` discovery. No stop/cancel UI is shown unless that discovery proves support.

## Tech Stack

Python 3 standard library (`unittest`, `urllib`, `json`, `subprocess`, `argparse`, `dataclasses`) plus the already-installed OpenJarvis Python environment; no new packages. Bash minimally preserves the existing private hook contract. Node built-in `node:test`, semantic HTML/CSS, and browser ECMAScript modules test/render public-safe briefing JSON. Local Ollama is addressed only by installed OpenJarvis on its configured direct provider, never by a request to port 11435. All subprocesses have timeouts and no downloads/fallbacks.

### Task 1: Lock the baseline and define the public contracts with failing tests

**Files:** Create `jarvis_foundation/__init__.py`, `jarvis_foundation/voicebox.py`, `jarvis_foundation/briefing.py`, `tests/test_jarvis_voicebox.py`, `tests/test_jarvis_briefing.py`; Modify none of the existing runtime files.

- [ ] On Hub `/opt/studex/portable-agents`, confirm `git status --short --branch` is clean on `factory/rwanda-control-plane`; stop on unexpected changes. Run and retain `python3 -m unittest discover -s tests -v && node --test tests/rwanda_ledger.test.mjs`. Do not merge `b8f23b47330e0f3747d8150072258b27868bb751` or repair stale local `origin/main`.
- [ ] Add failing tests before implementation. Use exact synthetic values and assertions; never put real note excerpts in fixtures.

```python
# tests/test_jarvis_voicebox.py
import json
import unittest
from jarvis_foundation.voicebox import VoiceBoxError, VoiceBoxMCP, speech_request

class FakeTransport:
    def __init__(self, payload=None, error=None):
        self.payload, self.error, self.calls = payload, error, []
    def post(self, url, body, headers, timeout):
        self.calls.append((url, body, headers, timeout))
        if self.error: raise self.error
        return self.payload

class VoiceBoxTests(unittest.TestCase):
    def test_speech_request_has_exact_text_and_client(self):
        body = speech_request("Approved work is blocked.", request_id=7)
        self.assertEqual(body, {"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"voicebox.speak","arguments":{"text":"Approved work is blocked."}}})

    def test_acknowledged_speak_is_distinct_from_transport_success(self):
        transport = FakeTransport({"jsonrpc":"2.0","id":1,"result":{"ok":True}})
        result = VoiceBoxMCP(transport=transport).speak("hello", timeout=30)
        self.assertTrue(result.speak_result)
        self.assertEqual(result.reason, "acknowledged")
        self.assertEqual(transport.calls[0][0], "http://127.0.0.1:17493/mcp")
        self.assertEqual(transport.calls[0][2]["X-Voicebox-Client-Id"], "jarvis-pipe")
        self.assertEqual(transport.calls[0][3], 30)

    def test_jsonrpc_error_is_sanitized_and_not_success(self):
        transport = FakeTransport({"jsonrpc":"2.0","id":1,"error":{"message":"private upstream detail"}})
        result = VoiceBoxMCP(transport=transport).speak("hello")
        self.assertEqual((result.speak_result, result.reason), (False, "voicebox_error"))
        self.assertNotIn("private upstream detail", str(result))

    def test_malformed_and_network_results_are_generic(self):
        for payload, error, reason in [("not-json",None,"invalid_response"), (None,OSError("secret path"),"transport_error")]:
            result = VoiceBoxMCP(transport=FakeTransport(payload,error)).speak("hello")
            self.assertEqual((result.speak_result,result.reason),(False,reason))
            self.assertNotIn("secret path", result.reason)
```

```python
# tests/test_jarvis_briefing.py
import unittest
from jarvis_foundation.briefing import BriefingItem, compose_brief

class BriefingTests(unittest.TestCase):
    def test_states_and_proposal_are_not_receipts(self):
        items = [
            BriefingItem("verified","Synthetic release reviewed","Daily R/reviewed.md","2026-11-11T07:00:00Z","obsidian://synthetic/reviewed"),
            BriefingItem("proposed","Synthetic draft proposed","Daily R/proposed.md","2026-11-11T07:00:00Z","obsidian://synthetic/proposed"),
            BriefingItem("blocked","Synthetic provider unavailable","Daily R/blocked.md","2026-11-11T07:00:00Z","obsidian://synthetic/blocked"),
        ]
        brief = compose_brief(items, generated_at="2026-11-11T08:00:00Z")
        self.assertEqual([x["state"] for x in brief["items"]], ["verified","proposed","blocked"])
        self.assertEqual(brief["proposal"], "Review the cited proposed item; no action has been dispatched.")
        self.assertNotIn("approved", {x["state"] for x in brief["items"]})

    def test_empty_brief_admits_missing_evidence(self):
        brief = compose_brief([], generated_at="2026-11-11T08:00:00Z")
        self.assertEqual(brief["summary"], "No current supported briefing items were found.")
        self.assertEqual(brief["items"], [])
```

- [ ] Implement the complete VoiceBox adapter. The transport returns decoded JSON or raw text, bounds reply length before transport, never logs text or upstream errors, and treats any JSON-RPC `error` or missing `result` as not spoken. `speak_result` and `reason` are mandatory outputs.

```python
# jarvis_foundation/voicebox.py
from dataclasses import dataclass
import json
from urllib.request import Request, urlopen

class VoiceBoxError(Exception): pass

@dataclass(frozen=True)
class SpeakResult:
    speak_result: bool
    reason: str

class UrllibTransport:
    def post(self, url, body, headers, timeout):
        request = Request(url, data=json.dumps(body).encode("utf-8"), headers=headers, method="POST")
        with urlopen(request, timeout=timeout) as response:
            return response.read(65537).decode("utf-8")

def speech_request(reply: str, request_id: int = 1) -> dict:
    return {"jsonrpc":"2.0","id":request_id,"method":"tools/call","params":{"name":"voicebox.speak","arguments":{"text":reply}}}

class VoiceBoxMCP:
    def __init__(self, transport=None, url="http://127.0.0.1:17493/mcp"):
        self.transport, self.url = transport or UrllibTransport(), url
    def speak(self, reply: str, timeout: int = 20) -> SpeakResult:
        if not reply or len(reply) > 2000 or timeout not in (20,30): return SpeakResult(False,"invalid_request")
        headers = {"Content-Type":"application/json","Accept":"application/json","X-Voicebox-Client-Id":"jarvis-pipe"}
        try:
            raw = self.transport.post(self.url, speech_request(reply), headers, timeout)
            payload = json.loads(raw) if isinstance(raw,str) else raw
            if not isinstance(payload,dict) or payload.get("jsonrpc") != "2.0" or payload.get("id") != 1: return SpeakResult(False,"invalid_response")
            if "error" in payload: return SpeakResult(False,"voicebox_error")
            if "result" not in payload: return SpeakResult(False,"invalid_response")
            return SpeakResult(True,"acknowledged")
        except (OSError,ValueError,TypeError): return SpeakResult(False,"transport_error")
```

- [ ] Implement public-only `BriefingItem` and deterministic composition. `verified` means a reviewed receipt, `accepted` means accepted but incomplete, `reported` means submitted/unreviewed, `proposed` is only a proposal, and `blocked` is an observed blocker. Never map a report filename alone to completed work.

```python
# jarvis_foundation/briefing.py
from dataclasses import asdict, dataclass

@dataclass(frozen=True)
class BriefingItem:
    state: str
    text: str
    source: str
    observed_at: str
    source_url: str

def compose_brief(items, generated_at: str) -> dict:
    allowed = {"verified","accepted","reported","proposed","blocked"}
    if any(item.state not in allowed for item in items): raise ValueError("unsupported briefing state")
    selected = sorted(items, key=lambda item:(item.observed_at,item.source), reverse=True)[:3]
    return {"schema_version":1,"generated_at":generated_at,"summary":"No current supported briefing items were found." if not selected else "Source-linked items; review state is shown explicitly.","items":[asdict(item) for item in selected],"proposal":"Review the cited proposed item; no action has been dispatched." if any(x.state == "proposed" for x in selected) else "No next action is proposed without cited evidence."}
```

- [ ] Create an empty package docstring `"""Public-safe Jarvis foundation adapters."""` in `jarvis_foundation/__init__.py`. Run `python3 -m unittest discover -s tests -v && node --test tests/rwanda_ledger.test.mjs`; confirm all old 13 Python and 7 Node tests remain green. Commit `test: add Jarvis voice and briefing contracts` with the required co-author trailer.

### Task 2: Add native OpenJarvis vault discovery/ingestion and dry-run evidence tests

**Files:** Create `jarvis_foundation/knowledge.py`, `jarvis_foundation/cli.py`, `tests/test_jarvis_knowledge.py`, `examples/jarvis-vaults.example.json`; private Mac-only `~/.config/studex/jarvis-vaults.json`, `~/.openjarvis/jarvis-morning.db`, and `~/.openjarvis/jarvis-morning-sync.db` are never committed.

- [ ] Write failing tests for missing/relative roots, wrong vault IDs, hidden/secret-looking note exclusion before the native connector, deterministic redacted source metadata, and no model calls during dry-run. The public example contains placeholders, not actual paths:

```json
{"vaults":[{"id":"Obsidian Vault","root":"/PRIVATE/RESOLVE_LOCALLY"},{"id":"Obsidian Sandbox","root":"/PRIVATE/RESOLVE_LOCALLY"}]}
```

```python
# tests/test_jarvis_knowledge.py
import tempfile, unittest
from pathlib import Path
from jarvis_foundation.knowledge import discover_roots, permitted_documents

class KnowledgeTests(unittest.TestCase):
    def test_roots_require_exact_ids_and_existing_directories(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp); config = root/"vaults.json"
            config.write_text('{"vaults":[{"id":"Obsidian Vault","root":"'+tmp+'"}]}')
            self.assertEqual(discover_roots(config), {"Obsidian Vault":root})
            config.write_text('{"vaults":[{"id":"Wrong","root":"'+tmp+'"}]}')
            with self.assertRaises(ValueError): discover_roots(config)

    def test_hidden_and_secret_documents_never_reach_ingestion(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); (root/"Daily R").mkdir(); (root/".private").mkdir()
            (root/"Daily R"/"safe.md").write_text("# Synthetic\nstatus: proposed\nSynthetic planning note.")
            (root/".private"/"hidden.md").write_text("do not index")
            (root/"secret.md").write_text("api_key = not-a-real-secret")
            docs=list(permitted_documents(root))
            self.assertEqual([d.doc_id for d in docs], ["obsidian:Daily R/safe.md"])
```

- [ ] Implement `discover_roots`, secret screening, and native ingestion with no second vector database. Parent context stays in each chunk's source document metadata; use OpenJarvis's existing `SemanticChunker` through `IngestionPipeline`, and retrieve via `HybridSearch`/`KnowledgeStore`. Do not call `jarvis memory index`, which targets a different memory interface.

```python
# jarvis_foundation/knowledge.py
import json, re
from pathlib import Path
from openjarvis.connectors.obsidian import ObsidianConnector
from openjarvis.connectors.pipeline import IngestionPipeline
from openjarvis.connectors.store import KnowledgeStore
from openjarvis.connectors.sync_engine import SyncEngine

VAULT_IDS = {"Obsidian Vault","Obsidian Sandbox"}
SECRET = re.compile(r"(?i)(api[_-]?key|access[_-]?token|password|private[_-]?key|authorization\s*:)\s*[:=]")

def discover_roots(config_path):
    data=json.loads(Path(config_path).read_text(encoding="utf-8"))
    result={}
    for entry in data.get("vaults",[]):
        root=Path(entry.get("root","")).expanduser()
        if entry.get("id") not in VAULT_IDS or not root.is_absolute() or not root.is_dir(): raise ValueError("invalid vault configuration")
        result[entry["id"]]=root.resolve()
    if set(result) != VAULT_IDS: raise ValueError("both approved vaults are required")
    return result

def permitted_documents(root):
    for doc in ObsidianConnector(vault_path=str(root)).sync():
        if not SECRET.search(doc.content): yield doc

def ingest_roots(roots, knowledge_db, sync_db):
    store=KnowledgeStore(str(knowledge_db)); pipeline=IngestionPipeline(store); sync=SyncEngine(pipeline,state_db=str(sync_db)); counts={}
    try:
        for vault_id,root in sorted(roots.items()):
            connector=ObsidianConnector(vault_path=str(root))
            connector.sync=lambda root=root: permitted_documents(root)
            counts[vault_id]=sync.sync(connector)
        return counts
    finally: store.close()
```

- [ ] Implement an offline dry-run CLI which emits counts and state only, never document text. Add `python3 -m jarvis_foundation.cli validate --config PATH`; add `index` only for the explicit private configuration after review, and `search` must print titles/source URLs/timestamps only in the private terminal, never in committed artifacts.

```python
# jarvis_foundation/cli.py
import argparse,json
from pathlib import Path
from .knowledge import discover_roots,ingest_roots

def main(argv=None):
    parser=argparse.ArgumentParser(); sub=parser.add_subparsers(dest="command",required=True)
    for name in ("validate","index"):
        command=sub.add_parser(name); command.add_argument("--config",required=True)
        command.add_argument("--knowledge-db",default=str(Path.home()/".openjarvis/jarvis-morning.db"))
        command.add_argument("--sync-db",default=str(Path.home()/".openjarvis/jarvis-morning-sync.db"))
    args=parser.parse_args(argv); roots=discover_roots(args.config)
    print(json.dumps({"ok":True,"vault_ids":sorted(roots)} if args.command=="validate" else {"ok":True,"indexed":ingest_roots(roots,args.knowledge_db,args.sync_db)}))
if __name__ == "__main__": main()
```

- [ ] On the present owner's Mac only, run `obsidian vaults` and its available verbose/config introspection to resolve the second root; do not guess it. Populate mode-0600 private config and validate. If the second root cannot be established, record `blocked: vault root unresolved` and stop ingestion/model/voice steps; do not reduce scope to a mock. Verify the installed `jarvis deep-research-setup --obsidian-vault ... --skip-chat` is not used for two roots because the owned wrapper above is the explicit native multi-root adapter. Do not alter the existing persona: `--persona jarvis` resolves `~/.openjarvis/personas/jarvis/{SOUL,MEMORY,USER}.md`, whereas the observed `.openjarvis/prompts/personas/jarvis.md` is a different path. Use `--persona none` until a separately reviewed migration exists.
- [ ] Run all tests again, inspect `git diff` for personal data, and commit `feat: add native Jarvis vault ingestion` with the required co-author trailer.

### Task 3: Prove bounded inference privately, then repair the real existing voice caller

**Files:** Modify only private Mac `/Users/tumeloramaphosa/second-brain/jarvis_pipe.sh` after a timestamped backup in the owner's private recovery directory; Create public `jarvis_foundation/openjarvis.py`, `tests/test_jarvis_openjarvis.py`, and `examples/jarvis-morning-export.example.json`. Do not modify wake-word/Hammerspoon/launchd configuration.

- [ ] Test subprocess arguments, separate stderr, nonzero status, no truncation, no fallback, and one-call enforcement. The implementation returns text plus a bounded diagnostic record, never merges diagnostics into the reply.

```python
# jarvis_foundation/openjarvis.py
import json,subprocess

def bounded_ask(jarvis, model, query, knowledge_db=None, timeout=180):
    command=[jarvis,"ask","-m",model,"-e","ollama","-t","0","--max-tokens","256","--json","--no-stream","--no-context","-a","","--tools","","--persona","none",query]
    if knowledge_db:
        command=[jarvis,"ask","-m",model,"-e","ollama","-t","0","--max-tokens","512","--json","--no-stream","--no-context","--persona","none","--research","--knowledge-db",str(knowledge_db),query]
    try:
        run=subprocess.run(command,capture_output=True,text=True,timeout=timeout,check=False)
        payload=json.loads(run.stdout) if run.returncode==0 else {}
        answer=payload.get("answer") or payload.get("content") or ""
        return {"ok":bool(run.returncode==0 and answer),"answer":answer if run.returncode==0 else "","reason":"ok" if run.returncode==0 and answer else "model_unavailable"}
    except (subprocess.TimeoutExpired,json.JSONDecodeError,OSError): return {"ok":False,"answer":"","reason":"model_unavailable"}
```

- [ ] Add exact unit assertions using `unittest.mock.patch("subprocess.run")`: direct command includes every flag above; research command includes `--research --knowledge-db`; timeout is `180`; stderr fixture `"token=private"` is absent from both returned answer and reason; malformed JSON/nonzero/timeout return `model_unavailable`; no command contains `11435`, `--screen`, `pull`, or a fallback model.
- [ ] Run all public tests. Then, only on the Mac, run `~/OpenJarvis/.venv/bin/jarvis model list` once with an external 30-second timeout. If it does not return an installed Ollama model, stop and report network/provider blocked. Do not use direct `urllib /api/tags`, port 8790/11435, downloads, or another tunnel. Select a returned CPU-appropriate model explicitly and run exactly one `bounded_ask(..., "Reply with READY.", timeout=180)`; only a nonempty `ok` result unlocks research and voice proof.
- [ ] Back up the existing private script and first run new shell regression fixtures against its old behavior to demonstrate failure: multiline stderr must not enter stdout/TTS; nonzero model status must not speak; the exact multiline reply must reach `speech_request` without `tail -c`; curl/TTS failure must produce a nonzero or visible `tts_failed` diagnostic. Then minimally replace the model/TTS portion, preserving stdin/`VOICEBOX_TRANSCRIPT`, existing log destination, permissions, and caller path:

```bash
# Private jarvis_pipe.sh replacement segment; keep its existing transcript/env/log setup.
JARVIS_BIN="$HOME/OpenJarvis/.venv/bin/jarvis"
MODEL="${JARVIS_MODEL:?Set JARVIS_MODEL to a model returned by jarvis model list}"
STDERR_FILE=$(mktemp)
trap 'rm -f "$STDERR_FILE"' EXIT
set +e
REPLY=$("$JARVIS_BIN" ask -m "$MODEL" -e ollama -t 0 --max-tokens 256 \
  --json --no-stream --no-context -a '' --tools '' --persona none \
  "$TRANSCRIPT" 2>"$STDERR_FILE")
ASK_STATUS=$?
set -e
if [ "$ASK_STATUS" -ne 0 ]; then
  printf '%s\n' '[jarvis] model_unavailable' >&2
  exit "$ASK_STATUS"
fi
REPLY=$(printf '%s' "$REPLY" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("answer") or d.get("content") or "")')
[ -n "$REPLY" ] && [ "${#REPLY}" -le 2000 ] || { printf '%s\n' '[jarvis] invalid_model_reply' >&2; exit 1; }
printf '%s\n' "$REPLY"
export JARVIS_REPLY="$REPLY"
if ! python3 -c 'import os; from jarvis_foundation.voicebox import VoiceBoxMCP; r=VoiceBoxMCP().speak(os.environ["JARVIS_REPLY"], timeout=20); print("speak_result="+str(r.speak_result).lower()+" reason="+r.reason); raise SystemExit(0 if r.speak_result else 1)'; then
  printf '%s\n' '[jarvis] tts_failed' >&2
  exit 1
fi
```

- [ ] Keep the public Python import resolvable through a reviewed private `PYTHONPATH` or private installed copy without changing system Python or installing packages. Do not broaden pipe permissions or automatically source more credential files. Remove legacy Headroom fallback/orchestrator behavior only from this caller segment after the regression proof; do not edit other services. Emit a separate diagnostic JSON line containing timestamp, `model_status`, `speak_result`, `reason`, and session ID, without transcript, reply, environment, stderr, or sequential sleep polling.
- [ ] Run shell regressions and all Hub tests again. Commit only public adapter/tests as `fix: bound OpenJarvis voice requests` with the required co-author trailer; private Mac changes stay outside Git pending independent code review.

### Task 4: Build the truthful Morning card from an explicit sanitized export

**Files:** Create `mission-control/jarvis-brief.mjs`, `tests/jarvis_brief.test.mjs`, `mission-control/assets/agent-avatar.png` (copied only after local asset review); Modify `mission-control/rwanda-ledger.html`, `tests/rwanda_ledger.test.mjs`; private export is chosen by the user and is not committed.

- [ ] Write failing Node tests for schema/state/source validation, three-item cap, unsafe/missing URLs, empty state, no HTML sinks, and preservation of existing ledger behavior. Public fixture text must be explicitly synthetic with no business/agent-health numbers.

```javascript
// mission-control/jarvis-brief.mjs
const STATES = new Set(["verified","accepted","reported","proposed","blocked"]);
export function validateBrief(data) {
  const errors=[];
  if (!data || typeof data !== "object" || Array.isArray(data)) return ["brief: must be an object"];
  if (data.schema_version !== 1) errors.push("schema_version: must equal 1");
  if (typeof data.generated_at !== "string" || !data.generated_at.endsWith("Z")) errors.push("generated_at: must be UTC");
  if (typeof data.summary !== "string" || typeof data.proposal !== "string") errors.push("summary/proposal: required");
  if (!Array.isArray(data.items) || data.items.length > 3) errors.push("items: array of at most three required");
  else data.items.forEach((item,index) => {
    for (const key of ["state","text","source","observed_at","source_url"]) if (typeof item?.[key] !== "string" || !item[key]) errors.push(`items[${index}].${key}: required`);
    if (item && !STATES.has(item.state)) errors.push(`items[${index}].state: unsupported`);
    if (item && !item.source_url?.startsWith("obsidian://")) errors.push(`items[${index}].source_url: unsupported`);
  });
  return errors.sort();
}
export async function loadBrief(url, fetchImplementation=globalThis.fetch) {
  const response=await fetchImplementation(url,{cache:"no-store",headers:{Accept:"application/json"}});
  if (!response.ok) throw new Error("Brief unavailable");
  const data=await response.json(), errors=validateBrief(data);
  if (errors.length) throw new Error("Brief invalid");
  return data;
}
```

- [ ] Add Node assertions mirroring the Python states, a rejected fourth item and external URL, no-store request options, `No current supported briefing items were found.`, and no `innerHTML`, `localStorage`, autoplay, microphone, fake progress, or dispatch. Extend `tests/rwanda_ledger.test.mjs` to import `validateBrief/loadBrief` and retain all seven current tests unchanged.
- [ ] Add a separate Morning section to `rwanda-ledger.html` without replacing the ledger. Use existing black/gold tokens, a circular local avatar, workspace-like source grouping, a file input (no automatic fetch of private notes), disabled voice status, and DOM `textContent` only:

```html
<section id="morning" aria-labelledby="morning-heading">
  <img src="./assets/agent-avatar.png" alt="" width="72" height="72" style="border-radius:50%;border:1px solid var(--gold)">
  <h2 id="morning-heading">Morning brief</h2>
  <p id="voice-status">Voice not connected. No microphone or playback is active.</p>
  <label>Load a sanitized brief JSON export <input id="brief-file" type="file" accept="application/json"></label>
  <div id="brief-status" role="status">No brief loaded.</div>
  <p id="brief-summary"></p><div id="brief-items"></div><p id="brief-proposal"></p>
</section>
```

```javascript
// Append inside the existing module script after importing validateBrief.
import { validateBrief } from "./jarvis-brief.mjs";
document.querySelector("#brief-file").addEventListener("change", async event => {
  const target=event.target, status=document.querySelector("#brief-status");
  document.querySelector("#brief-items").replaceChildren();
  try {
    const brief=JSON.parse(await target.files[0].text()), errors=validateBrief(brief);
    if (errors.length) throw new Error("invalid");
    document.querySelector("#brief-summary").textContent=brief.summary;
    document.querySelector("#brief-proposal").textContent=brief.proposal;
    for (const item of brief.items) {
      const article=document.createElement("article"), heading=document.createElement("h3"), body=document.createElement("p"), source=document.createElement("p");
      heading.textContent=item.state; body.textContent=item.text; source.textContent=`${item.source} — observed ${item.observed_at}`;
      article.append(heading,body,source); document.querySelector("#brief-items").append(article);
    }
    status.textContent=`Loaded sanitized brief generated ${brief.generated_at}.`;
  } catch { status.textContent="Brief unavailable or invalid. Previous data is not shown."; }
});
```

- [ ] Keep `Not connected to agent execution`, ledger error clearing, and empty `jobs.json` unchanged. The Morning card must not read vault files directly or display `2nd Brain/Daily Operations Schedule.md` aspirations as facts. Missing scheduled check-ins are `missing/unverified`; only actual monitor evidence may say failed. `Daily R/Daily Routine Order.md` 07:00/07:30 inputs and human management slots remain untouched; no second scheduler is introduced.
- [ ] Run `python3 -m unittest discover -s tests -v && node --test tests/rwanda_ledger.test.mjs` and `node --test tests/jarvis_brief.test.mjs`. Commit `feat: render source-linked Jarvis morning brief` with the required co-author trailer.

### Task 5: User-present VoiceBox discovery and exactly one observed voice turn

**Files:** Create private sanitized diagnostic output only under the approved private Jarvis session directory; no public runtime evidence file unless independently redacted. No new public code is expected in this checkpoint.

- [ ] First rerun all regression tests. Display this checkpoint to the owner: **“Run in your terminal/open VoiceBox when you're present. Confirm microphone permission and keep other voice hooks disabled for this single test.”** Do not launch `/Applications/Voicebox.app`, start a listener, install `com.studex.wake-jarvis`, or activate the mic autonomously.
- [ ] Once the owner confirms VoiceBox is listening on `127.0.0.1:17493`, issue one bounded JSON-RPC `tools/list` request using the same `/mcp` transport and `X-Voicebox-Client-Id: jarvis-pipe`. Persist only tool names/schema versions privately. Require `voicebox.transcribe` and `voicebox.speak` plus their actual timeout contract (configured push-to-talk 20 or 30 seconds). If discovery fails, report `voicebox_unavailable`; no claim of voice support. Implement/show stop only if the returned schema explicitly supplies stop/cancel; otherwise version-contract the UI to no stop control.
- [ ] After the earlier single direct model proof succeeded and vault roots/index are valid, run one bounded research request for the exact harmless prompt **“Summarize today's approved work and blocked tasks in three sentences.”** using the selected catalog model, `--research --knowledge-db`, 180-second timeout, no images/screen, no fallback/download. If it fails, emit `model_unavailable` and stop without retry.
- [ ] The owner intentionally initiates one capture through the repaired existing path. Verify raw transcript, normalized prompt, selected sources/freshness, three-sentence response, `speak_result=true`, acknowledged TTS response, and actual audible playback. A JSON request or HTTP response alone is not audio proof. Keep playback and transcription diagnostics separate. Do not enable repeated generation, always-on listening, automatic morning speech, email, API calls, paid services, public exposure, Nostr, or agent dispatch.
- [ ] Independently review the full public diff plus private shell diff and observed diagnostics. Roll back only the private script from its backup if regression/voice behavior fails; do not revert unrelated configurations. Report unresolved network, model, root, permission, VoiceBox, or playback failures plainly.
- [ ] Run final `python3 -m unittest discover -s tests -v && node --test tests/rwanda_ledger.test.mjs` and `node --test tests/jarvis_brief.test.mjs`. Commit any review-driven public fixes separately, then request exactly: **“User explicit writes start approved foundation code”** before implementation begins if this plan is still only under review. After acceptance, request review before the eventual push; do not push automatically.

## Completion and excluded follow-ups

The slice is complete only with observed evidence for each completed subsystem and an explicit blocked state for the rest. Durable dispatch/approvals, Notion/email/Nostr, Hermes/OpenClaw adapters, scheduled briefs, wake words, public networking, business database writes, and Flutter at `apps/jarvis_app` require separate scoped specs/plans after this slice passes. Flutter is intentionally absent now; the safe HTML card tests the real local artifacts before reproducing the accepted interface on devices.
