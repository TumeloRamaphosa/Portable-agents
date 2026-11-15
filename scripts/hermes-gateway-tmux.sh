#!/usr/bin/env bash
# Run Hermes API gateway in tmux (Paperclip hermes_gateway). Loopback only + tailscale serve.
set -euo pipefail

SESSION_NAME="${HERMES_GATEWAY_TMUX:-hermes-gateway}"
export PATH="${HOME}/.local/bin:/usr/local/bin:${PATH}"

if ! command -v hermes >/dev/null 2>&1; then
  echo "Hermes not installed. See docs/AGENT_COMPANY_SETUP.md" >&2
  exit 1
fi

HERMES_ENV="${HERMES_HOME:-$HOME/.hermes}/.env"
mkdir -p "$(dirname "$HERMES_ENV")"
touch "$HERMES_ENV"
chmod 600 "$HERMES_ENV"
grep -q '^API_SERVER_ENABLED=' "$HERMES_ENV" 2>/dev/null || echo 'API_SERVER_ENABLED=true' >>"$HERMES_ENV"
grep -q '^API_SERVER_KEY=' "$HERMES_ENV" 2>/dev/null || echo "API_SERVER_KEY=$(openssl rand -hex 32)" >>"$HERMES_ENV"
grep -q '^API_SERVER_HOST=' "$HERMES_ENV" 2>/dev/null || echo 'API_SERVER_HOST=127.0.0.1' >>"$HERMES_ENV"

if tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION_NAME" 2>/dev/null; then
  echo "Session $SESSION_NAME already running — attach: tmux attach -t $SESSION_NAME"
  exit 0
fi

tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION_NAME" -c "${HOME}" -- \
  "${SHELL:-bash}" -l -c 'export PATH="$HOME/.local/bin:$PATH"; exec hermes gateway run --accept-hooks'

sleep 2
PORT="$(grep '^API_SERVER_PORT=' "$HERMES_ENV" 2>/dev/null | tail -1 | cut -d= -f2- || echo 8642)"
PORT="${PORT:-8642}"
if curl -fsS -m 3 "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
  echo "Hermes gateway OK on :${PORT}"
else
  echo "Gateway starting — check: curl http://127.0.0.1:${PORT}/health"
fi
echo "Paperclip remote: tailscale serve --bg ${PORT}"
echo "Attach logs: tmux attach -t $SESSION_NAME"