#!/usr/bin/env bash
# Install Herdr CLI (for Obsidian Herdr Bridge + agent multiplexing).
# Official: https://herdr.dev — repo herdrdev/herdr
set -euo pipefail

if command -v herdr >/dev/null 2>&1; then
  echo "herdr already installed: $(herdr --version 2>/dev/null || herdr -V 2>/dev/null || true)"
  exit 0
fi

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$OS" in
  linux)
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL https://herdr.dev/install.sh | sh
  else
    echo "Install curl first, or download from:" >&2
    echo "  https://github.com/herdrdev/herdr/releases/latest" >&2
    exit 1
  fi
  ;;
  darwin)
    if command -v brew >/dev/null 2>&1; then
      brew install herdr
    else
      curl -fsSL https://herdr.dev/install.sh | sh
    fi
    ;;
  msys*|mingw*|cygwin*)
    echo "Windows: powershell -ExecutionPolicy Bypass -c \"irm https://herdr.dev/install.ps1 | iex\"" >&2
    exit 1
    ;;
  *)
    echo "Unsupported OS: $OS — see https://herdr.dev/docs" >&2
    exit 1
    ;;
esac

BINDIR="${HOME}/.local/bin"
if [ -x "$BINDIR/herdr" ] && ! command -v herdr >/dev/null 2>&1; then
  echo ""
  echo "Add Herdr to PATH (append to ~/.bashrc or ~/.zshrc):"
  echo "  export PATH=\"$BINDIR:\$PATH\""
  echo ""
  echo "Then: source ~/.bashrc   # or open a new terminal"
  echo "      herdr"
fi

if command -v herdr >/dev/null 2>&1 || [ -x "$BINDIR/herdr" ]; then
  echo "OK — start with: herdr"
  echo "Obsidian plugin needs socket at ~/.config/herdr/herdr.sock (after herdr is running)"
  if command -v herdr >/dev/null 2>&1 && command -v claude >/dev/null 2>&1; then
    mkdir -p "$HOME/.claude/hooks"
    herdr integration install claude 2>/dev/null || true
    echo "Herdr Claude integration: $(herdr integration status 2>/dev/null | grep '^claude:' || echo 'run after claude is on PATH')"
  fi
else
  exit 1
fi