# Jarvis Voice and Morning Brief Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement one testable, user-initiated slice: a repaired existing voice caller, fresh native OpenJarvis vault retrieval, a source-linked Morning export/card and private create-only audit, followed—only after bounded provider proof—by one observed voice turn.

## Architecture

The public Hub branch receives only Python/JavaScript modules, synthetic tests/examples, the existing read-only HTML Morning card, and this plan. Private Mac work separately backs up and minimally repairs `~/second-brain/jarvis_pipe.sh`, resolves vault roots into a mode-0600 config, uses the private `~/.openjarvis/knowledge-jarvis.db`, and writes create-only local audits. No note text, root, transcript, contact, credential, personal absolute path, runtime DB, or private log enters Git. Stage public files by explicit path, never `git add .`.

`mission-control/rwanda-ledger.html` remains the live ledger. Its Morning card uses black/gold, round-avatar, workspace/channel and morning-composition direction from `agent-avatar.png`, `Studex Factory Red.dc.html`, and `Studex Factory copy.dc.html`, after local asset review. Copy no mock agents, metrics, tasks, or automatic speech. `work/rwanda/jobs.json` and its public copy stay empty except separately evidenced real work; Morning export is a different artifact and does not fetch or mutate that ledger.

Installed facts driving this plan: `ask.py` research dispatch passes only query/model/DB/output (`ask.py:789-801`), so CLI `-t` and `--max-tokens` do not constrain research. `ResearchAgent` actually accepts `max_iterations=5`, `temperature=0.3`, `max_tokens=1500`, `num_ctx=16384` (`research_loop.py:479-496`). Use an owned direct invocation with explicit values, not misleading research CLI flags. `HybridSearch.search()` returns `SearchHit` objects with `content_snippet`, `title`, `timestamp`, `url`, `document_id`, and `chunk_idx`; no generic `contexts` envelope exists. `IngestionPipeline` skips a previously seen `doc_id`, while `KnowledgeStore` has `INSERT OR IGNORE` uniqueness on source/source_id/chunk and `delete(doc_id)`. The owned adapter below therefore namespaces stable document IDs, compares content hashes, and explicitly replaces changed documents instead of monkeypatching `SyncEngine`.

No daemon, listener, wake word, scheduler, tunnel, screen access, external connector, model download/fallback, Flutter app, or automatic agent call is enabled. Flutter `apps/jarvis_app` is a later separate spec/plan after this safe HTML/backend slice passes.

## Tech Stack

Python standard library plus the already-installed OpenJarvis environment; no new packages. Node `node:test`, semantic HTML/CSS and browser modules. Direct Ollama only through installed OpenJarvis; never port 11435/8790 or a new tunnel. Every external process has noninteractive stdin, a 180-second ceiling and owned-process-group cleanup.

### Task 1: Establish strict voice and briefing contracts with failing tests

**Files:** Create `jarvis_foundation/__init__.py`, `jarvis_foundation/voicebox.py`, `jarvis_foundation/briefing.py`, `tests/test_jarvis_voicebox.py`, `tests/test_jarvis_briefing.py`.

- [ ] On Hub `/opt/studex/portable-agents`, require clean `factory/rwanda-control-plane`; stop on unexpected changes. Run `python3 -m unittest discover -s tests -v && node --test tests/rwanda_ledger.test.mjs`. Do not merge reference commit `b8f23b47330e0f3747d8150072258b27868bb751` or alter stale `origin/main`.
- [ ] Add tests first for exact request bytes/options, acknowledged result, JSON-RPC error, malformed JSON/schema, timeout/HTTP/OS transport errors, and no secret propagation. `JSONDecodeError` and every schema mismatch must be exactly `invalid_response`; `HTTPError`, `URLError`, `TimeoutError`, and `OSError` must be exactly `transport_error`.

