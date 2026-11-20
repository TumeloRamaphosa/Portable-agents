#!/usr/bin/env bash
# Build NOTION_PASTE.md — fleet + factory + Paperclip for Notion daily / VM registry.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/docs/lab-mesh.env"
[ -f "$ENV_FILE" ] && set -a && source "$ENV_FILE" 2>/dev/null && set +a

SLOT="${1:-am}"
ARCHIVE_ROOT="${STUDEX_ARCHIVE_ROOT:-$HOME/.studex/archive}"
HOST_TAG="$(hostname -s 2>/dev/null || hostname)"
DATE_LOCAL="$(date +%Y-%m-%d)"
DEST="$ARCHIVE_ROOT/$HOST_TAG/${DATE_LOCAL}-ops-${SLOT}"
mkdir -p "$DEST/ops"

FACTORY="$DEST/ops/factory-status.txt"
npm --prefix "$ROOT" run factory:status >"$FACTORY" 2>&1 || true

PAPERCLIP_URL="${PAPERCLIP_URL:-http://macmini:3100}"
PC_HEALTH="unknown"
if curl -fsS -m 5 "${PAPERCLIP_URL%/}/api/health" >/dev/null 2>&1; then
  PC_HEALTH="ok"
else
  PC_HEALTH="down or unreachable"
fi

FLEET="$DEST/ops/fleet.txt"
if [ -x "$ROOT/scripts/studex-fleet-connect.sh" ]; then
  "$ROOT/scripts/studex-fleet-connect.sh" --soft-fail >"$FLEET" 2>&1 || true
else
  echo "fleet script missing" >"$FLEET"
fi

cat >"$DEST/ops/NOTION_PASTE.md" <<EOF
# Ops status — ${DATE_LOCAL} (${SLOT}) — paste into Notion

## What needs building (factory queue)
\`\`\`
$(head -n 40 "$FACTORY")
\`\`\`
Full: \`npm run factory:status\` · git: \`factory/intake/queue.json\`

**Factory Board:** move cards to match ZTE stage → https://app.notion.com/p/40618048b07f47e79b9da946e7705b6b

## VMs + agents up
- Paperclip ${PAPERCLIP_URL}: **${PC_HEALTH}**
- VM Registry (update Status / Last verified): https://app.notion.com/p/41b3ef073992811bbd0ac2201d2e5f1d
- Virtual Machine Command: https://app.notion.com/p/41e3ef07399280d6ac21da4b39f9d1bf

### Fleet ping (tailnet)
\`\`\`
$(grep -E '^(PASS|WARN|FAIL)' "$FLEET" 2>/dev/null | head -25 || echo "run fleet:connect from Mac with lab-mesh.env")
\`\`\`

## Progress today
- ZTE touched:
- Factory Board Stage changes:
- Evidence links added:

## Obsidian Herdr
- Active checklist: herdr/____________.md
- Next ▶ step:

---
Doc: docs/NOTION_OBSIDIAN_OPS_BRIDGE.md
EOF

echo "Wrote: $DEST/ops/NOTION_PASTE.md"
cat "$DEST/ops/NOTION_PASTE.md"