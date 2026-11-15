#!/usr/bin/env bash
# Phone + Hermes mesh preflight (Tailscale host optional).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/docs/lab-mesh.env"
[ -f "$ENV_FILE" ] && set -a && source "$ENV_FILE" && set +a

pass() { echo "PASS  $1"; }
warn() { echo "WARN  $1"; }

PHONE="${LAB_HOST_PHONE:-}"
PAPERCLIP_URL="${PAPERCLIP_URL:-http://macmini:3100}"
HOME_HUB_URL="${HOME_HUB_URL:-http://macmini:3088}"

echo "=== Hermes phone mesh preflight ==="
echo "Doc: docs/HERMES_PHONE.md"
echo ""

if [ -n "$PHONE" ]; then
  if ping -c 1 -W 2 "$PHONE" >/dev/null 2>&1; then
    pass "ping phone host $PHONE"
  else
    warn "no ping to $PHONE (offline or MagicDNS off)"
  fi
else
  warn "set LAB_HOST_PHONE in docs/lab-mesh.env"
fi

for url in "$PAPERCLIP_URL" "$HOME_HUB_URL"; do
  if curl -fsS -m 4 "${url%/}/api/health" >/dev/null 2>&1; then
    pass "health $url"
  else
    warn "no health at $url/api/health (hub must be on tailnet)"
  fi
done

echo ""
echo "On phone: Hermes + Tailscale; Paperclip tasks via Mac Mini :3100"
echo "Desktop pstack: /add-plugin pstack on Cursor (ZTE-001)"