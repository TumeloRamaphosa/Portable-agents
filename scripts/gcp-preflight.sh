#!/usr/bin/env bash
# GCP readiness — run on MacBook or CI with gcloud auth. No secrets printed.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ -f "$ROOT/docs/lab-mesh.env" ] && source "$ROOT/docs/lab-mesh.env" || true

PROJECT="${GCP_PROJECT_ID:-${STUDEX_GCP_PROJECT:-}}"
REGION="${GCP_REGION:-africa-south1}"

echo "=== GCP preflight ==="
fail=0
warn=0

command -v gcloud >/dev/null 2>&1 && echo "PASS  gcloud CLI" || { echo "FAIL  gcloud not installed"; fail=$((fail + 1)); }

if [ -n "$PROJECT" ]; then
  echo "PASS  GCP_PROJECT_ID=$PROJECT"
  if gcloud projects describe "$PROJECT" >/dev/null 2>&1; then
    echo "PASS  project describe"
  else
    echo "FAIL  cannot describe project (auth or ID?)"
    fail=$((fail + 1))
  fi
else
  echo "WARN  GCP_PROJECT_ID unset (set in docs/lab-mesh.env)"
  warn=$((warn + 1))
fi

echo "INFO  preferred region=$REGION"
for api in run.googleapis.com secretmanager.googleapis.com artifactregistry.googleapis.com compute.googleapis.com; do
  if [ -n "$PROJECT" ] && gcloud services list --project="$PROJECT" --enabled --filter="name:$api" --format="value(name)" 2>/dev/null | grep -q .; then
    echo "PASS  API $api"
  else
    echo "WARN  API $api not confirmed enabled"
    warn=$((warn + 1))
  fi
done

[ -f "$ROOT/Dockerfile.verify" ] && echo "PASS  Dockerfile.verify" || { echo "FAIL  missing Dockerfile.verify"; fail=$((fail + 1)); }

echo "--- failures=$fail warnings=$warn ---"
[ "$fail" -eq 0 ]