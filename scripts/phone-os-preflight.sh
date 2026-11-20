#!/usr/bin/env bash
# Phone node on tailnet — run from Mac / MSI / GCE (not on phone required).
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/docs/lab-mesh.env"
[ -f "$ENV_FILE" ] && set -a && source "$ENV_FILE" && set +a

pass() { echo "PASS  $1"; }
warn() { echo "WARN  $1"; }
fail() { echo "FAIL  $1"; FAIL=1; }
FAIL=0

PHONE="${LAB_HOST_PHONE:-}"
PHONE_OS="${PHONE_OS:-unset}"
PAPERCLIP_URL="${PAPERCLIP_URL:-http://macmini:3100}"
HOME_HUB_URL="${HOME_HUB_URL:-http://macmini:3088}"

echo "=== Phone OS + Tailscale preflight ==="
echo "Doc: docs/PHONE_OS_TAILSCALE.md"
echo "PHONE_OS=$PHONE_OS"
echo ""

command -v tailscale >/dev/null 2>&1 && pass "tailscale CLI on this host" || warn "install tailscale on hub dev box"

if [ -n "$PHONE" ]; then
  if tailscale ping -c 1 "$PHONE" >/dev/null 2>&1; then
    pass "tailscale ping $PHONE"
  elif ping -c 1 -W 2 "$PHONE" >/dev/null 2>&1; then
    pass "icmp ping $PHONE"
  else
    warn "phone $PHONE unreachable (off tailnet or wrong MagicDNS name)"
  fi
  if command -v ssh >/dev/null 2>&1; then
    if ssh -o BatchMode=yes -o ConnectTimeout=5 "$PHONE" true 2>/dev/null; then
      pass "tailscale ssh $PHONE"
    else
      warn "ssh $PHONE — expected for Termux+sshd only"
    fi
  fi
else
  warn "set LAB_HOST_PHONE in docs/lab-mesh.env"
fi

for url in "$PAPERCLIP_URL" "$HOME_HUB_URL"; do
  if curl -fsS -m 5 "${url%/}/api/health" >/dev/null 2>&1; then
    pass "agent reach hub $url"
  else
    warn "no health $url (Paperclip/home hub down or not on tailnet)"
  fi
done

"$ROOT/scripts/hermes-phone-preflight.sh" || true

echo "--- phone-os preflight complete (fail=$FAIL) ---"
[ "$FAIL" -eq 0 ]