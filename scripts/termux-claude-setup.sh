#!/usr/bin/env bash
# Android Termux (or proot Linux on phone): put `claude` on PATH.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -n "${TERMUX_VERSION:-}" ]; then
  echo "=== Termux detected ==="
  pkg update -y
  pkg install -y nodejs git curl openssl
  export CLAUDE_NPM_PREFIX="${PREFIX:-/data/data/com.termux/files/usr}"
else
  echo "=== Linux on phone (proot / UserLAnd) ==="
  if ! command -v node >/dev/null 2>&1; then
    echo "Install nodejs first (apt install nodejs npm), then re-run." >&2
    exit 1
  fi
fi

bash "$ROOT/scripts/install-claude-cli.sh"
"$ROOT/scripts/install-claude-cli-path.sh"

echo ""
echo "=== Reload shell ==="
echo "  source ~/.bashrc"
echo "  claude --version"
echo "  claude auth login"
echo ""
if command -v herdr >/dev/null 2>&1; then
  herdr integration install claude 2>/dev/null || true
  echo "Herdr: start herdr and open a pane named claude"
else
  echo "Herdr optional on phone — Hermes app handles most agent chat."
fi