#!/usr/bin/env python3
"""Pluggable pipeline steps. Unconfigured steps are marked, never faked."""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path
from typing import Any, Callable, Protocol

import requests


class Step(Protocol):
    name: str

    def run(self, context: dict[str, Any]) -> dict[str, Any]:
        ...


def _not_configured(name: str, reason: str) -> dict[str, Any]:
    return {"step": name, "status": "not_configured", "detail": reason}


def _skipped(name: str, reason: str) -> dict[str, Any]:
    return {"step": name, "status": "skipped", "detail": reason}


def _ok(name: str, detail: str, **extra: Any) -> dict[str, Any]:
    out = {"step": name, "status": "ok", "detail": detail}
    out.update(extra)
    return out


class ScriptStep:
    name = "script"

    def run(self, context: dict[str, Any]) -> dict[str, Any]:
        config = context["config"]
        is_configured: Callable[[str | None], bool] = context["is_configured"]
        if not is_configured(config.gemini_key):
            return _not_configured(self.name, "GEMINI_API_KEY is not configured")
        if not is_configured(config.gemini_base) or not is_configured(config.gemini_model):
            return _not_configured(self.name, "GEMINI_API_BASE or GEMINI_MODEL is not configured")

        work: Path = context["work_dir"]
        item = context["item"]
        title = item.get("title") or item.get("name") or "untitled"
        brief = item.get("brief") or item.get("prompt") or item.get("description") or ""
        url = config.gemini_base.rstrip("/") + "/chat/completions"
        headers = {
            "Authorization": f"Bearer {config.gemini_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": config.gemini_model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Draft a short faceless-video script only. No likeness of real people. "
                        "Do not invent clients, revenue, or testimonials. Frame numbers as targets. "
                        "Return plain text."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Title: {title}\n\nBrief:\n{brief}".strip(),
                },
            ],
            "temperature": 0.4,
        }
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=60)
        except Exception as exc:  # noqa: BLE001
            return {"step": self.name, "status": "error", "detail": f"request failed: {exc}"}
        if resp.status_code >= 400:
            return {
                "step": self.name,
                "status": "error",
                "detail": f"gemini http {resp.status_code}: {(resp.text or '')[:240]}",
            }
        data = resp.json()
        text = ""
        try:
            text = data["choices"][0]["message"]["content"]
        except Exception:
            text = json.dumps(data)[:2000]
        out = work / "script-draft.txt"
        out.write_text(text, encoding="utf-8")
        return _ok(self.name, "wrote local script draft only", path=str(out))


class VoiceStep:
    name = "voice"

    def run(self, context: dict[str, Any]) -> dict[str, Any]:
        config = context["config"]
        is_configured = context["is_configured"]
        if not is_configured(config.voice_provider):
            return _not_configured(self.name, "VOICE_PROVIDER is not configured")
        if config.voice_provider.strip().lower() in {"elevenlabs", "eleven_labs"}:
            if not is_configured(config.elevenlabs_key):
                return _not_configured(self.name, "ELEVENLABS_API_KEY is not configured")
        return _not_configured(
            self.name,
            f"voice provider '{config.voice_provider}' is named but the local voice path is not wired yet",
        )


class PicturesStep:
    name = "pictures"

    def run(self, context: dict[str, Any]) -> dict[str, Any]:
        config = context["config"]
        is_configured = context["is_configured"]
        if not is_configured(config.pictures_provider) and not is_configured(config.comfyui_url):
            return _not_configured(self.name, "PICTURES_PROVIDER and COMFYUI_URL are not configured")
        if is_configured(config.comfyui_url):
            return _not_configured(
                self.name,
                "COMFYUI_URL is set but the pictures step is not wired yet; refusing to fake frames",
            )
        return _not_configured(
            self.name,
            f"pictures provider '{config.pictures_provider}' is named but not wired yet",
        )


class StitchStep:
    name = "stitch"

    def run(self, context: dict[str, Any]) -> dict[str, Any]:
        ffmpeg = shutil.which("ffmpeg")
        if not ffmpeg:
            return _not_configured(self.name, "ffmpeg is not installed")
        work: Path = context["work_dir"]
        pictures = sorted(p for p in work.glob("pictures/*") if p.is_file())
        voice = next(iter(work.glob("voice.*")), None)
        if not pictures and voice is None:
            return _skipped(
                self.name,
                "ffmpeg is installed, but no pictures or voice inputs exist yet; refusing to fake a video",
            )
        # Inputs exist in a later run: stitch to 9:16. Not reached until earlier steps produce files.
        out = work / "draft-9x16.mp4"
        # We still refuse to invent media if only one side is missing.
        if not pictures or voice is None:
            return _skipped(
                self.name,
                "incomplete inputs (need pictures and voice); refusing to fake a finished video",
            )
        list_file = work / "pictures.txt"
        list_file.write_text("".join(f"file '{p}'\n" for p in pictures), encoding="utf-8")
        cmd = [
            ffmpeg,
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(list_file),
            "-i",
            str(voice),
            "-vf",
            "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2",
            "-shortest",
            "-movflags",
            "+faststart",
            str(out),
        ]
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        if proc.returncode != 0:
            return {
                "step": self.name,
                "status": "error",
                "detail": (proc.stderr or proc.stdout or "ffmpeg failed")[-400:],
            }
        return _ok(self.name, "wrote local 9:16 draft only, not published", path=str(out))


STEPS: list[Step] = [ScriptStep(), VoiceStep(), PicturesStep(), StitchStep()]


def describe_readiness(config: Any, is_configured: Callable[[str | None], bool]) -> dict[str, str]:
    ffmpeg = "ok" if shutil.which("ffmpeg") else "not_configured: ffmpeg missing"
    script = "ok" if is_configured(config.gemini_key) else "not_configured: GEMINI_API_KEY"
    if is_configured(config.voice_provider) and (
        config.voice_provider.strip().lower() not in {"elevenlabs", "eleven_labs"}
        or is_configured(config.elevenlabs_key)
    ):
        voice = "named_but_unwired"
    else:
        voice = "not_configured: VOICE_PROVIDER"
    if is_configured(config.pictures_provider) or is_configured(config.comfyui_url):
        pictures = "named_but_unwired"
    else:
        pictures = "not_configured: PICTURES_PROVIDER/COMFYUI_URL"
    return {
        "script": script,
        "voice": voice,
        "pictures": pictures,
        "stitch": ffmpeg,
        "publish": "disabled",
    }
