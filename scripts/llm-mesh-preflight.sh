#!/usr/bin/env bash
# LLM mesh preflight — Ollama + OmniRoute (+ optional LiteLLM). No secrets printed.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ -f "$ROOT/docs/lab-mesh.env" ] && source "$ROOT/docs/lab-mesh.env" || true

OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
OMNIROUTE_URL="${OMNIROUTE_URL:-http://127.0.0.1:20128/v1}"
LITELLM_URL="${LITELLM_URL:-http://127.0.0.1:4000/v1}"

ok=0
fail=0
check() {
  local name="$1" url="$2"
  if curl -fsS --max-time 4 "$url" >/dev/null 2>&1; then
    echo "PASS  $name"
    ok=$((ok + 1))
  else
    echo "FAIL  $name (no HTTP response at $url)"
    fail=$((fail + 1))
  fi
}

echo "=== LLM mesh preflight (role=${STUDEX_ROLE:-unset}) ==="
check "Ollama tags" "${OLLAMA_HOST%/}/api/tags"
if [ -n "${OMNIROUTE_API_KEY:-}" ]; then
  if curl -fsS --max-time 6 -H "Authorization: Bearer $OMNIROUTE_API_KEY" \
    "${OMNIROUTE_URL%/}/models" >/dev/null 2>&1; then
    echo "PASS  OmniRoute /v1/models"
    ok=$((ok + 1))
  else
    echo "FAIL  OmniRoute /v1/models"
    fail=$((fail + 1))
  fi
else
  echo "SKIP  OmniRoute (OMNIROUTE_API_KEY unset)"
fi
if curl -fsS --max-time 4 "${LITELLM_URL%/}/health" >/dev/null 2>&1; then
  echo "PASS  LiteLLM (optional)"
  ok=$((ok + 1))
else
  echo "SKIP  LiteLLM (not running on :4000)"
fi
command -v herdr >/dev/null 2>&1 && echo "PASS  herdr CLI" || echo "WARN  herdr not on PATH"
[ -S "${HERDR_SOCKET_PATH:-$HOME/.config/herdr/herdr.sock}" ] && echo "PASS  herdr socket" || echo "WARN  herdr socket missing"

echo "--- done: $ok passed, $fail failed ---"
exit $(( fail > 0 ? 1 : 0 ))