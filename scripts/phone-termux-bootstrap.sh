#!/usr/bin/env bash
# Run inside Termux on Android after shallow clone of Portable-agents.
# No secrets; health checks only over Tailscale (Android VPN mode).
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PAPERCLIP_URL="${PAPERCLIP_URL:-http://macmini:3100}"
HOME_HUB_URL="${HOME_HUB_URL:-http://macmini:3088}"

echo "=== Phone Termux bootstrap (Studex) ==="
echo "Doc: docs/PHONE_OS_TAILSCALE.md"
echo "repo=$ROOT"
echo ""

pass() { echo "PASS  $1"; }
warn() { echo "WARN  $1"; }

command -v curl >/dev/null 2>&1 && pass "curl" || warn "install: pkg install curl"
command -v git >/dev/null 2>&1 && pass "git" || warn "install: pkg install git"

for url in "$PAPERCLIP_URL" "$HOME_HUB_URL"; do
  if curl -fsS -m 8 "${url%/}/api/health" >/dev/null 2>&1; then
    pass "health $url"
  else
    warn "no health at $url — enable Tailscale on phone; check MagicDNS macmini"
  fi
done

if command -v tailscale >/dev/null 2>&1; then
  tailscale status 2>/dev/null | head -5 || warn "tailscale status failed"
else
  warn "Termux tailscale optional — use Android Tailscale app + curl above"
fi

command -v claude >/dev/null 2>&1 && pass "claude CLI" || warn "claude not installed here (normal on phone) — use Hermes app; run Claude on Mac/MSI"

echo ""
echo "Next: Hermes app + Paperclip task_bridge (docs/HERMES_PHONE.md)"
echo "For claude CLI on MSI/WSL only: ./scripts/install-claude-cli.sh"
echo "Hub runs: ./scripts/phone-os-preflight.sh with LAB_HOST_PHONE set"