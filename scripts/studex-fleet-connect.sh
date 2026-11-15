#!/usr/bin/env bash
# Connect this host + fleet VMs (SSM / Tailscale): Herdr, Hermes checks, Paperclip, optional Herdr machine add.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${HOME}/.local/bin:/usr/local/bin:${PATH}"

ENV_FILE="$ROOT/docs/lab-mesh.env"
SOFT_FAIL=false
HERDR_ADD=false
AUTOMEAT=false

while [ $# -gt 0 ]; do
  case "$1" in
    --soft-fail) SOFT_FAIL=true ;;
    --herdr-add-machines) HERDR_ADD=true ;;
    --automeat-check) AUTOMEAT=true ;;
    -h|--help)
      echo "usage: $0 [--soft-fail] [--herdr-add-machines] [--automeat-check]"
      exit 0
      ;;
    *) echo "unknown: $1" >&2; exit 2 ;;
  esac
  shift
done

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  echo "WARN: copy docs/lab-mesh.env.example → docs/lab-mesh.env"
fi

ROLE="${STUDEX_ROLE:-this-host}"
HOSTNAME_SHORT="$(hostname -s 2>/dev/null || hostname)"
FAILURES=0
pass() { echo "PASS  $1"; }
fail() { echo "FAIL  $1"; FAILURES=$((FAILURES + 1)); }
warn() { echo "WARN  $1"; }

echo "=== Studex fleet connect (role=$ROLE host=$HOSTNAME_SHORT) ==="
echo "Doc: docs/STUDEX_FLEET_MESH.md"
echo ""

if [ -x "$ROOT/scripts/claude-session-preflight.sh" ]; then
  echo ">>> Claude Code sessions"
  "$ROOT/scripts/claude-session-preflight.sh" || warn "claude session preflight"
fi

"$ROOT/scripts/studex-local-ops-up.sh" --soft-fail $([ "$AUTOMEAT" = true ] && echo --automeat-check || true) || FAILURES=$((FAILURES + 1))

PAPERCLIP_URL="${PAPERCLIP_URL:-http://127.0.0.1:3100}"

check_host() {
  local name="$1"
  local label="$2"
  [ -z "$name" ] && return 0
  if ping -c 1 -W 2 "$name" >/dev/null 2>&1; then
    pass "ping $label ($name)"
  else
    warn "no ping $label ($name)"
  fi
  if command -v ssh >/dev/null 2>&1; then
    if ssh -o BatchMode=yes -o ConnectTimeout=4 "$name" true 2>/dev/null; then
      pass "ssh $label"
    else
      warn "ssh $label (keys or host down)"
    fi
  fi
}

check_host "${LAB_HOST_DARK_FACTORY:-}" "dark-factory"
check_host "${LAB_HOST_NALEDSI:-}" "naledsi"
check_host "${LAB_HOST_MSI:-}" "msi"
check_host "${LAB_HOST_MACMIN:-}" "mac-mini"

herdr_add() {
  local ssh_target="$1"
  local label="$2"
  [ -z "$ssh_target" ] && return 0
  if ! command -v herdr >/dev/null 2>&1; then
    warn "herdr missing — skip machine add $label"
    return
  fi
  if herdr machine list 2>/dev/null | grep -q "$label"; then
    pass "herdr machine $label already saved"
    return
  fi
  if [ "$HERDR_ADD" != true ]; then
    warn "herdr machine $label not added (re-run with --herdr-add-machines)"
    return
  fi
  if herdr machine add "$ssh_target" --label "$label" 2>/dev/null; then
    pass "herdr machine add $label"
  else
    warn "herdr machine add $label failed (run interactive: herdr machine add $ssh_target --label \"$label\")"
  fi
}

herdr_add "${HERDR_SSH_DARK_FACTORY:-${LAB_HOST_DARK_FACTORY:-}}" "Dark Factory"
herdr_add "${HERDR_SSH_NALEDSI:-${LAB_HOST_NALEDSI:-}}" "Naledsi"
herdr_add "${HERDR_SSH_MSI:-${LAB_HOST_MSI:-}}" "MSI"

ARCHIVE="$HOME/.studex/archive/fleet/$(date -u +%Y%m%d-%H%M%S)"
mkdir -p "$ARCHIVE"
{
  echo "role=$ROLE"
  echo "host=$HOSTNAME_SHORT"
  echo "paperclip=$PAPERCLIP_URL"
  echo "failures=$FAILURES"
} >"$ARCHIVE/summary.txt"
pass "fleet snapshot $ARCHIVE"

echo ""
echo "=== Fleet next steps ==="
echo "  1. Tailscale: ensure dark-factory, naledsi, macmini on same tailnet"
echo "  2. Each VM: ./scripts/hermes-gateway-tmux.sh && tailscale serve --bg 8642"
echo "  3. Paperclip: invite Dark Factory + Naledsi Hermes gateways"
echo "  4. AutoMeat: Mac Mini only — ./scripts/studex-local-ops-up.sh --automeat-check"
echo "  5. Obsidian: copy integrations/obsidian-herdr/*.example → vault herdr/"
echo ""

if [ "$FAILURES" -gt 0 ] && [ "$SOFT_FAIL" != true ]; then
  echo "Fleet connect: $FAILURES failure(s)."
  exit 1
fi
echo "Fleet connect finished ($FAILURES hard failures in nested ops; see above)."