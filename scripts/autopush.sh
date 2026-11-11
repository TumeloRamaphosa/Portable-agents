#!/bin/bash
# Black Cloud — auto-push. Runs every 30 min via cron.
# Commits whatever state the build is in and pushes to origin/main.
set -uo pipefail

REPO="$HOME/Portable-agents"
LOG="$REPO/.autopush.log"

cd "$REPO" || exit 1

# nothing changed -> exit quietly
if [ -z "$(git status --porcelain)" ]; then
  echo "$(date '+%F %T %Z')  no changes" >> "$LOG"
  exit 0
fi

STAMP=$(TZ='Africa/Johannesburg' date '+%Y-%m-%d %H:%M SAST')
git add -A
git commit -q -m "autopush: build state ${STAMP}

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>" \
  >> "$LOG" 2>&1

if git push -q origin main >> "$LOG" 2>&1; then
  echo "$(date '+%F %T %Z')  pushed" >> "$LOG"
else
  echo "$(date '+%F %T %Z')  PUSH FAILED" >> "$LOG"
  exit 1
fi
