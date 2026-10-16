"""Studex content pipeline: dry-run runner (v0.1).

Walks one job through the node graph in order. Dry run only:
no provider calls, no spend, placeholder media from ffmpeg.
The publish node stops at AWAITING_HUMAN and never uploads.

Usage:
    python3 pipeline.py new brief.json --jobs-dir DIR
    python3 pipeline.py run JOB_ID --jobs-dir DIR
    python3 pipeline.py status JOB_ID --jobs-dir DIR
"""

import argparse
import hashlib
import json
import sqlite3
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

NODES = ["script", "shot_list", "image", "motion", "voice", "edit", "publish"]
DEPS = {
    "script": [],
    "shot_list": ["script"],
    "image": ["shot_list"],
    "motion": ["image", "shot_list"],
    "voice": ["script"],
    "edit": ["motion", "voice"],
    "publish": ["edit"],
}


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def connect(jobs_dir: Path) -> sqlite3.Connection:
    jobs_dir.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(jobs_dir / "pipeline.db")
    db.row_factory = sqlite3.Row
    db.execute(
        """CREATE TABLE IF NOT EXISTS node_runs (
            job_id TEXT, node TEXT, state TEXT, input_hash TEXT,
            output_path TEXT, last_error TEXT, updated_at TEXT,
            PRIMARY KEY (job_id, node))"""
    )
    db.commit()
    return db


def set_state(db, job_id, node, state, output_path=None, error=None):
    db.execute(
        """INSERT INTO node_runs (job_id, node, state, output_path, last_error, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT (job_id, node) DO UPDATE SET
             state = excluded.state,
             output_path = COALESCE(excluded.output_path, node_runs.output_path),
             last_error = excluded.last_error,
             updated_at = excluded.updated_at""",
        (job_id, node, state, output_path, error, now()),
    )
    db.commit()


def get_state(db, job_id, node):
    row = db.execute(
        "SELECT state FROM node_runs WHERE job_id = ? AND node = ?", (job_id, node)
    ).fetchone()
    return row["state"] if row else "pending"


def job_dir(jobs_dir: Path, job_id: str) -> Path:
    return jobs_dir / job_id


def make_placeholder_png(path: Path):
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi",
         "-i", "color=c=0x202020:s=1920x1080", "-frames:v", "1", str(path)],
        check=True,
    )


def make_placeholder_clip(path: Path, seconds: float):
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi",
         "-i", "color=c=0x202020:s=1920x1080:r=24",
         "-t", str(seconds), "-c:v", "libx264", "-pix_fmt", "yuv420p", str(path)],
        check=True,
    )


def make_placeholder_wav(path: Path, seconds: float):
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi",
         "-i", "anullsrc=r=44100:cl=mono", "-t", str(seconds), str(path)],
        check=True,
    )


# Each adapter writes placeholder output for its node, in dry-run mode.
def run_script(jdir, brief):
    script = {
        "title_candidates": [f"[DRY RUN] {brief['topic']}"],
        "sections": [
            {"id": f"s{i:02d}", "role": "point", "narration": "[dry-run narration]",
             "on_screen_text": [], "source_notes": [], "est_seconds": 40}
            for i in range(1, 4)
        ],
        "total_est_seconds": 120,
    }
    out = jdir / "script.json"
    out.write_text(json.dumps(script, indent=2))
    return out


def run_shot_list(jdir, _brief):
    script = json.loads((jdir / "script.json").read_text())
    shots = []
    n = 0
    for sec in script["sections"]:
        per_section = 2
        for k in range(per_section):
            n += 1
            shots.append({
                "shot_id": f"{sec['id']}-{k + 1:02d}", "section_id": sec["id"],
                # shots fill the section's narration length (spec: within 5%)
                "duration_s": round(sec["est_seconds"] / per_section, 2),
                "visual_prompt": "[dry-run visual]",
                "negative_prompt": "text, watermark, logo", "camera": "static",
                "seed": 1000 + n,
            })
    out = jdir / "shots.json"
    out.write_text(json.dumps({"aspect": "16:9", "fps": 24, "shots": shots}, indent=2))
    return out


def run_image(jdir, _brief):
    shots = json.loads((jdir / "shots.json").read_text())["shots"]
    (jdir / "images").mkdir(exist_ok=True)
    for s in shots:
        make_placeholder_png(jdir / "images" / f"{s['shot_id']}.png")
    return jdir / "images"


