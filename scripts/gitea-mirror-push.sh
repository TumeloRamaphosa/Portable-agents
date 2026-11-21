#!/usr/bin/env bash
# Push current branch to local Gitea mirror (in addition to github origin).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CONFIG="${STUDEX_GITEA_CONFIG:-$HOME/.studex/gitea.remote}"
if [ ! -f "$CONFIG" ]; then
  echo "Missing $CONFIG — copy integrations/gitea/remote.example" >&2
  echo "  Example: GITEA_URL=http://macmini:3000/studex/Portable-agents.git" >&2
  exit 1
fi
# shellcheck disable=SC1090
source "$CONFIG"

REMOTE_NAME="${GITEA_REMOTE_NAME:-gitea}"
GITEA_URL="${GITEA_URL:?Set GITEA_URL in $CONFIG}"

if git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  git remote set-url "$REMOTE_NAME" "$GITEA_URL"
else
  git remote add "$REMOTE_NAME" "$GITEA_URL"
fi

BRANCH="$(git branch --show-current)"
echo "Pushing $BRANCH to $REMOTE_NAME ($GITEA_URL)"
git push -u "$REMOTE_NAME" "$BRANCH"
