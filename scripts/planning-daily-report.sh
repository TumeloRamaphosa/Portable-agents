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

cat >"$DEST/planning/DAILY_SUMMARY.md" <<EOF
# Studex app map daily report (${SLOT^^}) — ${DATE_LOCAL}

Host: ${HOST_TAG}  
Repo: Portable-agents  
Doc: docs/APP_MAP_DAILY_ROUTINE.md

## What we learned about the app today
- (Graphify: 1–3 bullets from graph-report-excerpt.md)
- (Floorplan: Recent work / Health — titles only)

## Factory / queue
- (paste top lines from factory-status.txt)

## Done today
-

## Blocked
-

## Tomorrow / next ZTE
-

## Notion paste (max 5 lines, no secrets)
-

EOF

echo "Staged: $DEST/planning/"
echo "Next: edit DAILY_SUMMARY.md → ./scripts/agent-work-archive.sh"