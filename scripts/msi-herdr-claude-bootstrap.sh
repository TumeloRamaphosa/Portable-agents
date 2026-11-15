#!/usr/bin/env bash
# One-shot on MSI (Linux/Bazzite) or WSL — Herdr + Claude + Studex clone path.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

"$ROOT/scripts/install-herdr.sh"

if ! command -v claude >/dev/null 2>&1; then
  if command -v npm >/dev/null 2>&1; then
    npm install -g @anthropic-ai/claude-code --allow-scripts @anthropic-ai/claude-code 2>/dev/null \
      || npm install -g @anthropic-ai/claude-code
    export PATH="$HOME/.local/bin:$PATH"
  else
    echo "Install Node/npm, then re-run" >&2
    exit 1
  fi
fi

mkdir -p "$HOME/.claude/hooks"
herdr integration install claude 2>/dev/null || true

echo ""
echo "Next steps on MSI:"
echo "  1. claude auth login"
echo "  2. herdr                    # start UI; detach Ctrl+b q"
echo "  3. ./scripts/herdr-server-start.sh   # headless server only"
echo "  4. From MacBook: herdr machine add <ssh-msi-host> --label MSI"
echo "See docs/HERDR_MSI_PAIRING.md"