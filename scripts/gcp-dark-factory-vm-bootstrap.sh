#!/usr/bin/env bash
# Run ON a fresh GCE Ubuntu VM (dark-factory / naledsi). Tailscale + repo + Hermes gateway.
# Not for public SSH — use OS Login + IAP or serial console for break-glass.
set -euo pipefail

REPO_URL="${STUDEX_REPO_URL:-https://github.com/TumeloRamaphosa/Portable-agents.git}"
BRANCH="${STUDEX_REPO_BRANCH:-cursor/pov-course-needle-1375}"
INSTALL_DIR="${STUDEX_INSTALL_DIR:-/opt/studex/Portable-agents}"
ROLE="${STUDEX_ROLE:-dark-factory}"

sudo apt-get update -qq
sudo apt-get install -y -qq git curl tmux

if ! command -v tailscale >/dev/null 2>&1; then
  curl -fsSL https://tailscale.com/install.sh | sh
fi

sudo mkdir -p "$(dirname "$INSTALL_DIR")"
if [ ! -d "$INSTALL_DIR/.git" ]; then
  sudo git clone --branch "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
else
  sudo git -C "$INSTALL_DIR" fetch origin "$BRANCH"
  sudo git -C "$INSTALL_DIR" checkout "$BRANCH"
  sudo git -C "$INSTALL_DIR" pull --ff-only origin "$BRANCH" || true
fi

if [ ! -f "$INSTALL_DIR/docs/lab-mesh.env" ]; then
  sudo cp "$INSTALL_DIR/docs/lab-mesh.env.example" "$INSTALL_DIR/docs/lab-mesh.env"
  echo "STUDEX_ROLE=$ROLE" | sudo tee -a "$INSTALL_DIR/docs/lab-mesh.env" >/dev/null
fi

echo "=== Next (interactive, as your user) ==="
echo "1. tailscale up"
echo "2. cp docs/lab-mesh.env.example docs/lab-mesh.env && edit GCP/Tailscale names"
echo "3. curl -fsSL https://herdr.dev/install.sh | sh"
echo "4. cd $INSTALL_DIR && ./scripts/hermes-gateway-tmux.sh"
echo "5. tailscale serve --bg 8642"
echo "6. ./scripts/agent-work-archive.sh after agent sessions"