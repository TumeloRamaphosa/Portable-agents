#!/usr/bin/env bash
# Install Graphify CLI + register skill; print Floorplan plugin steps for Claude Code.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

pass() { echo "PASS  $1"; }
warn() { echo "WARN  $1"; }

echo "=== Studex client planning tools ==="
echo "Doc: docs/CLIENT_BUILD_PLANNING.md"
echo ""

GRAPHIFY_OK=0
if command -v graphify >/dev/null 2>&1; then
  pass "graphify CLI: $(graphify --version 2>/dev/null || echo ok)"
  GRAPHIFY_OK=1
elif command -v uv >/dev/null 2>&1; then
  echo "Installing graphifyy via uv..."
  uv tool install graphifyy && GRAPHIFY_OK=1
elif command -v pipx >/dev/null 2>&1; then
  pipx install graphifyy && GRAPHIFY_OK=1
else
  warn "Install uv or pipx, then: uv tool install graphifyy"
fi

if [ "$GRAPHIFY_OK" = 1 ]; then
  graphify install 2>/dev/null && pass "graphify skill registered" || warn "run: graphify install (pick Cursor/Claude)"
fi

if command -v claude >/dev/null 2>&1; then
  if claude plugin list 2>/dev/null | grep -qi floorplan; then
    pass "Floorplan Claude plugin installed"
  else
    echo ""
    echo "Floorplan (run manually in Claude Code):"
    echo "  claude plugin marketplace add haydenschmitty/floorplan"
    echo "  claude plugin install floorplan@floorplan"
  fi
else
  warn "claude not on PATH — Floorplan needs Claude Code or Codex (see docs/CLIENT_BUILD_PLANNING.md)"
fi

echo ""
echo "Try:"
echo "  In Cursor/Claude: /graphify ."
echo "  In Claude Code:   'Make me a floorplan of this app'"