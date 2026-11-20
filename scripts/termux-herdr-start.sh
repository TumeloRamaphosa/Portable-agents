#!/usr/bin/env bash
# Quick start Herdr on Termux with PATH fixed.
set -euo pipefail
export PATH="${HOME}/.local/bin:${PREFIX:-}/bin:$PATH"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

[ -f "${HOME}/.bashrc" ] && grep -q studex-claude-code-path "${HOME}/.bashrc" 2>/dev/null && source "${HOME}/.bashrc" || true

if ! command -v herdr >/dev/null 2>&1; then
  echo "herdr missing — run: bash $ROOT/scripts/termux-hermes-herdr-setup.sh" >&2
  exit 1
fi

cd "$ROOT"
exec herdr