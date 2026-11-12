#!/usr/bin/env bash
# MSI Buzz + Studex preflight — no secret output.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/docs/lab-mesh.env"
FAILS=0
pass() { printf 'PASS  %s\n' "$1"; }
warn() { printf 'WARN  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; FAILS=$((FAILS + 1)); }

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  pass "sourced docs/lab-mesh.env"
else
  warn "docs/lab-mesh.env missing"
fi

RELAY="${BUZZ_RELAY_URL:-http://127.0.0.1:3000}"
RELAY="${RELAY%/}"
if curl -fsS -m 5 "$RELAY" >/dev/null 2>&1 || curl -fsS -m 5 "$RELAY/health" >/dev/null 2>&1; then
  pass "Buzz relay reachable at $RELAY"
else
  warn "Buzz relay not reachable at $RELAY (desktop may still use remote relay)"
fi

if command -v buzz >/dev/null 2>&1; then
  pass "buzz CLI on PATH"
else
  warn "buzz CLI not on PATH (optional; link from Buzz.app on macOS)"
fi

NODE_V=""
if command -v node >/dev/null 2>&1; then
  NODE_V="$(node -v 2>/dev/null || true)"
  pass "node $NODE_V"
else
  warn "node not found (needed for Pi harness / OpenClaw)"
fi

if [ -d "$ROOT/.git" ]; then
  pass "Portable-agents repo at $ROOT"
else
  fail "not a git checkout: $ROOT"
fi

if command -v hermes >/dev/null 2>&1; then
  pass "hermes installed"
else
  warn "hermes not installed (Paperclip worker)"
fi

if command -v tailscale >/dev/null 2>&1 && tailscale ip -4 >/dev/null 2>&1; then
  pass "tailscale $(tailscale ip -4 2>/dev/null | head -1)"
else
  fail "tailscale not connected"
fi

echo
if [ "$FAILS" -eq 0 ]; then
  echo "MSI Buzz preflight: no hard failures."
else
  echo "MSI Buzz preflight: $FAILS failure(s)."
  exit 1
fi
