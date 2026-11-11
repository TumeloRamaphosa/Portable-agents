#!/usr/bin/env python3
"""
Studex rooms gateway (FastMCP).

Receives reports from the relay on every computer, places each agent in its
company room, and serves the rooms three ways:

  GET  /rooms          JSON for the web rooms page and the Obsidian plugin
  GET  /               the web rooms page
  POST /relay/report   relays push here (one token per computer)
  /mcp                 MCP tools for agents: rooms_list, room_get, agent_find

Environment:
  STUDEX_RELAY_TOKENS  "meat-desk:<token>,markets-desk:<token>,..."  (required)
  STUDEX_VIEW_TOKEN    optional; when set, /rooms and / need ?key=<token>
                       or "Authorization: Bearer <token>"
  STUDEX_ROOMS_FILE    default ../rooms.json
  STUDEX_DB            default ./rooms.sqlite3
  PORT                 default 8787
"""
import hmac
import json
import os
import sqlite3
import threading
import time
from pathlib import Path

from fastmcp import FastMCP
from starlette.requests import Request
from starlette.responses import FileResponse, JSONResponse, PlainTextResponse

HERE = Path(__file__).resolve().parent
ROOMS_FILE = Path(os.environ.get("STUDEX_ROOMS_FILE", HERE.parent / "rooms.json"))
WEB_PAGE = HERE.parent / "web" / "index.html"
DB_PATH = os.environ.get("STUDEX_DB", str(HERE / "rooms.sqlite3"))
STATUSES = ("working", "blocked", "idle", "done", "unknown")


def parse_tokens(raw):
    out = {}
    for part in (raw or "").split(","):
        if ":" in part:
            cid, tok = part.split(":", 1)
            if cid.strip() and tok.strip():
                out[cid.strip()] = tok.strip()
    return out


RELAY_TOKENS = parse_tokens(os.environ.get("STUDEX_RELAY_TOKENS"))
VIEW_TOKEN = os.environ.get("STUDEX_VIEW_TOKEN", "")

# ------------------------------------------------------------------ store ----

_lock = threading.Lock()
_db = sqlite3.connect(DB_PATH, check_same_thread=False)
_db.executescript("""
CREATE TABLE IF NOT EXISTS computers (
  id TEXT PRIMARY KEY, hostname TEXT, last_seen REAL, report TEXT);
CREATE TABLE IF NOT EXISTS agent_state (
  key TEXT PRIMARY KEY, computer TEXT, status TEXT, since REAL);
CREATE TABLE IF NOT EXISTS events (
  ts REAL, computer TEXT, agent TEXT, workspace TEXT, status TEXT);
CREATE INDEX IF NOT EXISTS events_ts ON events(ts);
""")


def load_rooms():
    with open(ROOMS_FILE) as f:
        return json.load(f)


def agent_key(computer, session, a):
    return f"{computer}/{session}/{a.get('pane') or a.get('name')}"


def store_report(rep):
    """Save one report. Older (replayed) reports only add history; the newest wins."""
    cid, ts = rep["computer"], float(rep.get("ts") or time.time())
    with _lock:
        row = _db.execute("SELECT last_seen FROM computers WHERE id=?", (cid,)).fetchone()
        newest = row is None or ts >= (row[0] or 0)
        for sess in (rep.get("herdr") or {}).get("sessions") or []:
            for a in sess.get("agents") or []:
                key = agent_key(cid, sess.get("name"), a)
                status = a.get("status") if a.get("status") in STATUSES else "unknown"
                prev = _db.execute("SELECT status, since FROM agent_state WHERE key=?", (key,)).fetchone()
                if prev is None or (prev[0] != status and ts >= (prev[1] or 0)):
                    _db.execute("INSERT OR REPLACE INTO agent_state VALUES (?,?,?,?)", (key, cid, status, ts))
                    _db.execute("INSERT INTO events VALUES (?,?,?,?,?)",
                                (ts, cid, a.get("name"), a.get("workspace"), status))
        if newest:
            _db.execute("INSERT OR REPLACE INTO computers VALUES (?,?,?,?)",
                        (cid, rep.get("hostname"), ts, json.dumps(rep)))
        _db.commit()


# ------------------------------------------------------------- placement ----

def _match(value, words):
    v = (value or "").lower()
    return bool(v) and any(w.lower() == v or w.lower() in v for w in words)


def place(agent, computer_id, rooms):
    """Workspace name wins, then the computer's own room, then the agent's name."""
    for r in rooms:
        if _match(agent.get("workspace"), r.get("workspaces", [])):
            return r["id"]
    for r in rooms:
        if (r.get("computer") or {}).get("id") == computer_id:
            return r["id"]
    for r in rooms:
        if _match(agent.get("name"), r.get("agents", [])) or _match(agent.get("tool"), r.get("agents", [])):
            return r["id"]
    return "unassigned"


