#!/usr/bin/env bash
# Studex lab mesh preflight — reads docs/lab-mesh.env if present. No secret output.
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
  warn "docs/lab-mesh.env missing — copy from docs/lab-mesh.env.example"
fi

if command -v tailscale >/dev/null 2>&1 && tailscale ip -4 >/dev/null 2>&1; then
  pass "tailscale connected ($(tailscale ip -4 2>/dev/null | head -1))"
else
  fail "tailscale not connected on this host"
fi

PAPERCLIP_URL="${PAPERCLIP_URL:-http://localhost:3100}"
PAPERCLIP_URL="${PAPERCLIP_URL%/}"
if curl -fsS -m 6 "$PAPERCLIP_URL/api/health" 2>/dev/null | grep -Eq '"status"[[:space:]]*:[[:space:]]*"ok"'; then
  pass "Paperclip healthy at $PAPERCLIP_URL"
else
  fail "Paperclip not healthy at $PAPERCLIP_URL/api/health"
fi

for host in "$LAB_HOST_MACMIN" "$LAB_HOST_MACBOOK" "$LAB_HOST_MSI" "$LAB_HOST_LENOVO"; do
  [ -z "${host:-}" ] && continue
  if ping -c 1 -W 2 "$host" >/dev/null 2>&1; then
    pass "ping $host"
  else
    warn "no ping to $host (MagicDNS off or host offline)"
  fi
done

echo
if [ "$FAILS" -eq 0 ]; then
  echo "Lab mesh: no hard failures on this host."
else
  echo "Lab mesh: $FAILS failure(s) on this host."
  exit 1
fi
