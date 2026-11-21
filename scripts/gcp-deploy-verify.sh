#!/usr/bin/env bash
# Deploy studbot-verify to Cloud Run. Requires Secret Manager secret shopify-admin (latest).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ -f "$ROOT/docs/lab-mesh.env" ] && source "$ROOT/docs/lab-mesh.env" || true

PROJECT="${GCP_PROJECT_ID:?Set GCP_PROJECT_ID in docs/lab-mesh.env}"
REGION="${GCP_REGION:-africa-south1}"
SERVICE="${GCP_VERIFY_SERVICE:-studbot-verify}"
STORE="${SHOPIFY_STORE_DOMAIN:-57228b-3.myshopify.com}"
REPO="${GCP_ARTIFACT_REPO:-portable-agents}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/${REPO}/${SERVICE}:latest"

gcloud config set project "$PROJECT"

gcloud artifacts repositories describe "$REPO" --location="$REGION" 2>/dev/null ||
  gcloud artifacts repositories create "$REPO" \
    --repository-format=docker --location="$REGION"

gcloud builds submit "$ROOT" \
  --config="$ROOT/infra/gcp/cloudbuild.verify.yaml" \
  --substitutions="_IMAGE=${IMAGE}"

gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-secrets="SHOPIFY_ADMIN_API_TOKEN=shopify-admin:latest" \
  --set-env-vars="SHOPIFY_STORE_DOMAIN=${STORE}" \
  --min-instances=0 \
  --max-instances=10

URL="$(gcloud run services describe "$SERVICE" --region="$REGION" --format='value(status.url)')"
echo ""
echo "Cloud Run URL: ${URL}"
echo "STUDBOT_VERIFY_URL=${URL}/api/verify-subscription"
echo "Health: ${URL}/health"