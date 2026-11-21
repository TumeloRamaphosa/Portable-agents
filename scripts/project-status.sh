#!/usr/bin/env bash
# Human-readable project progress (repo + factory + optional lab-mesh).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${HOME}/.local/bin:/usr/local/bin:${PATH}"

echo "========== Portable Agents progress =========="
echo ""

npm run typecheck 2>&1 | sed 's/^/  /' || echo "  typecheck FAILED"
echo ""
npm run factory:status 2>&1 | sed 's/^/  /'
echo ""

echo "--- Shipped doc index ---"
for f in PROJECT_STATUS STUDEX_FLEET_MESH STUDEX_LOCAL_OPS PSTACK_GROKBOTS_ZTE HERMES_PHONE; do
  [ -f "$ROOT/docs/${f}.md" ] && echo "  docs/${f}.md"
done
echo ""

if [ -f "$ROOT/docs/lab-mesh.env" ]; then
  echo "--- Lab / fleet (from lab-mesh.env) ---"
  ./scripts/studex-fleet-connect.sh --soft-fail 2>&1 | tail -15
else
  echo "--- Lab ---"
  echo "  WARN: copy docs/lab-mesh.env.example → docs/lab-mesh.env"
  ./scripts/claude-session-preflight.sh 2>&1 | tail -8 || true
fi

echo ""
echo "Full matrix: docs/PROJECT_STATUS.md"