```python
# tests/test_jarvis_voicebox.py
import unittest
from urllib.error import HTTPError, URLError
from jarvis_foundation.voicebox import VoiceBoxMCP, speech_request

class FakeTransport:
    def __init__(self, value=None, error=None): self.value, self.error, self.calls = value, error, []
    def post(self, url, body, headers, timeout):
        self.calls.append((url, body, headers, timeout))
        if self.error: raise self.error
        return self.value

class VoiceBoxTests(unittest.TestCase):
    def test_request_and_acknowledgement(self):
        self.assertEqual(speech_request("Synthetic",7), {"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"voicebox.speak","arguments":{"text":"Synthetic"}}})
        transport=FakeTransport('{"jsonrpc":"2.0","id":1,"result":{"content":[]}}')
        result=VoiceBoxMCP(transport).speak("Synthetic",30)
        self.assertEqual((result.speak_result,result.reason),(True,"acknowledged"))
        url,body,headers,timeout=transport.calls[0]
        self.assertEqual((url,timeout),("http://127.0.0.1:17493/mcp",30))
        self.assertEqual(headers,{"Content-Type":"application/json","Accept":"application/json","X-Voicebox-Client-Id":"jarvis-pipe"})

    def test_jsonrpc_error_is_not_spoken_and_is_sanitized(self):
        result=VoiceBoxMCP(FakeTransport('{"jsonrpc":"2.0","id":1,"error":{"message":"token=private"}}')).speak("Synthetic")
        self.assertEqual((result.speak_result,result.reason),(False,"voicebox_error"))
        self.assertNotIn("private",str(result))

    def test_bad_json_and_schema_are_invalid_response(self):
        for raw in ('not-json','null','{"jsonrpc":"2.0","id":2,"result":{}}','{"jsonrpc":"2.0","id":1}'):
            result=VoiceBoxMCP(FakeTransport(raw)).speak("Synthetic")
            self.assertEqual((result.speak_result,result.reason),(False,"invalid_response"),raw)

    def test_transport_errors_are_transport_error(self):
        errors=[URLError("secret"),TimeoutError("secret"),OSError("secret"),HTTPError("http://localhost",500,"secret",{},None)]
        for error in errors:
            result=VoiceBoxMCP(FakeTransport(error=error)).speak("Synthetic")
            self.assertEqual((result.speak_result,result.reason),(False,"transport_error"))
```

```python
# jarvis_foundation/voicebox.py
from dataclasses import dataclass
import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

@dataclass(frozen=True)
class SpeakResult:
    speak_result: bool
    reason: str

class UrllibTransport:
    def post(self,url,body,headers,timeout):
        with urlopen(Request(url,data=json.dumps(body).encode(),headers=headers,method="POST"),timeout=timeout) as response:
            return response.read(65537).decode("utf-8")

def speech_request(reply: str, request_id: int=1) -> dict:
    return {"jsonrpc":"2.0","id":request_id,"method":"tools/call","params":{"name":"voicebox.speak","arguments":{"text":reply}}}

class VoiceBoxMCP:
    def __init__(self,transport=None,url="http://127.0.0.1:17493/mcp"): self.transport,self.url=transport or UrllibTransport(),url
    def speak(self,reply: str,timeout: int=20) -> SpeakResult:
        if not reply or len(reply)>2000 or timeout not in (20,30): return SpeakResult(False,"invalid_request")
        headers={"Content-Type":"application/json","Accept":"application/json","X-Voicebox-Client-Id":"jarvis-pipe"}
        try: raw=self.transport.post(self.url,speech_request(reply),headers,timeout)
        except (HTTPError,URLError,TimeoutError,OSError): return SpeakResult(False,"transport_error")
        try: payload=json.loads(raw) if isinstance(raw,(str,bytes)) else raw
        except (json.JSONDecodeError,UnicodeDecodeError): return SpeakResult(False,"invalid_response")
        if not isinstance(payload,dict) or payload.get("jsonrpc")!="2.0" or payload.get("id")!=1: return SpeakResult(False,"invalid_response")
        if "error" in payload: return SpeakResult(False,"voicebox_error")
        if "result" not in payload or not isinstance(payload["result"],dict): return SpeakResult(False,"invalid_response")
        return SpeakResult(True,"acknowledged")
```

- [ ] Add the shared `BriefingItem` interface and deterministic top-three composer. Model text is always prefixed `Model-generated claim: `; deterministic extraction uses source state and is not promoted to a receipt. Required states are `verified`, `accepted`, `reported`, `proposed`, `blocked`, and `missing`. Top-level `sources` repeats only the selected source references.

```python
# jarvis_foundation/briefing.py
from dataclasses import asdict,dataclass
from datetime import datetime,timezone

@dataclass(frozen=True)
class BriefingItem:
    state: str
    text: str
    source: str
    observed_at: str
    source_url: str

def utc_now(clock=None): return (clock or (lambda:datetime.now(timezone.utc)))().isoformat().replace("+00:00","Z")

def compose_brief(items,generated_at):
    allowed={"verified","accepted","reported","proposed","blocked","missing"}
    if any(x.state not in allowed for x in items): raise ValueError("unsupported briefing state")
    selected=sorted(items,key=lambda x:(x.observed_at,x.source),reverse=True)[:3]
    return {"schema_version":1,"generated_at":generated_at,"summary":"No current supported briefing items were found." if not selected else "Source-linked items; review state and model-generated claims are labelled.","items":[asdict(x) for x in selected],"sources":[{"source":x.source,"observed_at":x.observed_at,"source_url":x.source_url} for x in selected],"proposal":"Review cited proposed work; nothing has been dispatched." if any(x.state=="proposed" for x in selected) else "No next action is proposed without cited evidence."}

def model_items(payload,hits):
    if not isinstance(payload,dict) or not isinstance(payload.get("claims"),list): raise ValueError("invalid_response")
    by_ref={str(i):hit for i,hit in enumerate(hits,1)}; items=[]
    for claim in payload["claims"][:3]:
        if not isinstance(claim,dict) or claim.get("state") not in {"verified","accepted","reported","proposed","blocked","missing"}: raise ValueError("invalid_response")
        ref=str(claim.get("citation")); text=claim.get("text")
        if ref not in by_ref or not isinstance(text,str) or not text.strip(): raise ValueError("invalid_response")
        hit=by_ref[ref]; items.append(BriefingItem(claim["state"],"Model-generated claim: "+text.strip(),f"{hit.source}:{hit.title} [{hit.document_id}#{hit.chunk_idx}]",hit.timestamp,hit.url))
    return items
```

