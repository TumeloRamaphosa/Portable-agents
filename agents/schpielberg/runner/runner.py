#!/usr/bin/env python3
"""Studex content pipeline runner for the Naledi CMO desktop.

Dry-run by default. Loops: heartbeat, poll queue, run pluggable steps
for Idea/Script items. Never posts, sends, or spends. Never calls
blocked generation or publishing hosts.
"""

from __future__ import annotations

import json
import logging
import os
import signal
import socket
import sys
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse

import requests

from steps import STEPS, describe_readiness

ROOT = Path(__file__).resolve().parent
ENV_PATH = ROOT / ".env"
LOG_DIR = ROOT / "logs"
WORK_DIR = ROOT / "work"
JOB_LOG = LOG_DIR / "jobs.jsonl"
RUNNER_LOG = LOG_DIR / "runner.log"

PLACEHOLDER_VALUES = {
    "",
    "changeme",
    "change-me",
    "your-key-here",
    "your_key_here",
    "placeholder",
    "xxx",
    "todo",
    "tbd",
    "none",
    "null",
    "insert-here",
    "<PIPELINE_API_TOKEN>",
    "<GEMINI_API_KEY>",
}

BLOCKED_HOST_FRAGMENTS = (
    "blotato.com",
    "higgsfield",
    "freepik",
)

log = logging.getLogger("studex-pipeline")
_shutdown = False


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def handle_signal(signum, _frame):
    global _shutdown
    log.info("received signal %s, shutting down after this cycle", signum)
    _shutdown = True


def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]
        env[key] = value
    return env


def cfg_get(env: dict[str, str], names: list[str], default: str = "") -> str:
    for name in names:
        if name in env:
            return env[name]
        if name in os.environ:
            return os.environ[name]
    return default


def is_configured(value: str | None) -> bool:
    if value is None:
        return False
    text = value.strip()
    return bool(text) and text.lower() not in PLACEHOLDER_VALUES


class Config:
    def __init__(self, env: dict[str, str]):
        self.env = env
        self.api_base = cfg_get(
            env,
            ["PIPELINE_API_BASE", "CONTENT_PIPELINE_API_BASE", "CONTENT_PIPELINE_API_URL"],
        ).rstrip("/")
        self.api_token = cfg_get(
            env,
            ["PIPELINE_API_TOKEN", "CONTENT_PIPELINE_API_TOKEN", "PIPELINE_BEARER_TOKEN"],
        )
        self.heartbeat_path = cfg_get(env, ["PIPELINE_HEARTBEAT_PATH"], "/api/pipeline/heartbeat")
        self.queue_path = cfg_get(env, ["PIPELINE_QUEUE_PATH"], "/api/pipeline/queue")
        self.items_path = cfg_get(env, ["PIPELINE_ITEMS_PATH"], "/api/pipeline/items")
        try:
            self.poll_seconds = max(15, int(cfg_get(env, ["PIPELINE_POLL_SECONDS"], "60") or "60"))
        except ValueError:
            self.poll_seconds = 60
        self.runner_id = cfg_get(env, ["PIPELINE_RUNNER_ID"], "naledi-cmo") or "naledi-cmo"
        dry = cfg_get(env, ["PIPELINE_DRY_RUN"], "true").strip().lower()
        self.dry_run = dry not in {"0", "false", "no", "off"}
        self.gemini_key = cfg_get(env, ["GEMINI_API_KEY"])
        self.gemini_base = cfg_get(
            env,
            ["GEMINI_API_BASE"],
            "https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        self.gemini_model = cfg_get(env, ["GEMINI_MODEL"], "gemini-3.8-flash")
        self.voice_provider = cfg_get(env, ["VOICE_PROVIDER"])
        self.elevenlabs_key = cfg_get(env, ["ELEVENLABS_API_KEY"])
        self.pictures_provider = cfg_get(env, ["PICTURES_PROVIDER"])
        self.comfyui_url = cfg_get(env, ["COMFYUI_URL"])

    @property
    def api_ready(self) -> bool:
        return is_configured(self.api_base) and is_configured(self.api_token)


def setup_logging() -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    fmt = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
    log.setLevel(logging.INFO)
    log.handlers.clear()
    fh = logging.FileHandler(RUNNER_LOG, encoding="utf-8")
    fh.setFormatter(fmt)
    sh = logging.StreamHandler(sys.stdout)
    sh.setFormatter(fmt)
    log.addHandler(fh)
    log.addHandler(sh)


def append_job_log(record: dict[str, Any]) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    record = {"ts": _utc_now(), **record}
    with JOB_LOG.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, ensure_ascii=True) + "\n")


