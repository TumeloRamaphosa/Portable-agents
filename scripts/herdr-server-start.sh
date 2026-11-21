#!/usr/bin/env bash
# Start Herdr server on boot if not already running (cloud agent / lab host).
set -euo pipefail
export PATH="${HOME}/.local/bin:/usr/local/bin:${PATH}"

if ! command -v herdr >/dev/null 2>&1; then
  echo "herdr not installed — run scripts/install-herdr.sh" >&2
  exit 0
fi

if herdr status 2>/dev/null | grep -q 'status: running'; then
  echo "herdr server already running"
  exit 0
fi

SESSION_NAME="herdr-server"
if tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION_NAME" 2>/dev/null; then
  echo "herdr tmux session exists"
  exit 0
fi

tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION_NAME" -c "${HOME}" -- \
  "${SHELL:-bash}" -l -c 'export PATH="$HOME/.local/bin:$PATH"; exec herdr'

for _ in 1 2 3 4 5 6 7 8 9 10; do
  sleep 1
  if herdr status 2>/dev/null | grep -q 'status: running'; then
    echo "herdr server started (socket ~/.config/herdr/herdr.sock)"
    exit 0
  fi
done
echo "herdr may still be starting — check: herdr status" >&2
exit 0