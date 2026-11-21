#!/usr/bin/env bash
# Stage daily app-map report artifacts (Graphify + Floorplan + factory) for archive / Notion paste.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SLOT="am"
while [ $# -gt 0 ]; do
  case "$1" in
    --slot) SLOT="${2:-am}"; shift 2 ;;
    --slot=*) SLOT="${1#--slot=}"; shift ;;
    -h|--help)
      echo "usage: $0 [--slot am|pm]"
      exit 0
      ;;
    *) shift ;;
  esac
done

ARCHIVE_ROOT="${STUDEX_ARCHIVE_ROOT:-$HOME/.studex/archive}"
HOST_TAG="$(hostname -s 2>/dev/null || hostname)"
DATE_LOCAL="$(date +%Y%m%d)"
DEST="$ARCHIVE_ROOT/$HOST_TAG/${DATE_LOCAL}-planning-${SLOT}"
mkdir -p "$DEST/planning"

( cd "$ROOT" && git status -sb 2>/dev/null ) >"$DEST/planning/git-status.txt" || true
( cd "$ROOT" && npm run factory:status >"$DEST/planning/factory-status.txt" 2>&1 ) || true

GRAPH_REPORT="$ROOT/graphify-out/GRAPH_REPORT.md"
if [ -f "$GRAPH_REPORT" ]; then
  head -n 80 "$GRAPH_REPORT" >"$DEST/planning/graph-report-excerpt.md"
  echo "(truncated to 80 lines — full file local only)" >>"$DEST/planning/graph-report-excerpt.md"
else
  echo "No graphify-out/GRAPH_REPORT.md yet — run /graphify . in Cursor or Claude." >"$DEST/planning/graph-report-excerpt.md"
fi

if [ -d "$ROOT/floorplan" ]; then
  find "$ROOT/floorplan" -maxdepth 2 -type f -name '*.json' -o -name 'architecture.json' 2>/dev/null | head -20 >"$DEST/planning/floorplan-files.txt" || true
  echo "Floorplan present — open floorplan/index.html for Recent work and Health." >"$DEST/planning/floorplan-recent.txt"
else
  echo "No floorplan/ yet — Claude Code: 'Make me a floorplan of this app.'" >"$DEST/planning/floorplan-recent.txt"
fi

if [ "$SLOT" = "am" ]; then
  cat >"$DEST/planning/DAILY_SUMMARY.md" <<EOF
# Studex objectives (07:00) — ${DATE_LOCAL}

Host: ${HOST_TAG}  
Doc: docs/DESKTOP_OPENBOT_DAILY_MIX.md

## Objectives today (max 3)
1.
2.
3.

## ZTE / Factory Board ids
- (from factory-status.txt)

## App context (Graphify + Floorplan)
- (god nodes / Health titles only — no secrets)

## OpenBot handoff (optional)
- Ada summary → first Herdr ▶ step:

## Notion paste (objectives, max 5 lines)
-

EOF
else
  cat >"$DEST/planning/DAILY_SUMMARY.md" <<EOF
# Studex close (19:00) — ${DATE_LOCAL}

Host: ${HOST_TAG}  
Doc: docs/DESKTOP_OPENBOT_DAILY_MIX.md

## Shipped / done
-

## Blocked
-

## Tomorrow
-

## App map delta (Graphify + Floorplan)
- (what changed today)

## Factory / queue
- (factory-status.txt)

## Notion paste (max 5 lines, Evidence links)
-

EOF
fi

echo "Staged: $DEST/planning/"
echo "Next: edit DAILY_SUMMARY.md → ./scripts/agent-work-archive.sh"