#!/usr/bin/env bash
# Persist PATH for claude after npm global install.
set -euo pipefail

if [ -n "${TERMUX_VERSION:-}" ]; then
  BIN_DIR="${PREFIX:-/data/data/com.termux/files/usr}/bin"
else
  BIN_DIR="${CLAUDE_NPM_PREFIX:-$HOME/.local}/bin"
fi

MARK="# studex-claude-code-path"
RC="${HOME}/.bashrc"
LINE="export PATH=\"$BIN_DIR:\$HOME/.local/bin:\$PATH\""

touch "$RC"
if grep -q "$MARK" "$RC" 2>/dev/null; then
  echo "PASS  PATH already in $RC"
else
  {
    echo ""
    echo "$MARK"
    echo "$LINE"
  } >>"$RC"
  echo "PASS  appended PATH to $RC"
fi

export PATH="$BIN_DIR:$HOME/.local/bin:$PATH"
command -v claude >/dev/null 2>&1 && echo "PASS  claude=$(command -v claude)" || echo "WARN  claude still not found — open a new Termux session"