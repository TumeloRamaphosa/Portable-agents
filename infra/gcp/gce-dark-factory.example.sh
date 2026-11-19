#!/usr/bin/env bash
# Example: create one GCE worker VM (replaces Orgo desktop for ZTE / agents).
# Run from MacBook with gcloud. Adjust machine type, zone, SA.
set -euo pipefail

PROJECT="${GCP_PROJECT_ID:?}"
ZONE="${GCP_ZONE:-africa-south1-b}"
INSTANCE="${GCP_DARK_FACTORY_INSTANCE:-dark-factory}"
MACHINE_TYPE="${GCP_WORKER_MACHINE_TYPE:-e2-standard-4}"

gcloud config set project "$PROJECT"

gcloud compute instances create "$INSTANCE" \
  --zone="$ZONE" \
  --machine-type="$MACHINE_TYPE" \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB \
  --tags=studex-worker,tailscale \
  --metadata=startup-script-url=gs://"${GCP_STARTUP_BUCKET:-studex-platform-bootstrap}"/gcp-dark-factory-vm-bootstrap.sh \
  --scopes=cloud-platform

echo "Instance $INSTANCE created. SSH: gcloud compute ssh $INSTANCE --zone=$ZONE"
echo "Then run scripts from repo: gcp-dark-factory-vm-bootstrap.sh (or bake into startup bucket)."