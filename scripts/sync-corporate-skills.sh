#!/usr/bin/env bash
# Cherry-pick corporate Claude skills into .cursor/skills/studex-corporate/
# Source: https://github.com/w95/awesome-claude-corporate-skills
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/.cursor/skills/studex-corporate"
TMP="${TMPDIR:-/tmp}/awesome-claude-corporate-skills"
REPO="https://github.com/w95/awesome-claude-corporate-skills.git"

if [ ! -d "$TMP/.git" ]; then
  git clone --depth 1 "$REPO" "$TMP"
fi

mkdir -p "$DEST"
for dir in 00-meta/skill-creator 07-operations 08-it-engineering; do
  src="$TMP/$dir"
  if [ -d "$src" ]; then
    rsync -a --delete "$src/" "$DEST/$(basename "$dir")/"
    echo "Synced $dir → $DEST/$(basename "$dir")/"
  fi
done

echo "Done. Skills in $DEST (gitignored if under .cursor — copy SKILL paths to Cursor settings)."
echo "Full catalog: $REPO"
