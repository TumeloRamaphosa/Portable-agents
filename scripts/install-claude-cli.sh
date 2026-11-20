#!/usr/bin/env bash
# Install Anthropic Claude Code CLI (`claude`) for Linux / WSL / macOS.
# On Android Termux this is often unsupported — use Hermes on phone + Claude on Mac/MSI instead.
set -euo pipefail

if command -v claude >/dev/null 2>&1; then
  echo "PASS  claude already: $(command -v claude)"
  claude --version 2>/dev/null || true
  exit 0
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "FAIL  npm not found."
  echo "  Debian/Ubuntu/WSL: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
  echo "  Termux: pkg install nodejs"
  echo "  macOS: brew install node"
  exit 1
fi

PREFIX="${CLAUDE_NPM_PREFIX:-$HOME/.local}"
mkdir -p "$PREFIX/bin"
export PATH="$PREFIX/bin:$PATH"

echo "Installing @anthropic-ai/claude-code → $PREFIX"
npm install -g @anthropic-ai/claude-code --prefix "$PREFIX" \
  --allow-scripts @anthropic-ai/claude-code 2>/dev/null \
  || npm install -g @anthropic-ai/claude-code --prefix "$PREFIX"

if ! command -v claude >/dev/null 2>&1; then
  echo "FAIL  install finished but claude not on PATH"
  echo "  Add to shell rc: export PATH=\"$PREFIX/bin:\$PATH\""
  exit 1
fi

echo "PASS  $(claude --version 2>/dev/null || echo claude installed)"
echo ""
echo "Next:"
echo "  export PATH=\"$PREFIX/bin:\$PATH\"   # add to ~/.bashrc"
echo "  claude auth login"
echo "  cd Portable-agents && herdr integration install claude   # if herdr installed"