- [ ] Test empty compose, three-item limit, unsupported states, model citation rejection, and that a proposed synthetic item never becomes verified. Add package docstring `"""Public-safe Jarvis foundation adapters."""`; rerun the exact baseline command and commit only these paths as `test: add Jarvis voice and briefing contracts` with the co-author trailer.

### Task 2: Resolve private roots and implement collision-safe native reindexing

**Files:** Create `jarvis_foundation/knowledge.py`, `tests/test_jarvis_knowledge.py`; private mode-0600 `~/.config/studex/jarvis-vaults.json` and private DB/sync state only. Do not create a public example containing root values.

- [ ] Test config mode `0o600`, both exact IDs, absolute existing roots, owner read access, secret screening, and connector reads. On the Mac, obtain supported path output with `obsidian vaults verbose` (fall back to the application's own config only if that installed command errors). Expand paths using Python `os.path.expanduser`, write the private config atomically with mode 0600, and require both roots. The sandbox CLI file total is not proof that its filesystem is absent: after resolving it, directly instantiate the connector and read a bounded document count. Stop with `blocked: vault root unresolved/unreadable` rather than guessing.

```python
# jarvis_foundation/knowledge.py
import hashlib,json,os,re,stat
from dataclasses import replace
from datetime import datetime,timezone
from pathlib import Path
from openjarvis.connectors.obsidian import ObsidianConnector
from openjarvis.connectors.pipeline import IngestionPipeline
from openjarvis.connectors.store import KnowledgeStore
from openjarvis.connectors.hybrid_search import HybridSearch

VAULT_IDS={"Obsidian Vault","Obsidian Sandbox"}
SECRET=re.compile(r"(?i)(api[_-]?key|access[_-]?token|password|private[_-]?key|authorization\s*:)\s*[:=]")
MAX_DOCS=20000; MAX_TOTAL_BYTES=200_000_000; MAX_NOTE_BYTES=2_000_000

def discover_roots(config_path):
    path=Path(config_path).expanduser(); mode=stat.S_IMODE(path.stat().st_mode)
    if mode!=0o600: raise ValueError("config permissions must be 0600")
    data=json.loads(path.read_text()); roots={}
    for entry in data.get("vaults",[]):
        root=Path(os.path.expanduser(entry.get("root","")))
        if entry.get("id") not in VAULT_IDS or not root.is_absolute() or not root.is_dir() or not os.access(root,os.R_OK): raise ValueError("invalid vault configuration")
        roots[entry["id"]]=root.resolve()
    if set(roots)!=VAULT_IDS: raise ValueError("both approved vaults are required")
    return roots

def namespaced_documents(vault_id,root):
    namespace="obsidian-vault" if vault_id=="Obsidian Vault" else "obsidian-sandbox"
    connector=ObsidianConnector(vault_path=str(root)); total=0
    for count,doc in enumerate(connector.sync(),1):
        if count>MAX_DOCS: raise ValueError("document budget exceeded")
        size=len(doc.content.encode("utf-8")); total+=size
        if size>MAX_NOTE_BYTES or total>MAX_TOTAL_BYTES: raise ValueError("content budget exceeded")
        if SECRET.search(doc.content): continue
        relative=doc.doc_id.removeprefix("obsidian:")
        yield replace(doc,doc_id=f"obsidian:{namespace}:{relative}",source=namespace,source_id=f"{namespace}:{relative}",metadata={**doc.metadata,"vault_id":vault_id,"relative_path":relative})

def ingest_roots(roots,db_path):
    store=KnowledgeStore(str(db_path)); counts={}
    store._conn.execute("CREATE TABLE IF NOT EXISTS jarvis_documents(doc_id TEXT PRIMARY KEY, vault_id TEXT NOT NULL, content_sha256 TEXT NOT NULL, synced_at TEXT NOT NULL)")
    store._conn.commit()
    try:
        for vault_id,root in sorted(roots.items()):
            current=set(); changed=0
            for doc in namespaced_documents(vault_id,root):
                current.add(doc.doc_id); digest=hashlib.sha256(doc.content.encode()).hexdigest()
                old=store._conn.execute("SELECT content_sha256 FROM jarvis_documents WHERE doc_id=?",(doc.doc_id,)).fetchone()
                if old and old[0]==digest: continue
                store.delete(doc.doc_id)  # native delete removes stale chunks and FTS rows
                IngestionPipeline(store,max_tokens=512).ingest([doc])  # fresh seen-ID cache after replacement
                store._conn.execute("INSERT OR REPLACE INTO jarvis_documents VALUES(?,?,?,?)",(doc.doc_id,vault_id,digest,datetime.now(timezone.utc).isoformat())); store._conn.commit(); changed+=1
            stale=[r[0] for r in store._conn.execute("SELECT doc_id FROM jarvis_documents WHERE vault_id=?",(vault_id,))]
            for doc_id in set(stale)-current:
                store.delete(doc_id); store._conn.execute("DELETE FROM jarvis_documents WHERE doc_id=?",(doc_id,)); store._conn.commit()
            counts[vault_id]=changed
        return counts
    finally: store.close()

def retrieve_passages(db_path,query,limit=12):
    if not 1<=limit<=12: raise ValueError("retrieval budget exceeded")
    store=KnowledgeStore(str(db_path))
    try: return HybridSearch(store,embedder=None).search(query,sources=["obsidian-vault","obsidian-sandbox"],limit=limit)
    finally: store.close()
```

- [ ] Add exact tests with two temporary roots and same `Daily R/status.md`: assert distinct `obsidian-vault`/`obsidian-sandbox` doc/source IDs and both hits. Ingest, rewrite one file with different content and a deliberately newer `os.utime` mtime, reingest, and assert old synthetic text is absent, new text is returned, and only that doc changed. Delete one file and assert stale chunks disappear. Assert unchanged second ingestion stores zero and `MAX_DOCS`, `MAX_TOTAL_BYTES`, `MAX_NOTE_BYTES` are enforced. Use fresh `IngestionPipeline` per changed doc because its seen-ID cache otherwise suppresses replacement; this explicit all-current-scan plus content hash is the safe strategy, not mtime-only `SyncEngine` checkpoints. Each `jarvis_documents` row is the per-vault checkpoint; no shared `obsidian` checkpoint or lambda exists.
- [ ] Run all existing tests, inspect `git diff --check` and the diff for private values, then commit explicit public paths as `feat: add collision-safe Jarvis vault ingestion` with the co-author trailer.

### Task 3: Implement bounded direct/research calls and the retrieval-to-export workflow

**Files:** Create `jarvis_foundation/openjarvis.py`, `jarvis_foundation/audit.py`, `jarvis_foundation/cli.py`, `tests/test_jarvis_openjarvis.py`, `tests/test_jarvis_audit.py`, `tests/test_jarvis_cli.py`, `examples/jarvis-morning-export.example.json`.

- [ ] Direct model proof retains the verified CLI flags. Research is an owned direct `ResearchAgent` worker with effective hard limits `max_iterations=5`, `temperature=0`, `max_tokens=512`, `num_ctx=8192`, `clarify_handler` returning an explicit clarification result rather than reading stdin. The outer parent owns a new process group and kills only that group on timeout; never kill Ollama or unrelated apps. No persistent process is started.

```python
# jarvis_foundation/openjarvis.py
import json,os,signal,subprocess,sys

def direct_command(jarvis,model,query):
    return [jarvis,"ask","-m",model,"-e","ollama","-t","0","--max-tokens","256","--json","--no-stream","--no-context","-a","","--tools","","--persona","none",query]

def run_owned(command,timeout=180):
    process=subprocess.Popen(command,stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,start_new_session=True)
    try: stdout,stderr=process.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        os.killpg(process.pid,signal.SIGTERM)
        try: process.communicate(timeout=5)
        except subprocess.TimeoutExpired: os.killpg(process.pid,signal.SIGKILL); process.communicate()
        return {"ok":False,"answer":"","reason":"model_unavailable"}
    if process.returncode: return {"ok":False,"answer":"","reason":"model_unavailable"}
    try: payload=json.loads(stdout)
    except json.JSONDecodeError: return {"ok":False,"answer":"","reason":"invalid_response"}
    answer=payload.get("answer") or payload.get("content") or ""
    return {"ok":bool(answer),"answer":answer,"reason":"ok" if answer else "invalid_response"}

def bounded_direct(jarvis,model,query): return run_owned(direct_command(jarvis,model,query))
def bounded_research(model,query,db_path): return run_owned([sys.executable,"-m","jarvis_foundation.cli","research-worker","--model",model,"--knowledge-db",str(db_path),"--query",query])

def research_worker(model,query,db_path):
    from openjarvis.agents.research_loop import ResearchAgent
    from openjarvis.connectors.hybrid_search import HybridSearch
    from openjarvis.connectors.store import KnowledgeStore
    from openjarvis.engine.ollama import OllamaEngine
    store=KnowledgeStore(db_path)
    try:
        agent=ResearchAgent(engine=OllamaEngine(),search=HybridSearch(store,embedder=None),model=model,max_iterations=5,temperature=0,max_tokens=512,num_ctx=8192,clarify_handler=lambda question:"CLARIFICATION_REQUIRED: "+question)
        result=agent.run(query); return {"answer":result.answer,"iterations":result.iterations,"tool_calls":len(result.tool_calls)}
    finally: store.close()
```

- [ ] Unit-test `direct_command` exactly; research must use the owned worker and contain no ignored `-t`/`--max-tokens` CLI flags. Patch `ResearchAgent` in a worker test and assert constructor kwargs above, five-search ceiling from the installed constructor, BM25-only retrieval, and store closure. Patch `subprocess.Popen` to assert `stdin=DEVNULL`, `start_new_session=True`, timeout 180, and `os.killpg(process.pid, SIGTERM)` only for that child; test SIGKILL escalation. Add an installed-source precondition test using `inspect.signature(ResearchAgent.__init__)` to assert parameters/defaults `max_iterations == 5`; fail closed with `interface_changed` rather than silently assuming future behavior. Test JSON errors as `invalid_response`, process failures/timeouts as `model_unavailable`, and never return captured stderr/stdout on failure.

- [ ] Implement exact retrieval/export conversion. The private query must include the actual local calendar date and source-state instruction, for example `For 2026-11-11, distinguish reviewed receipts, accepted work, unreviewed reports, proposals, blockers and missing check-ins. Input docs=%storedschema; cite only supplied [N] passages.` Here `%storedschema` is the literal envelope key replaced with the selected hit fields (`ref`, `title`, `content_snippet`, `timestamp`, `document_id`, `chunk_idx`, `url`), not a nonexistent API. Do not infer today's date from an old report. Export can run in deterministic source-extraction mode (`--mode source`) or model mode (`--mode model`); model output must be JSON claims with citations and passes through `model_items`.

```python
# Add to jarvis_foundation/knowledge.py
from .briefing import BriefingItem,compose_brief,model_items,utc_now

def retrieval_envelope(hits,local_date):
    docs=[{"ref":i,"title":h.title,"content_snippet":h.content_snippet,"timestamp":h.timestamp,"document_id":h.document_id,"chunk_idx":h.chunk_idx,"url":h.url} for i,h in enumerate(hits,1)]
    return f"For {local_date}, distinguish reviewed receipts, accepted work, unreviewed reports, proposals, blockers and missing check-ins. Input docs=%storedschema; cite only supplied [N] passages.\n%storedschema="+json.dumps(docs)

def source_items(hits):
    items=[]
    for hit in hits:
        snippet=hit.content_snippet.strip()
        lowered=snippet.lower()
        state="blocked" if "blocked:" in lowered else "proposed" if "proposed:" in lowered else "missing" if "missing:" in lowered else "accepted" if "accepted:" in lowered else "verified" if "verified:" in lowered else "reported"
        items.append(BriefingItem(state,snippet,f"{hit.source}:{hit.title} [{hit.document_id}#{hit.chunk_idx}]",hit.timestamp,hit.url))
    return items

def export_brief(db_path,query,local_date,mode="source",model_answer=None,clock=None):
    hits=retrieve_passages(db_path,query)
    if mode=="source": items=source_items(hits)
    elif mode=="model":
        if model_answer is None: raise ValueError("model answer required")
        items=model_items(json.loads(model_answer),hits)
    else: raise ValueError("unsupported mode")
    return compose_brief(items,utc_now(clock))
```

- [ ] Test source prefixes `verified:`, `accepted:`, `proposed:`, `blocked:`, `missing:` and default `reported`; same text cannot become completed merely because it is in `Daily R`. Test retrieval envelope uses actual `SearchHit` attributes and the supplied date, model claims cite only selected hits, malformed claims/JSON return `invalid_response` through CLI, generated time uses the injected clock exactly once, and top-level `sources` matches selected items. Model text stays labelled on cards and in speech.

- [ ] Implement create-only audit with all path checks before opening. Root comes only from validated private config `Obsidian Vault`, never CLI raw root or public data. `request_id` is restricted and final path must be new, non-symlink, relative to the resolved approved session directory and outer root. Use `os.open(..., O_CREAT|O_EXCL|O_WRONLY|O_NOFOLLOW,0o600)`; never append or overwrite another agent's file.

```python
# jarvis_foundation/audit.py
import json,os,re
from pathlib import Path

def write_audit(vault_root,record):
    required={"request_id","started_at","finished_at","sources","outcome","tools","evidence_reconciliation"}
    if set(record)!=required or not re.fullmatch(r"[A-Za-z0-9_-]{1,80}",record["request_id"]): raise ValueError("invalid audit")
    if record["outcome"] not in {"grounded","model_failure","voice_failed","voice_succeeded"} or not isinstance(record["sources"],list) or len(record["sources"])>12: raise ValueError("invalid audit")
    if any(set(x)!={"title","url"} or not isinstance(x["title"],str) or not isinstance(x["url"],str) for x in record["sources"]): raise ValueError("invalid audit sources")
    if not isinstance(record["tools"],list) or any(x not in {"obsidian_search","voicebox.transcribe","voicebox.speak"} for x in record["tools"]): raise ValueError("invalid tools")
    root=Path(vault_root).resolve(); candidate=root/"2nd Brain"/"Agents"/"Sessions"/"JARVIS"
    current=root
    for part in ("2nd Brain","Agents","Sessions","JARVIS"):
        current=current/part
        if current.is_symlink(): raise ValueError("unsafe audit parent")
    base.mkdir(parents=True,exist_ok=True,mode=0o700); base=candidate.resolve()
    if not base.is_relative_to(root): raise ValueError("unsafe audit parent")
    target=base/(record["request_id"]+".json")
    if target.exists() or target.is_symlink() or not target.resolve().is_relative_to(base): raise ValueError("audit exists or unsafe")
    flags=os.O_CREAT|os.O_EXCL|os.O_WRONLY|getattr(os,"O_NOFOLLOW",0)
    descriptor=os.open(target,flags,0o600)
    with os.fdopen(descriptor,"w",encoding="utf-8") as stream: json.dump(record,stream,ensure_ascii=False); stream.write("\n")
    return target
```

- [ ] Tests use synthetic IDs/titles/URLs only and assert second write, `../`, symlink parent/target, extra/missing fields, unsupported tool/outcome, and over-12 sources are refused without modifying an existing sentinel file. `evidence_reconciliation` is a bounded object/string distinguishing retrieved passages, model claims, TTS acknowledgement and human audible confirmation. Whole transcripts/replies and public raw logs are prohibited.

- [ ] Implement exactly `validate`, `index`, `search`, `export`, and internal `research-worker`. Search/export print private content only to the owner's terminal/file; public dry-run tests use synthetic DBs. No defaults point to public raw files. `validate` emits IDs only. `search --query` emits actual hit fields. `export --output` uses create-exclusive mode 0600; model mode reads a bounded model result and audits outcomes separately.

```python
# jarvis_foundation/cli.py
import argparse,json,os
from pathlib import Path
from .knowledge import discover_roots,ingest_roots,retrieve_passages,export_brief
from .openjarvis import research_worker

def create_json(path,payload):
    descriptor=os.open(Path(path).expanduser(),os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
    with os.fdopen(descriptor,"w") as stream: json.dump(payload,stream,ensure_ascii=False); stream.write("\n")

def main(argv=None):
    parser=argparse.ArgumentParser(); sub=parser.add_subparsers(dest="command",required=True)
    for name in ("validate","index"):
        p=sub.add_parser(name); p.add_argument("--config",default="~/.config/studex/jarvis-vaults.json")
    index_parser=sub.choices["index"]; index_parser.add_argument("--knowledge-db",default="~/.openjarvis/knowledge-jarvis.db")
    p=sub.add_parser("search"); p.add_argument("--knowledge-db",default="~/.openjarvis/knowledge-jarvis.db"); p.add_argument("--query",required=True)
    p=sub.add_parser("export"); p.add_argument("--knowledge-db",default="~/.openjarvis/knowledge-jarvis.db"); p.add_argument("--query",required=True); p.add_argument("--local-date",required=True); p.add_argument("--mode",choices=("source","model"),default="source"); p.add_argument("--model-answer"); p.add_argument("--output",required=True)
    p=sub.add_parser("research-worker"); p.add_argument("--model",required=True); p.add_argument("--knowledge-db",required=True); p.add_argument("--query",required=True)
    args=parser.parse_args(argv); db=str(Path(args.knowledge_db).expanduser()) if hasattr(args,"knowledge_db") else None
    if args.command in ("validate","index"):
        roots=discover_roots(args.config)
        payload={"ok":True,"vault_ids":sorted(roots)} if args.command=="validate" else {"ok":True,"changed":ingest_roots(roots,db)}
        print(json.dumps(payload)); return
    if args.command=="search":
        hits=retrieve_passages(db,args.query); print(json.dumps([{"title":h.title,"content_snippet":h.content_snippet,"timestamp":h.timestamp,"document_id":h.document_id,"chunk_idx":h.chunk_idx,"url":h.url} for h in hits])); return
    if args.command=="export":
        answer=Path(args.model_answer).read_text() if args.model_answer else None
        create_json(args.output,export_brief(db,args.query,args.local_date,args.mode,answer)); return
    print(json.dumps(research_worker(args.model,args.query,db)))
if __name__=="__main__": main()
```

- [ ] Run all tests; commit explicit public paths as `feat: add grounded Jarvis morning export` with the co-author trailer. Private research/export commands run only after Task 5's one direct provider proof.

### Task 4: Repair the real caller only after regression proof

**Files:** Modify private `~/second-brain/jarvis_pipe.sh` after timestamped private backup; no public shell replacement, wake/Hammerspoon/launchd files, or pipe permission changes.

- [ ] Using `os.path.expanduser("~/second-brain/jarvis_pipe.sh")`, preserve the existing stdin/`VOICEBOX_TRANSCRIPT` hook and log ownership. Back up privately. Demonstrate failing regressions on the original: merged stderr enters reply, nonzero model can speak, `tail -c` truncates, unexported `REPLY` empties TTS text, and fire-and-forget curl hides failure.
- [ ] Replace only its model/TTS segment. Call `bounded_direct` with `JARVIS_MODEL` selected from `jarvis model list`; capture diagnostics separately, never merge stderr into the answer, never truncate, export exact reply to `VoiceBoxMCP.speak(...,timeout=20)`, and return visible `tts_failed` unless `speak_result=true`. Print model reply to stdout only on successful bounded parsing; never print stderr, environment, config, or secrets. Keep old Headroom fallback/orchestrator disabled in this caller only; do not modify other services. Emit separate private diagnostic fields `session_id`, timestamp, `model_status`, `speak_result`, `reason`, without raw transcript/reply or sleep polling.
- [ ] Use `--persona none`: installed resolution is `~/.openjarvis/personas/<name>/{SOUL,MEMORY,USER}.md`, not the existing different prompts path. Do not migrate persona in this slice. Run shell regression fixtures and the exact Hub test command after the private change; commit any public adapter correction separately with explicit paths.

### Task 5: Add stale-safe Morning UI and complete integration tests

**Files:** Create `mission-control/jarvis-brief.mjs`, `mission-control/assets/agent-avatar.png` after asset review; Modify `mission-control/rwanda-ledger.html`, `tests/rwanda_ledger.test.mjs`.

- [ ] First add failing valid-then-malformed DOM tests (using a small injectable renderer and fake elements, no new DOM package): after valid render, malformed JSON/schema must clear `#brief-summary`, `#brief-items`, `#brief-proposal`, and item children, and set visible error. Test unsupported URL/state/fourth item and all missing fields. No `innerHTML`, external HTML injection, autoplay, fake progress, or storage.

```javascript
// mission-control/jarvis-brief.mjs
const STATES=new Set(["verified","accepted","reported","proposed","blocked","missing"]);
const FIELDS=["state","text","source","observed_at","source_url"];
export function validateBrief(data){
  const errors=[];
  if(!data||typeof data!=="object"||Array.isArray(data))return["brief: must be an object"];
  if(data.schema_version!==1)errors.push("schema_version: must equal 1");
  if(typeof data.generated_at!=="string"||!data.generated_at.endsWith("Z"))errors.push("generated_at: must be UTC");
  if(typeof data.summary!=="string"||typeof data.proposal!=="string")errors.push("summary/proposal: required");
  if(!Array.isArray(data.sources))errors.push("sources: array required");
  if(!Array.isArray(data.items)||data.items.length>3)errors.push("items: array of at most three required");
  else data.items.forEach((item,index)=>{
    if(!item||typeof item!=="object"||Array.isArray(item)){errors.push(`items[${index}]: object required`);return;}
    for(const key of FIELDS)if(typeof item[key]!=="string"||!item[key].trim())errors.push(`items[${index}].${key}: required`);
    if(!STATES.has(item.state))errors.push(`items[${index}].state: unsupported`);
    if(!item.source_url?.startsWith("obsidian://"))errors.push(`items[${index}].source_url: unsupported`);
    if(!/^obsidian-(vault|sandbox):/.test(item.source))errors.push(`items[${index}].source: namespace required in source reference`);
  });
  return errors.sort();
}
export function clearBrief(document){
  document.querySelector("#brief-summary").textContent="";
  document.querySelector("#brief-items").replaceChildren();
  document.querySelector("#brief-proposal").textContent="";
}
export function renderBrief(document,brief){
  clearBrief(document);
  document.querySelector("#brief-summary").textContent=brief.summary;
  document.querySelector("#brief-proposal").textContent=brief.proposal;
  for(const item of brief.items){
    const article=document.createElement("article"),heading=document.createElement("h3"),body=document.createElement("p"),source=document.createElement("p");
    heading.textContent=item.state;body.textContent=item.text;source.textContent=`${item.source} — observed ${item.observed_at}`;article.append(heading,body,source);document.querySelector("#brief-items").append(article);
  }
}
```

- [ ] Note the renderer expects `source` to include the namespaced `document_id`, as produced by `source_items/model_items`; do not weaken validation to accept ambiguous references. Add this HTML section, preserving existing ledger nodes/logic:

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
// Add at module top level in rwanda-ledger.html.
import {clearBrief,renderBrief,validateBrief} from "./jarvis-brief.mjs";
document.querySelector("#brief-file").addEventListener("change",async event=>{
  const status=document.querySelector("#brief-status"); clearBrief(document);
  try{
    if(!event.target.files[0])throw new Error("missing");
    const brief=JSON.parse(await event.target.files[0].text());
    if(validateBrief(brief).length)throw new Error("invalid");
    renderBrief(document,brief);status.textContent=`Loaded sanitized brief generated ${brief.generated_at}.`;
  }catch{clearBrief(document);status.textContent="Brief unavailable or invalid. Previous data is not shown.";}
});
```

- [ ] Preserve all seven existing Node tests and `Not connected to agent execution`. No file input reads the vault directly. Missing check-ins stay `missing`, not failed heartbeat. Do not change 07:00/07:30 reports, management slots, or existing automation. Old operations/revenue/project claims never become current facts. Run `python3 -m unittest discover -s tests -v && node --test tests/rwanda_ledger.test.mjs` after every change step; commit explicit files as `feat: render source-linked Jarvis morning brief` with co-author trailer.

### Task 6: Private preflight, one voice turn, audits, and review

**Files:** Private config/DB/export/audit/diagnostics only; public changes only for independently reviewed fixes.

- [ ] Rerun all regressions. Run `~/OpenJarvis/.venv/bin/jarvis model list` once under 30 seconds. If no installed model returns, report provider/network blocked and stop. Choose a returned CPU-appropriate model and make exactly one `bounded_direct(...,"Reply with READY.")` call at 180 seconds; no download/fallback/retry. Only success unlocks one research request.
- [ ] Validate both private roots, directly read each connector, index, retrieve today's evidence, export a source brief and inspect citations/freshness. For model-card mode, pass `retrieval_envelope(hits, local_date)` from the exact selected hits to one `bounded_direct` call and require its cited JSON claims; never relabel independent research citations as those hit references. Separately, call `bounded_research` once with the exact harmless prompt **“Summarize today's approved work and blocked tasks in three sentences.”** Its effective limits are five searches/tool iterations, zero temperature, 512 output tokens, 8192 context, 180-second process-group timeout—not ignored CLI generation flags. On failure emit `model_failure` audit and stop.
- [ ] Display: **“Run in your terminal/open VoiceBox when you're present. Confirm microphone permission and keep other voice hooks disabled for this single test.”** Do not launch it autonomously. After owner confirmation, make one bounded `tools/list` JSON-RPC request to `/mcp` with `X-Voicebox-Client-Id: jarvis-pipe`. Require actual `voicebox.transcribe` and `voicebox.speak` schemas and configured 20/30-second push-to-talk timeout. No stop/cancel control unless discovery explicitly supports it.
- [ ] Owner initiates one capture through the repaired existing path. Verify transcript normalization, selected sources, response labels/citations, strict TTS acknowledgement (`speak_result=true`) and actual audible playback. HTTP/JSON alone is not playback proof. Record create-only audit fields `request_id`, `started_at`, `finished_at`, bounded private `sources` title/URL, `outcome` (`grounded`, `model_failure`, `voice_failed`, `voice_succeeded`), allowed `tools`, and `evidence_reconciliation`; keep full transcript/reply out of public tests/logs. No repeated voice generation or always-on listening.
- [ ] Independently review public and private diffs plus observed diagnostics; roll back only the private caller from backup on failure. Run final `python3 -m unittest discover -s tests -v && node --test tests/rwanda_ledger.test.mjs`, `git diff --check`, and explicit placeholder/private-data scan. Request exactly **“User explicit writes start approved foundation code”** before implementation if still in review. Do not push automatically.

## Excluded follow-ups

Durable dispatch/approvals, Notion/email/Nostr, Hermes/OpenClaw, scheduled briefs, wake words, public networking, canonical business writes, and Flutter require separate scoped plans after this slice passes. Report blocked provider, root, VoiceBox, permission, retrieval, or playback states truthfully rather than simulating success.
