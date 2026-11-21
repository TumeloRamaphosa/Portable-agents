#!/usr/bin/env bash
# One-shot: Claude + Hermes + Herdr on Termux (phone).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec bash "$ROOT/scripts/termux-hermes-herdr-setup.sh"