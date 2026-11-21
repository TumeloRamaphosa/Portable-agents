#!/usr/bin/env bash
# 07:00 objectives or 19:00 close — Graphify/Floorplan staging + optional wiki paths.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SLOT="07-objectives"
while [ $# -gt 0 ]; do
  case "$1" in
    --slot) SLOT="${2:-}"; shift 2 ;;
    --slot=*) SLOT="${1#--slot=}"; shift ;;
    -h|--help)
      echo "usage: $0 [--slot 07-objectives|19-close|am|pm]"
      exit 0
      ;;
    *) shift ;;
  esac
done

case "$SLOT" in
  07-objectives|7am|objectives) PLAN_SLOT="am" ;;
  19-close|7pm|close|evening) PLAN_SLOT="pm" ;;
  am|pm) PLAN_SLOT="$SLOT" ;;
  *) PLAN_SLOT="am"; SLOT="07-objectives" ;;
esac

DATE_TAG="$(date +%Y-%m-%d)"
WIKI_DAILY="$ROOT/brain/daily"
mkdir -p "$WIKI_DAILY"

bash "$ROOT/scripts/planning-daily-report.sh" --slot "$PLAN_SLOT"

ARCHIVE_ROOT="${STUDEX_ARCHIVE_ROOT:-$HOME/.studex/archive}"
HOST_TAG="$(hostname -s 2>/dev/null || hostname)"
DATE_LOCAL="$(date +%Y%m%d)"
DEST="$ARCHIVE_ROOT/$HOST_TAG/${DATE_LOCAL}-planning-${PLAN_SLOT}"
SUMMARY="${DEST}/planning/DAILY_SUMMARY.md"
NOTE=""
if [ "$PLAN_SLOT" = "am" ]; then
  NOTE="$WIKI_DAILY/${DATE_TAG}-07-objectives.md"
else
  NOTE="$WIKI_DAILY/${DATE_TAG}-19-close.md"
fi

if [ -f "$SUMMARY" ]; then
  {
    echo "# Daily ${SLOT} — ${DATE_TAG}"
    echo ""
    echo "Source: \`$SUMMARY\`"
    echo ""
    cat "$SUMMARY"
  } >"$NOTE"
  echo "Wiki daily note: $NOTE"
fi

if [ "$PLAN_SLOT" = "pm" ]; then
  bash "$ROOT/scripts/ops-status-report.sh" pm 2>/dev/null || true
fi

echo "Next: edit objectives/close bullets → Notion → Herdr ▶"