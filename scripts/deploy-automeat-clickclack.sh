#!/usr/bin/env bash
# Register AutoMeat on ClickClack/Paperclip (:3100). Never prints secrets.
# See docs/deployments/AUTOMEAT_CLICKCLACK.md
set -euo pipefail

CLICKCLACK_URL="${CLICKCLACK_URL:-http://localhost:3100}"
CLICKCLACK_URL="${CLICKCLACK_URL%/}"

ok=true
report() { printf '%s\n' "$1"; }

fail_step() {
  ok=false
  report "FAIL  $1"
}

pass_step() { report "PASS  $1"; }

# Load env file without echoing values
load_env_file() {
  local f="$1"
  if [ ! -f "$f" ]; then
    fail_step "env file missing: $f"
    return 1
  fi
  set -a
  # shellcheck disable=SC1090
  source "$f"
  set +a
  pass_step "loaded env file (values not shown)"
}

token_from_env() {
  if [ -n "${CLICKCLACK_TOKEN:-}" ]; then
    printf '%s' "$CLICKCLACK_TOKEN"
  elif [ -n "${PAPERCLIP_TOKEN:-}" ]; then
    printf '%s' "$PAPERCLIP_TOKEN"
  else
    return 1
  fi
}

check_health() {
  if curl -fsS -m 8 "$CLICKCLACK_URL/api/health" 2>/dev/null | grep -Eq '"status"[[:space:]]*:[[:space:]]*"ok"'; then
    pass_step "ClickClack/Paperclip healthy at $CLICKCLACK_URL"
  else
    fail_step "not healthy at $CLICKCLACK_URL/api/health — start control plane first"
  fi
}

register_agent() {
  local json_path="${AUTOMEAT_REGISTER_JSON:-}"
  local token
  if [ -z "$json_path" ] || [ ! -f "$json_path" ]; then
    fail_step "AUTOMEAT_REGISTER_JSON must point to a local JSON file"
    return
  fi
  token="$(token_from_env)" || {
    fail_step "CLICKCLACK_TOKEN or PAPERCLIP_TOKEN not set in env file"
    return
  }
  local code
  code="$(curl -sS -o /tmp/automeat-register.out -w '%{http_code}' \
    -X POST "$CLICKCLACK_URL/api/agents/register" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    --data-binary "@$json_path")"
  if [ "$code" -ge 200 ] && [ "$code" -lt 300 ]; then
    pass_step "POST /api/agents/register HTTP $code"
  else
    fail_step "POST /api/agents/register HTTP $code (see /tmp/automeat-register.out locally)"
  fi
}

verify_listed() {
  local token
  token="$(token_from_env)" || return
  if curl -fsS -m 8 "$CLICKCLACK_URL/api/agents/list" \
    -H "Authorization: Bearer $token" 2>/dev/null | grep -q 'automeat-agent'; then
    pass_step "automeat-agent listed"
  else
    fail_step "automeat-agent not found in /api/agents/list"
  fi
}

check_twilio_config() {
  if [ -n "${TWILIO_ACCOUNT_SID:-}" ] && [ -n "${TWILIO_AUTH_TOKEN:-}" ]; then
    pass_step "Twilio vars present (no test call made)"
  else
    fail_step "Twilio SID/token not set in env"
  fi
}

check_vault_path() {
  local vault="${AUTOMEAT_VAULT_PATH:-/Users/tumeloramaphosa/Documents/Obsidian Vault/Auto-Meat}"
  if [ -d "$vault" ]; then
    pass_step "vault directory exists: $vault"
  else
    fail_step "vault directory missing: $vault"
  fi
}

vault_sync_dry() {
  local token
  token="$(token_from_env)" || return
  local code
  code="$(curl -sS -o /tmp/automeat-vault.out -w '%{http_code}' \
    -X POST "$CLICKCLACK_URL/api/vault/sync" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d '{"agent":"automeat-agent"}' 2>/dev/null || echo "000")"
  if [ "$code" = "404" ] || [ "$code" = "000" ]; then
    report "WARN  /api/vault/sync not available (HTTP $code) — configure when API exists"
  elif [ "$code" -ge 200 ] && [ "$code" -lt 300 ]; then
    pass_step "vault sync HTTP $code"
  else
    fail_step "vault sync HTTP $code"
  fi
}

report "=== AutoMeat → ClickClack deploy ==="
report "URL: $CLICKCLACK_URL"

if [ -n "${AUTOMEAT_ENV_FILE:-}" ]; then
  load_env_file "$AUTOMEAT_ENV_FILE" || true
fi

check_health
register_agent
verify_listed
check_twilio_config
check_vault_path
vault_sync_dry

report ""
if [ "$ok" = true ]; then
  report "Summary: ready (re-check voice with sandbox only; no real Twilio dials)"
  exit 0
fi
report "Summary: failed — escalate to Tumelo; fix steps above"
exit 1