def snapshot():
    cfg = load_rooms()
    rooms_cfg, now = cfg["rooms"], time.time()
    offline_after = float(cfg.get("offline_after_seconds", 90))
    with _lock:
        comps = _db.execute("SELECT id, hostname, last_seen, report FROM computers").fetchall()
        since = dict(_db.execute("SELECT key, since FROM agent_state").fetchall())

    computers, buckets = {}, {r["id"]: [] for r in rooms_cfg}
    buckets["unassigned"] = []
    for cid, host, seen, rep_json in comps:
        rep = json.loads(rep_json)
        online = (now - (seen or 0)) <= offline_after
        sessions = (rep.get("herdr") or {}).get("sessions") or []
        computers[cid] = {"id": cid, "hostname": host, "online": online,
                          "last_seen": seen, "herdr": (rep.get("herdr") or {}).get("found", False),
                          "errors": [s["error"] for s in sessions if s.get("error")]}
        for sess in sessions:
            for a in sess.get("agents") or []:
                rid = place(a, cid, rooms_cfg)
                buckets.setdefault(rid, []).append({
                    "name": a.get("name"), "tool": a.get("tool"),
                    "status": a.get("status") if online else "offline",
                    "last_status": a.get("status"), "workspace": a.get("workspace"),
                    "session": sess.get("name"), "computer": cid, "online": online,
                    "title": a.get("title"),
                    "since": since.get(agent_key(cid, sess.get("name"), a)),
                })

    def counts(agents):
        c = {s: 0 for s in STATUSES + ("offline",)}
        for a in agents:
            c[a["status"]] = c.get(a["status"], 0) + 1
        return c

    rooms = []
    for r in rooms_cfg:
        comp_cfg = r.get("computer") or {}
        live = computers.get(comp_cfg.get("id"))
        agents = sorted(buckets[r["id"]], key=lambda a: (STATUSES + ("offline",)).index(a["status"]))
        rooms.append({
            "id": r["id"], "name": r["name"], "lead": r.get("lead"), "accent": r.get("accent"),
            "reel": r.get("reel"),
            "computer": {**comp_cfg, "connected": bool(live), "online": bool(live and live["online"]),
                         "last_seen": live and live["last_seen"], "hostname": live and live["hostname"]},
            "agents": agents, "counts": counts(agents),
        })
    return {"generated": now, "rooms": rooms,
            "unassigned": {"agents": buckets["unassigned"], "counts": counts(buckets["unassigned"])},
            "computers": sorted(computers.values(), key=lambda c: c["id"])}


# ---------------------------------------------------------------- server ----

mcp = FastMCP("studex-rooms")


def _bearer(request):
    h = request.headers.get("authorization", "")
    return h[7:].strip() if h.lower().startswith("bearer ") else ""


def _viewer_ok(request):
    if not VIEW_TOKEN:
        return True
    given = _bearer(request) or request.query_params.get("key", "")
    return hmac.compare_digest(given, VIEW_TOKEN)


@mcp.custom_route("/relay/report", methods=["POST"])
async def relay_report(request: Request):
    token = _bearer(request)
    try:
        body = await request.json()
        reports = body.get("reports") or []
    except ValueError:
        return JSONResponse({"error": "bad json"}, status_code=400)
    if not reports or len(reports) > 500:
        return JSONResponse({"error": "send 1 to 500 reports"}, status_code=400)
    for rep in reports:
        cid = str(rep.get("computer") or "")
        expected = RELAY_TOKENS.get(cid)
        if not expected or not hmac.compare_digest(token, expected):
            return JSONResponse({"error": f"token not valid for computer '{cid}'"}, status_code=403)
    for rep in sorted(reports, key=lambda r: r.get("ts") or 0):
        store_report(rep)
    return JSONResponse({"ok": True, "stored": len(reports)})


@mcp.custom_route("/rooms", methods=["GET"])
async def rooms_json(request: Request):
    if not _viewer_ok(request):
        return JSONResponse({"error": "view token required"}, status_code=401)
    return JSONResponse(snapshot(), headers={"Access-Control-Allow-Origin": "*", "Cache-Control": "no-store"})


@mcp.custom_route("/", methods=["GET"])
async def rooms_page(request: Request):
    return FileResponse(WEB_PAGE)


MEDIA_DIR = (HERE.parent / "web" / "media").resolve()


@mcp.custom_route("/media/{name}", methods=["GET"])
async def media(request: Request):
    """Promo reels and posters. Only plain files directly inside web/media are served."""
    name = request.path_params["name"]
    target = (MEDIA_DIR / name).resolve()
    if target.parent != MEDIA_DIR or not target.is_file() or target.suffix.lower() not in (".mp4", ".jpg", ".png", ".webm"):
        return PlainTextResponse("not found", status_code=404)
    return FileResponse(target, headers={"Cache-Control": "public, max-age=86400"})


@mcp.custom_route("/healthz", methods=["GET"])
async def healthz(request: Request):
    return PlainTextResponse("ok")


@mcp.tool
def rooms_list() -> list[dict]:
    """Every company room with its computer (online or offline) and how many agents are working, blocked, idle or done."""
    s = snapshot()
    return [{"room": r["id"], "name": r["name"], "computer": r["computer"]["label"],
             "computer_online": r["computer"]["online"], "counts": r["counts"]} for r in s["rooms"]]


@mcp.tool
def room_get(room_id: str) -> dict:
    """One room in full: its computer and every agent in it with status, tool, workspace and since when."""
    s = snapshot()
    if room_id == "unassigned":
        return s["unassigned"]
    for r in s["rooms"]:
        if r["id"] == room_id:
            return r
    return {"error": f"no room '{room_id}'", "rooms": [r["id"] for r in s["rooms"]]}


@mcp.tool
def agent_find(name: str) -> list[dict]:
    """Find agents by name or tool across all rooms and computers."""
    s, q, hits = snapshot(), name.lower(), []
    for r in s["rooms"] + [{"id": "unassigned", **s["unassigned"]}]:
        for a in r["agents"]:
            if q in (a["name"] or "").lower() or q in (a["tool"] or "").lower():
                hits.append({"room": r["id"], **a})
    return hits


if __name__ == "__main__":
    if not RELAY_TOKENS:
        raise SystemExit("Set STUDEX_RELAY_TOKENS, e.g. meat-desk:$(openssl rand -hex 24)")
    mcp.run(transport="http", host=os.environ.get("HOST", "0.0.0.0"), port=int(os.environ.get("PORT", "8787")))
