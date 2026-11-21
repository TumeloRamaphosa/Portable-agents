#!/usr/bin/env bash
# Claude Code session preflight — auth, Herdr hook, PATH (no secret output).
set -uo pipefail
export PATH="${HOME}/.local/bin:/usr/local/bin:${PATH}"
FAILS=0
pass() { printf 'PASS  %s\n' "$1"; }
warn() { printf 'WARN  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; FAILS=$((FAILS + 1)); }

if command -v claude >/dev/null 2>&1; then
  pass "claude on PATH ($(claude --version 2>/dev/null | head -1))"
else
  fail "claude not on PATH (npm i -g @anthropic-ai/claude-code)"
fi

if [ -d "$HOME/.claude" ]; then
  pass "~/.claude present"
else
  warn "~/.claude missing — run claude once or: mkdir -p ~/.claude/hooks"
fi

if [ -f "$HOME/.claude/hooks/herdr-agent-state.sh" ]; then
  pass "Herdr claude hook installed"
elif command -v herdr >/dev/null 2>&1; then
  warn "run: herdr integration install claude"
else
  warn "herdr not installed"
fi

if [ -n "${ANTHROPIC_API_KEY:-}" ]; then
  pass "ANTHROPIC_API_KEY set (not shown)"
else
  warn "no ANTHROPIC_API_KEY — use: claude auth login"
fi

if command -v herdr >/dev/null 2>&1 && herdr status 2>/dev/null | grep -q 'status: running'; then
  pass "herdr server running"
else
  warn "herdr server not running — ./scripts/herdr-server-start.sh"
fi

echo
if [ "$FAILS" -eq 0 ]; then
  echo "Claude sessions: ready for interactive login if needed."
else
  echo "Claude sessions: $FAILS failure(s)."
  exit 1
fi