def run_motion(jdir, _brief):
    shots = json.loads((jdir / "shots.json").read_text())["shots"]
    (jdir / "clips").mkdir(exist_ok=True)
    for s in shots:
        make_placeholder_clip(jdir / "clips" / f"{s['shot_id']}.mp4", s["duration_s"])
    return jdir / "clips"


def run_voice(jdir, _brief):
    script = json.loads((jdir / "script.json").read_text())
    (jdir / "audio").mkdir(exist_ok=True)
    timings = []
    for sec in script["sections"]:
        seconds = float(sec["est_seconds"])
        make_placeholder_wav(jdir / "audio" / f"{sec['id']}.wav", seconds)
        timings.append({"section_id": sec["id"], "file": f"audio/{sec['id']}.wav",
                        "seconds": seconds})
    out = jdir / "timings.json"
    out.write_text(json.dumps(timings, indent=2))
    return out


def run_edit(jdir, _brief):
    clips = sorted((jdir / "clips").glob("*.mp4"))
    listing = jdir / "timeline" / "concat.txt"
    listing.parent.mkdir(exist_ok=True)
    listing.write_text("".join(f"file '{c}'\n" for c in clips))
    (jdir / "out").mkdir(exist_ok=True)
    final = jdir / "out" / "final.mp4"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
         "-i", str(listing), "-c", "copy", str(final)],
        check=True,
    )
    (jdir / "out" / "captions.srt").write_text(
        "1\n00:00:00,000 --> 00:00:05,000\n[dry-run caption]\n")
    return final


def run_publish(jdir, brief):
    # Human gate. Never uploads in v0.1. Writes the review packet and stops.
    draft = {
        "title": f"[DRY RUN] {brief['topic']}",
        "description": "",
        "tags": [],
        "ai_content_disclosure": None,
    }
    (jdir / "publish_draft.json").write_text(json.dumps(draft, indent=2))
    return jdir / "publish_draft.json"


ADAPTERS = {
    "script": run_script,
    "shot_list": run_shot_list,
    "image": run_image,
    "motion": run_motion,
    "voice": run_voice,
    "edit": run_edit,
    "publish": run_publish,
}


def cmd_new(args):
    jobs_dir = Path(args.jobs_dir)
    brief = json.loads(Path(args.brief).read_text())
    job_id = hashlib.sha256(
        (brief["topic"] + now()).encode()).hexdigest()[:10]
    jdir = job_dir(jobs_dir, job_id)
    jdir.mkdir(parents=True)
    (jdir / "brief.json").write_text(json.dumps(brief, indent=2))
    db = connect(jobs_dir)
    for node in NODES:
        set_state(db, job_id, node, "pending")
    print(job_id)


def cmd_run(args):
    jobs_dir = Path(args.jobs_dir)
    db = connect(jobs_dir)
    jdir = job_dir(jobs_dir, args.job_id)
    brief = json.loads((jdir / "brief.json").read_text())
    for node in NODES:
        if get_state(db, args.job_id, node) == "done":
            continue
        deps_ok = all(get_state(db, args.job_id, d) == "done" for d in DEPS[node])
        if not deps_ok:
            print(f"{node}: waiting on dependencies")
            break
        set_state(db, args.job_id, node, "running")
        try:
            out = ADAPTERS[node](jdir, brief)
        except Exception as exc:  # record the failure, stop the job
            set_state(db, args.job_id, node, "failed", error=str(exc))
            print(f"{node}: FAILED: {exc}")
            return
        if node == "publish":
            set_state(db, args.job_id, node, "awaiting_human", output_path=str(out))
            print("publish: AWAITING_HUMAN (dry run, upload disabled)")
            return
        set_state(db, args.job_id, node, "done", output_path=str(out))
        print(f"{node}: done -> {out}")


def cmd_status(args):
    db = connect(Path(args.jobs_dir))
    for row in db.execute(
        "SELECT node, state, output_path FROM node_runs WHERE job_id = ?",
        (args.job_id,),
    ):
        print(f"{row['node']:<10} {row['state']:<15} {row['output_path'] or ''}")


def main(argv):
    parser = argparse.ArgumentParser(prog="pipeline.py")
    sub = parser.add_subparsers(dest="cmd", required=True)
    for name in ("new", "run", "status"):
        p = sub.add_parser(name)
        p.add_argument("--jobs-dir", required=True)
        if name == "new":
            p.add_argument("brief")
        else:
            p.add_argument("job_id")
    args = parser.parse_args(argv)
    {"new": cmd_new, "run": cmd_run, "status": cmd_status}[args.cmd](args)


if __name__ == "__main__":
    main(sys.argv[1:])
