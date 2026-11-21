#!/usr/bin/env bash
# Read-only preflight for the Paperclip + Hermes setup in docs/AGENT_COMPANY_SETUP.md.
# Never prints key values.
#
#   scripts/agent-fleet-check.sh paperclip [paperclip-url]
#   scripts/agent-fleet-check.sh hermes <paperclip-url>
set -uo pipefail

FAILS=0
pass() { printf 'PASS  %s\n' "$1"; }
warn() { printf 'WARN  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; FAILS=$((FAILS + 1)); }

usage() {
  echo "usage: $0 paperclip [paperclip-url] | hermes <paperclip-url>" >&2
  exit 2
}

healthy() {
  curl -fsS -m 5 "$1" 2>/dev/null | grep -Eq '"status"[[:space:]]*:[[:space:]]*"ok"'
}

check_paperclip_url() {
  local url="${1%/}"
  url="${url%/api}"
  if healthy "$url/api/health"; then
    pass "Paperclip healthy at $url"
  else
    fail "Paperclip not healthy at $url/api/health"
  fi
}

check_node() {
  local version major minor
  if ! command -v node >/dev/null 2>&1; then
    fail "node not installed (Paperclip needs 24.11+)"
    return
  fi
  version="$(node --version)"
  major="${version#v}"; major="${major%%.*}"
  minor="${version#v*.}"; minor="${minor%%.*}"
  if [ "$major" -gt 24 ] || { [ "$major" -eq 24 ] && [ "$minor" -ge 11 ]; }; then
    pass "node $version"
  else
    fail "node $version is too old (Paperclip needs 24.11+)"
  fi
}

check_tailscale() {
  if ! command -v tailscale >/dev/null 2>&1; then
    warn "tailscale not installed (needed to link machines)"
  elif tailscale ip -4 >/dev/null 2>&1; then
    pass "tailscale connected"
  else
    warn "tailscale installed but not connected"
  fi
}

# Prints the last value of KEY in the Hermes env file, without surrounding quotes.
env_value() {
  grep -E "^$1=" "$HERMES_ENV" 2>/dev/null | tail -n 1 | cut -d= -f2- | tr -d "\"'"
}

check_hermes() {
  local hermes_home="${HERMES_HOME:-$HOME/.hermes}"
  local config="$hermes_home/config.yaml"
  local key host port mode
  HERMES_ENV="$hermes_home/.env"

  if command -v hermes >/dev/null 2>&1; then
    pass "hermes installed"
  else
    fail "hermes not installed"
  fi

  if grep -qi 'minimax' "$config" 2>/dev/null; then
    pass "MiniMax found in $config"
  else
    fail "MiniMax not found in $config (run: hermes model)"
  fi

  if [ ! -f "$HERMES_ENV" ]; then
    fail "$HERMES_ENV missing"
    return
  fi

  mode="$(stat -c '%a' "$HERMES_ENV" 2>/dev/null || stat -f '%Lp' "$HERMES_ENV" 2>/dev/null)"
  if [ "$mode" = "600" ]; then
    pass "$HERMES_ENV has mode 600"
  else
    fail "$HERMES_ENV has mode $mode (run: chmod 600 $HERMES_ENV)"
  fi

  if [ "$(env_value API_SERVER_ENABLED)" = "true" ]; then
    pass "API server enabled"
  else
    fail "API_SERVER_ENABLED is not true"
  fi

  key="$(env_value API_SERVER_KEY)"
  if [ -z "$key" ] || [ "$key" = "change-me-local-dev" ]; then
    fail "API_SERVER_KEY is missing or still the sample value"
  elif [ "${#key}" -lt 32 ]; then
    fail "API_SERVER_KEY is shorter than 32 characters"
  else
    pass "API_SERVER_KEY set"
  fi

  host="$(env_value API_SERVER_HOST)"
  case "${host:-127.0.0.1}" in
    127.0.0.1|localhost|::1) pass "API server limited to loopback" ;;
    *) fail "API_SERVER_HOST is $host; keep it on 127.0.0.1 and use tailscale serve" ;;
  esac

  port="$(env_value API_SERVER_PORT)"
  port="${port:-8642}"
  if healthy "http://127.0.0.1:$port/health"; then
    pass "Hermes gateway healthy on port $port"
  else
    fail "Hermes gateway not healthy on port $port (run: hermes gateway run --replace --accept-hooks)"
  fi
}

case "${1:-}" in
  paperclip)
    [ "$#" -le 2 ] || usage
    check_node
    check_paperclip_url "${2:-http://localhost:3100}"
    if [ -d "$HOME/.paperclip" ]; then
      pass "existing Paperclip data in ~/.paperclip"
    else
      warn "no ~/.paperclip here; this may be the wrong machine"
    fi
    check_tailscale
    ;;
  hermes)
    [ "$#" -eq 2 ] || usage
    check_hermes
    check_paperclip_url "$2"
    check_tailscale
    ;;
  *)
    usage
    ;;
esac

echo
if [ "$FAILS" -eq 0 ]; then
  echo "Ready: no failures."
else
  echo "Not ready: $FAILS failure(s)."
  exit 1
fi