def host_blocked(url: str) -> bool:
    host = (urlparse(url).hostname or "").lower()
    return any(frag in host for frag in BLOCKED_HOST_FRAGMENTS)


def assert_url_allowed(url: str) -> None:
    if host_blocked(url):
        raise RuntimeError(f"blocked host refused: {urlparse(url).hostname}")


class PipelineClient:
    def __init__(self, config: Config):
        self.config = config
        self.session = requests.Session()
        self.session.headers["User-Agent"] = "studex-pipeline-runner/1.0"
        if config.api_ready:
            self.session.headers["Authorization"] = f"Bearer {config.api_token}"
            self.session.headers["Content-Type"] = "application/json"
            self.session.headers["Accept"] = "application/json"

    def _url(self, path: str) -> str:
        base = self.config.api_base.rstrip("/") + "/"
        return urljoin(base, path.lstrip("/"))

    def _request(self, method: str, path: str, **kwargs) -> requests.Response:
        url = self._url(path)
        assert_url_allowed(url)
        timeout = kwargs.pop("timeout", 20)
        return self.session.request(method, url, timeout=timeout, **kwargs)

    def heartbeat(self, payload: dict[str, Any]) -> dict[str, Any]:
        if not self.config.api_ready:
            return {"ok": False, "status": "not_configured", "detail": "PIPELINE_API_BASE or PIPELINE_API_TOKEN is not configured"}
        resp = self._request("POST", self.config.heartbeat_path, json=payload)
        return {"ok": resp.ok, "http_status": resp.status_code, "body": _safe_body(resp)}

    def fetch_queue(self) -> dict[str, Any]:
        if not self.config.api_ready:
            return {"ok": False, "status": "not_configured", "items": [], "detail": "queue API is not configured"}
        resp = self._request("GET", self.config.queue_path)
        body = _safe_body(resp)
        items = []
        if isinstance(body, dict):
            items = body.get("items") or body.get("queue") or body.get("data") or []
        elif isinstance(body, list):
            items = body
        if not isinstance(items, list):
            items = []
        return {"ok": resp.ok, "http_status": resp.status_code, "items": items, "body": body}

    def patch_item(self, item_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        if not self.config.api_ready:
            return {"ok": False, "status": "not_configured"}
        path = f"{self.config.items_path.rstrip('/')}/{item_id}"
        resp = self._request("PATCH", path, json=payload)
        return {"ok": resp.ok, "http_status": resp.status_code, "body": _safe_body(resp)}


def _safe_body(resp: requests.Response) -> Any:
    try:
        return resp.json()
    except ValueError:
        text = (resp.text or "")[:500]
        return {"text": text}


def item_stage(item: dict[str, Any]) -> str:
    stage = item.get("stage") or item.get("status") or item.get("state") or ""
    return str(stage).strip().lower()


def item_id(item: dict[str, Any]) -> str:
    return str(item.get("id") or item.get("item_id") or item.get("uuid") or "")


def should_process(item: dict[str, Any]) -> bool:
    return item_stage(item) in {"idea", "script"}


def process_item(config: Config, client: PipelineClient, item: dict[str, Any]) -> dict[str, Any]:
    iid = item_id(item) or "unknown"
    stage = item_stage(item)
    work = WORK_DIR / iid
    work.mkdir(parents=True, exist_ok=True)
    context = {
        "config": config,
        "item": item,
        "item_id": iid,
        "stage": stage,
        "work_dir": work,
        "dry_run": config.dry_run,
        "is_configured": is_configured,
    }
    results = []
    for step in STEPS:
        try:
            result = step.run(context)
        except Exception as exc:  # noqa: BLE001 — log and continue the remaining steps
            result = {
                "step": step.name,
                "status": "error",
                "detail": f"{type(exc).__name__}: {exc}",
            }
            log.exception("step %s failed for item %s", step.name, iid)
        results.append(result)
        log.info("item %s step %s -> %s (%s)", iid, result.get("step"), result.get("status"), result.get("detail", ""))

    record = {
        "event": "item",
        "item_id": iid,
        "stage": stage,
        "title": item.get("title") or item.get("name") or "",
        "results": results,
        "dry_run": config.dry_run,
    }
    append_job_log(record)

    (work / "last-result.json").write_text(json.dumps(record, indent=2), encoding="utf-8")

    patch = {
        "runner_id": config.runner_id,
        "dry_run": config.dry_run,
        "step_results": results,
        "note": "steps recorded; no publish; stubs stay not_configured until providers are set",
    }
    try:
        patch_result = client.patch_item(iid, patch)
        record["patch"] = {"ok": patch_result.get("ok"), "http_status": patch_result.get("http_status"), "status": patch_result.get("status")}
        append_job_log({"event": "item_patch", "item_id": iid, **record["patch"]})
    except Exception as exc:  # noqa: BLE001
        log.warning("patch failed for item %s: %s", iid, exc)
        append_job_log({"event": "item_patch", "item_id": iid, "ok": False, "detail": str(exc)})
    return record


def build_heartbeat(config: Config) -> dict[str, Any]:
    return {
        "runner_id": config.runner_id,
        "ts": _utc_now(),
        "hostname": socket.gethostname(),
        "dry_run": config.dry_run,
        "status": "ok",
        "api_configured": config.api_ready,
        "readiness": describe_readiness(config, is_configured),
    }


def cycle(config: Config, client: PipelineClient) -> None:
    payload = build_heartbeat(config)
    try:
        hb = client.heartbeat(payload)
    except Exception as exc:  # noqa: BLE001
        hb = {"ok": False, "status": "error", "detail": str(exc)}
        log.warning("heartbeat error: %s", exc)
    if hb.get("status") == "not_configured":
        log.info("heartbeat skipped: %s", hb.get("detail"))
    elif hb.get("ok"):
        log.info("heartbeat ok (http %s)", hb.get("http_status"))
    else:
        log.warning("heartbeat failed: %s", {k: v for k, v in hb.items() if k != "body"})
        append_job_log({"event": "heartbeat", **{k: v for k, v in hb.items() if k != "body"}})

    try:
        queue = client.fetch_queue()
    except Exception as exc:  # noqa: BLE001
        log.warning("queue error: %s", exc)
        append_job_log({"event": "queue", "ok": False, "detail": str(exc)})
        return

    if queue.get("status") == "not_configured":
        log.info("queue skipped: %s", queue.get("detail"))
        return
    if not queue.get("ok"):
        log.warning("queue fetch failed (http %s)", queue.get("http_status"))
        append_job_log({"event": "queue", "ok": False, "http_status": queue.get("http_status")})
        return

    items = [i for i in queue.get("items") or [] if isinstance(i, dict)]
    due = [i for i in items if should_process(i)]
    log.info("queue ok: %s items, %s in idea/script", len(items), len(due))
    for item in due:
        if _shutdown:
            break
        process_item(config, client, item)


def main() -> int:
    setup_logging()
    signal.signal(signal.SIGTERM, handle_signal)
    signal.signal(signal.SIGINT, handle_signal)
    env = load_env(ENV_PATH)
    config = Config(env)
    client = PipelineClient(config)
    log.info(
        "studex-pipeline starting runner_id=%s dry_run=%s api_configured=%s poll=%ss",
        config.runner_id,
        config.dry_run,
        config.api_ready,
        config.poll_seconds,
    )
    log.info("readiness: %s", describe_readiness(config, is_configured))
    if not config.dry_run:
        log.warning("PIPELINE_DRY_RUN is off, but blocked hosts and publish calls remain disabled")

    while not _shutdown:
        started = time.time()
        try:
            cycle(config, client)
        except Exception:
            log.error("cycle crashed:\n%s", traceback.format_exc())
            append_job_log({"event": "cycle_error", "detail": "see runner.log"})
        elapsed = time.time() - started
        remaining = max(1, config.poll_seconds - elapsed)
        end = time.time() + remaining
        while not _shutdown and time.time() < end:
            time.sleep(min(1, end - time.time()))
    log.info("studex-pipeline stopped")
    return 0


if __name__ == "__main__":
    sys.exit(main())
