#!/usr/bin/env bash
# Backup ~/.paperclip for VM standby / disaster recovery (no secrets printed).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ -f "$ROOT/docs/lab-mesh.env" ] && source "$ROOT/docs/lab-mesh.env" 2>/dev/null || true

SRC="${HOME}/.paperclip"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
ARCHIVE_ROOT="${STUDEX_ARCHIVE_ROOT:-$HOME/.studex/archive}"
DEST="${ARCHIVE_ROOT}/paperclip-backups/${STAMP}"

if [ ! -d "$SRC" ]; then
  echo "No ~/.paperclip on this host — run Paperclip onboard on Mac Mini or hub-gcp first." >&2
  exit 1
fi

mkdir -p "$DEST"
tar -czf "$DEST/paperclip-data.tar.gz" -C "$HOME" .paperclip
{
  echo "utc=$STAMP"
  echo "host=$(hostname -s 2>/dev/null || hostname)"
  echo "source=$SRC"
  echo "restore_hint=tar -xzf paperclip-data.tar.gz -C \$HOME"
} >"$DEST/README.txt"

echo "Backup: $DEST/paperclip-data.tar.gz"
echo "Sync this folder to Drive (agent-work-archive.sh or rclone) — never commit tarball to git."