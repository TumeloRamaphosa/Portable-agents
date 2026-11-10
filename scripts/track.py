#!/usr/bin/env python3
"""Studex work tracker CLI. Agents use this to report work into work-tracker/data.js.

  track.py list [--vertical BC] [--status blocked] [--owner RALF]
  track.py set  BC-10 done [--note "NDA signed"] [--agent SCHALK]
  track.py add  SA "Ship client onboarding flow" [--owner VERA] [--group "Launch"] [--status todo]
  track.py log  RALF OS "Gateway whoami endpoint live"

Every set/add/log also appends a line to the work log, so the dashboard shows who did what.
"""
import argparse, datetime, json, pathlib, sys

DATA = pathlib.Path(__file__).resolve().parent.parent / "work-tracker" / "data.js"
PREFIX = "window.STUDEX_WORK = "
STATUSES = ["todo", "doing", "blocked", "done"]


def load():
    text = DATA.read_text(encoding="utf-8").strip()
    if not text.startswith(PREFIX):
        sys.exit("data.js does not start with '%s'" % PREFIX)
    return json.loads(text[len(PREFIX):].rstrip(";"))


def save(d):
    d["updated"] = today()
    DATA.write_text(PREFIX + json.dumps(d, indent=2, ensure_ascii=False) + ";\n", encoding="utf-8")


def today():
    tz = datetime.timezone(datetime.timedelta(hours=2))  # SAST
    return datetime.datetime.now(tz).strftime("%Y-%m-%d")


def find(d, task_id):
    for v in d["verticals"]:
        for t in v["tasks"]:
            if t["id"] == task_id:
                return v, t
    sys.exit("no task with id %s" % task_id)


def vertical(d, vid):
    for v in d["verticals"]:
        if v["id"] == vid:
            return v
    sys.exit("no vertical %s (have: %s)" % (vid, ", ".join(v["id"] for v in d["verticals"])))


def log(d, agent, vid, text, task=None):
    entry = {"date": today(), "agent": agent or "", "vertical": vid, "text": text}
    if task:
        entry["task"] = task
    d.setdefault("log", []).insert(0, entry)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    a = sub.add_parser("list")
    a.add_argument("--vertical"); a.add_argument("--status", choices=STATUSES); a.add_argument("--owner")

    a = sub.add_parser("set")
    a.add_argument("id"); a.add_argument("status", choices=STATUSES)
    a.add_argument("--note"); a.add_argument("--agent"); a.add_argument("--owner")

    a = sub.add_parser("add")
    a.add_argument("vertical"); a.add_argument("title")
    a.add_argument("--owner", default=""); a.add_argument("--group"); a.add_argument("--note")
    a.add_argument("--status", choices=STATUSES, default="todo"); a.add_argument("--agent")

    a = sub.add_parser("log")
    a.add_argument("agent"); a.add_argument("vertical"); a.add_argument("text")

    args = p.parse_args()
    d = load()

    if args.cmd == "list":
        for v in d["verticals"]:
            if args.vertical and v["id"] != args.vertical:
                continue
            for t in v["tasks"]:
                if args.status and t["status"] != args.status:
                    continue
                if args.owner and t.get("owner", "").lower() != args.owner.lower():
                    continue
                print("%-6s %-8s %-11s %s" % (t["id"], t["status"], t.get("owner") or "-", t["title"]))
        return

    if args.cmd == "set":
        v, t = find(d, args.id)
        old = t["status"]
        t["status"] = args.status
        t["asOf"] = today()
        if args.note is not None:
            t["note"] = args.note
        if args.owner is not None:
            t["owner"] = args.owner
        log(d, args.agent or t.get("owner"), v["id"], "%s: %s → %s" % (t["title"], old, args.status), t["id"])
        save(d)
        print("%s %s -> %s" % (t["id"], old, args.status))
        return

    if args.cmd == "add":
        v = vertical(d, args.vertical)
        nums = [int(t["id"].split("-")[1]) for t in v["tasks"] if t["id"].split("-")[1].isdigit()]
        tid = "%s-%02d" % (v["id"], (max(nums) + 1) if nums else 1)
        t = {"id": tid, "title": args.title, "status": args.status, "owner": args.owner, "asOf": today()}
        if args.group:
            t["group"] = args.group
        if args.note:
            t["note"] = args.note
        v["tasks"].append(t)
        log(d, args.agent or args.owner, v["id"], "Added: %s" % args.title, tid)
        save(d)
        print("added %s" % tid)
        return

    if args.cmd == "log":
        vertical(d, args.vertical)
        log(d, args.agent, args.vertical, args.text)
        save(d)
        print("logged")


if __name__ == "__main__":
    main()
