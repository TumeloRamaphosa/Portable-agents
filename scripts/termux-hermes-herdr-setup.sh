#!/usr/bin/env bash
# Android Termux: install Herdr + (optional) Hermes CLI and connect integrations.
# Hermes Android app still recommended if CLI build fails on ARM.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

pass() { echo "PASS  $1"; }
warn() { echo "WARN  $1"; }
fail() { echo "FAIL  $1"; }

echo "=== Termux Hermes + Herdr connect ==="
echo "Doc: docs/TERMUX_HERMES_HERDR.md"
echo "repo=$ROOT"
echo ""

if [ -n "${TERMUX_VERSION:-}" ]; then
  pass "Termux $TERMUX_VERSION"
  pkg update -y
  pkg install -y git curl openssh tmux python rust binutils make clang openssl
else
  warn "Not Termux — continuing (WSL/Linux phone images)"
fi

export PATH="${HOME}/.local/bin:${PREFIX:-}/bin:${PATH:-/usr/bin:/bin}"

# --- Herdr (execution multiplexer + socket) ---
if ! command -v herdr >/dev/null 2>&1; then
  bash "$ROOT/scripts/install-herdr.sh" || fail "herdr install"
fi
bash "$ROOT/scripts/install-claude-cli-path.sh" 2>/dev/null || true
if ! command -v herdr >/dev/null 2>&1 && [ -x "${HOME}/.local/bin/herdr" ]; then
  export PATH="${HOME}/.local/bin:$PATH"
fi
command -v herdr >/dev/null 2>&1 && pass "herdr=$(command -v herdr)" || fail "herdr not on PATH — add ~/.local/bin to ~/.bashrc"

# --- Claude (optional pane) ---
if ! command -v claude >/dev/null 2>&1; then
  warn "claude not installed — run: bash scripts/termux-claude-setup.sh"
else
  pass "claude=$(command -v claude)"
  herdr integration install claude 2>/dev/null && pass "herdr ↔ claude integration" || warn "herdr claude integration skipped"
fi

# --- Hermes CLI (Nous) ---
HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
if ! command -v hermes >/dev/null 2>&1; then
  warn "installing Hermes CLI (may fail on some ARM builds)…"
  if curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash; then
    export PATH="${HOME}/.local/bin:$PATH"
  else
    warn "Hermes CLI install failed — use Hermes Android app + Paperclip task_bridge"
    warn "Desktop: herdr on Mac/MSI still runs ▶ from Obsidian"
  fi
fi

if command -v hermes >/dev/null 2>&1; then
  pass "hermes=$(command -v hermes)"
  herdr integration install hermes 2>/dev/null && pass "herdr ↔ hermes integration" || warn "run after: herdr integration install hermes"
  hermes doctor 2>/dev/null | head -20 || warn "hermes doctor — complete OAuth: hermes model"
else
  warn "hermes command missing — see docs/TERMUX_HERMES_HERDR.md (App path)"
fi

# --- Mesh env template (no secrets) ---
if [ ! -f "$ROOT/docs/lab-mesh.env" ]; then
  warn "copy docs/lab-mesh.env.example → docs/lab-mesh.env on your Mac hub"
fi

echo ""
echo "=== Start connected stack (this phone) ==="
echo "  source ~/.bashrc"
echo "  cd $ROOT"
echo "  herdr                    # creates panes; socket ~/.config/herdr/herdr.sock"
echo "  # In UI: open pane hermes or claude, cwd = Portable-agents"
echo ""
echo "=== Mesh check ==="
echo "  curl -fsS -m 6 http://macmini:3100/api/health && echo Paperclip ok"
echo "  bash scripts/phone-termux-bootstrap.sh"
echo ""
echo "=== Obsidian Herdr Bridge (same device only) ==="
echo "  Plugin socket: ~/.config/herdr/herdr.sock (after herdr is running)"
echo "  For ▶ from vault on Mac: herdr runs on Mac — sync vault or use phone checklist manually"