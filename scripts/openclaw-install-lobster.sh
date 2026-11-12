#!/usr/bin/env bash
# Install Lobster plugin for OpenClaw (typed pipelines + approvals).
# Prerequisites: openclaw on PATH, Node >=24.16 per openclaw release notes.
set -euo pipefail

if ! command -v openclaw >/dev/null 2>&1; then
  echo "openclaw not found. Install with Node 24+:" >&2
  echo "  npm install -g openclaw@2026.11.2" >&2
  exit 1
fi

openclaw plugins install @openclaw/lobster

echo ""
echo "Lobster installed. Add tools.alsoAllow: [\"lobster\"] — see docs/OPENCLAW_LOBSTER.md"
echo "Restart Gateway or: openclaw plugins reload lobster"
