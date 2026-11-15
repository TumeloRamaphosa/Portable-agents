#!/usr/bin/env bash
# Stand up local Studex ops: Herdr, Hermes integrations, Paperclip/Hermes preflight, optional AutoMeat.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${HOME}/.local/bin:/usr/local/bin:${PATH}"

ENV_FILE="$ROOT/docs/lab-mesh.env"
START_GATEWAY=false
AUTOMEAT_CHECK=false
SOFT_FAIL=false

while [ $# -gt 0 ]; do
  case "$1" in
    --start-hermes-gateway) START_GATEWAY=true ;;
    --automeat-check) AUTOMEAT_CHECK=true ;;
    --soft-fail) SOFT_FAIL=true ;;
    -h|--help)
      echo "usage: $0 [--start-hermes-gateway] [--automeat-check] [--soft-fail]"
      exit 0 ;;
    *) echo "unknown: $1" >&2; exit 2 ;;
  esac
  shift
done

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  echo "=== sourced docs/lab-mesh.env ==="
fi

PAPERCLIP_URL="${PAPERCLIP_URL:-http://127.0.0.1:3100}"
FAILURES=0

step() {
  echo ""
  echo ">>> $1"
}

fail() { FAILURES=$((FAILURES + 1)); echo "FAIL: $1"; }
pass() { echo "PASS: $1"; }

step "Herdr server"
if [ -x "$ROOT/scripts/herdr-server-start.sh" ]; then
  "$ROOT/scripts/herdr-server-start.sh" || fail "herdr server start"
fi
if command -v herdr >/dev/null 2>&1 && herdr status 2>/dev/null | grep -q 'status: running'; then
  pass "herdr server running"
else
  fail "herdr not running"
fi

step "Herdr agent integrations"
if command -v herdr >/dev/null 2>&1; then
  if command -v claude >/dev/null 2>&1; then
    mkdir -p "$HOME/.claude/hooks"
    herdr integration install claude 2>/dev/null && pass "herdr + claude integration" || fail "herdr claude integration"
  else
    echo "WARN: claude not on PATH"
  fi
  if command -v hermes >/dev/null 2>&1; then
    herdr integration install hermes 2>/dev/null && pass "herdr + hermes integration" || fail "herdr hermes integration"
  else
    echo "WARN: hermes not on PATH — curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash"
  fi
  herdr integration status 2>/dev/null | sed -n '1,6p' || true
fi

step "Paperclip preflight"
if [ -x "$ROOT/scripts/agent-fleet-check.sh" ]; then
  if "$ROOT/scripts/agent-fleet-check.sh" paperclip "$PAPERCLIP_URL"; then
    pass "paperclip preflight"
  else
    fail "paperclip preflight ($PAPERCLIP_URL)"
  fi
fi

step "Hermes preflight"
if command -v hermes >/dev/null 2>&1 && [ -x "$ROOT/scripts/agent-fleet-check.sh" ]; then
  if "$ROOT/scripts/agent-fleet-check.sh" hermes "$PAPERCLIP_URL"; then
    pass "hermes fleet check"
  else
    if [ "$START_GATEWAY" = true ]; then
      step "Starting Hermes gateway (tmux)"
      "$ROOT/scripts/hermes-gateway-tmux.sh" || fail "hermes gateway tmux"
      sleep 3
      if "$ROOT/scripts/agent-fleet-check.sh" hermes "$PAPERCLIP_URL"; then
        pass "hermes after gateway start"
      else
        fail "hermes still not healthy"
      fi
    else
      fail "hermes not ready (re-run with --start-hermes-gateway)"
    fi
  fi
elif [ "$START_GATEWAY" = true ]; then
  echo "WARN: hermes not installed"
fi

step "Lab mesh preflight"
if [ -x "$ROOT/scripts/lab-mesh-preflight.sh" ]; then
  "$ROOT/scripts/lab-mesh-preflight.sh" || fail "lab-mesh-preflight"
fi

step "Factory status"
if command -v npm >/dev/null 2>&1; then
  npm run factory:status 2>/dev/null || echo "WARN: factory:status"
fi

if [ "$AUTOMEAT_CHECK" = true ]; then
  step "AutoMeat deploy checks"
  if [ -x "$ROOT/scripts/deploy-automeat-clickclack.sh" ]; then
    export CLICKCLACK_URL="${CLICKCLACK_URL:-$PAPERCLIP_URL}"
    if "$ROOT/scripts/deploy-automeat-clickclack.sh"; then
      pass "automeat deploy script"
    else
      fail "automeat deploy (set AUTOMEAT_ENV_FILE + AUTOMEAT_REGISTER_JSON on Mac hub)"
    fi
  fi
fi

echo ""
echo "=== Next steps ==="
echo "  herdr                          # attach UI; workspaces: automeat, studex-ops, portable-agents"
echo "  In pane: hermes  or  claude"
echo "  Paperclip: $PAPERCLIP_URL"
echo "  AutoMeat: docs/deployments/AUTOMEAT_CLICKCLACK.md"
echo "  Obsidian: herdr/automeat.md from integrations/obsidian-herdr/*.example"
echo ""

if [ "$FAILURES" -gt 0 ]; then
  echo "Local ops: $FAILURES failure(s)."
  [ "$SOFT_FAIL" = true ] && exit 0 || exit 1
fi
echo "Local ops: stand-up complete (fix WARNs on hub Mac for Paperclip/AutoMeat)."