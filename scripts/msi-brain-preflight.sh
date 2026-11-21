#!/usr/bin/env bash
# MSI brain stack preflight — run ON the MSI (WSL). No secrets printed.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ -f "$ROOT/docs/lab-mesh.env" ] && source "$ROOT/docs/lab-mesh.env" || true

echo "=== MSI brain preflight ==="
echo "role=${STUDEX_ROLE:-unset} host=$(hostname -s 2>/dev/null || hostname)"

fail=0
warn=0

if [ -d "$ROOT/.git" ]; then
  echo "PASS  Portable-agents repo at $ROOT"
  git -C "$ROOT" rev-parse --short HEAD
else
  echo "FAIL  not a git repo: $ROOT"
  fail=$((fail + 1))
fi

if command -v herdr >/dev/null 2>&1; then
  echo "PASS  herdr CLI"
else
  echo "FAIL  herdr missing"
  fail=$((fail + 1))
fi

if [ -S "${HERDR_SOCKET_PATH:-$HOME/.config/herdr/herdr.sock}" ]; then
  echo "PASS  herdr socket"
else
  echo "WARN  herdr socket not running"
  warn=$((warn + 1))
fi

command -v claude >/dev/null 2>&1 && echo "PASS  claude" || { echo "WARN  claude missing"; warn=$((warn + 1)); }
command -v ollama >/dev/null 2>&1 && echo "PASS  ollama" || { echo "WARN  ollama missing"; warn=$((warn + 1)); }

"$ROOT/scripts/llm-mesh-preflight.sh" || fail=$((fail + 1))

if [ -n "${AUTOMEAT_VAULT_PATH:-}" ] && [ -d "$AUTOMEAT_VAULT_PATH" ]; then
  echo "PASS  vault path exists"
else
  echo "WARN  AUTOMEAT_VAULT_PATH unset or missing"
  warn=$((warn + 1))
fi

echo "--- failures=$fail warnings=$warn ---"
[ "$fail" -eq 0 ]