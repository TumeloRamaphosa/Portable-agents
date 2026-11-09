#!/usr/bin/env bash
# Stage sanitized agent/deploy artifacts for Google Drive sync (no secrets).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/docs/lab-mesh.env"
DRY=false
[ "${1:-}" = "--dry-run" ] && DRY=true

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

FOLDER_ID="${GDRIVE_ARCHIVE_FOLDER_ID:-16Ke46oCGb_Xd0CmlL9bjDtXEvgmKsEmR}"
ARCHIVE_ROOT="${STUDEX_ARCHIVE_ROOT:-$HOME/.studex/archive}"
HOST_TAG="$(hostname -s 2>/dev/null || hostname)"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
DEST="$ARCHIVE_ROOT/$HOST_TAG/$STAMP"
mkdir -p "$DEST/deploy" "$DEST/studbot" "$DEST/hermes"

{
  echo "host=$HOST_TAG"
  echo "utc=$STAMP"
  echo "repo=$ROOT"
  echo "gdrive_folder_id=$FOLDER_ID"
  echo "gdrive_url=https://drive.google.com/drive/folders/$FOLDER_ID"
} >"$DEST/MANIFEST.txt"

( cd "$ROOT" && git rev-parse HEAD 2>/dev/null || echo "no-git" ) >"$DEST/deploy/git-head.txt"
( cd "$ROOT" && git status -sb 2>/dev/null || true ) >"$DEST/deploy/git-status.txt"
if [ -x "$ROOT/scripts/lab-mesh-preflight.sh" ]; then
  "$ROOT/scripts/lab-mesh-preflight.sh" >"$DEST/deploy/lab-mesh-preflight.txt" 2>&1 || true
fi
if command -v npm >/dev/null 2>&1; then
  ( cd "$ROOT" && npm run factory:status >"$DEST/deploy/factory-status.txt" 2>&1 ) || true
fi

# Studbot hints only — no APK secrets
if [ -d "$ROOT/studbot-android" ]; then
  ls -la "$ROOT/studbot-android" >"$DEST/studbot/dir-listing.txt" 2>/dev/null || true
fi

# Hermes: never copy .env; optional doctor one-liner
if command -v hermes >/dev/null 2>&1; then
  hermes doctor >"$DEST/hermes/doctor.txt" 2>&1 || true
fi

echo "Staged: $DEST"
echo "Drive folder: https://drive.google.com/drive/folders/$FOLDER_ID"

RCLONE_REMOTE="${GDRIVE_RCLONE_REMOTE:-gdrive}"
RCLONE_PATH="${GDRIVE_RCLONE_PATH:-Lenovo/studex-archive}"

if [ "$DRY" = true ]; then
  echo "Dry run — not uploading. Sync this folder with Google Drive Desktop or rclone."
  exit 0
fi

if command -v rclone >/dev/null 2>&1; then
  rclone copy "$DEST" "$RCLONE_REMOTE:$RCLONE_PATH/$HOST_TAG/$STAMP" -v
  echo "Uploaded via rclone to $RCLONE_REMOTE:$RCLONE_PATH/$HOST_TAG/$STAMP"
else
  echo "Install rclone or point Google Drive Desktop at: $ARCHIVE_ROOT"
fi
