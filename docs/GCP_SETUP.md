# GCP setup (replaces Orgo for cloud agents)

**Decision:** Studex cloud **compute and APIs** run on **GCP** — not Orgo VMs. Orgo is **out of the default path** (no `ORGO_API_KEY` dependency).

| Orgo (deprecated) | GCP (default) |
|-------------------|---------------|
| Cloud desktops via Orgo API | **GCE** Ubuntu workers (`dark-factory`, `naledsi`, codex pool) |
| Ad-hoc remote coding VMs | **Cloud Build** + git clone on GCE; **Cursor Cloud Agents** for bursts |
| Public APIs on unknown host | **Cloud Run** (`studbot-verify`) |
| Factory UI hosting | **Firebase Hosting** (`mission-control/factory/`) |

Secrets: **GCP Secret Manager only** (Shopify admin token, webhooks). Archive still → [Stud-Bot-Depo](https://drive.google.com/drive/u/2/folders/1HpmisLt5bLxAMtjtU5pwt2PxKIqxwvs6).

---

## Architecture

```
Internet
   ├── www.studexmeat.com (Shopify)
   ├── verify.* → Cloud Run (studbot-verify)
   └── factory.* → Firebase Hosting (static)

Tailscale (private)
   ├── Mac Mini (Paperclip)
   ├── MSI / Lenovo / MacBook
   └── GCE: dark-factory · naledsi · (optional) codex-worker-*
```

---

## Phase 0 — Local config

Copy and edit `docs/lab-mesh.env` (gitignored):

```bash
GCP_PROJECT_ID=studex-platform          # your real project id
GCP_REGION=africa-south1
GCP_ZONE=africa-south1-b
GCP_VERIFY_SERVICE=studbot-verify
SHOPIFY_STORE_DOMAIN=57228b-3.myshopify.com
GDRIVE_ARCHIVE_FOLDER_ID=1HpmisLt5bLxAMtjtU5pwt2PxKIqxwvs6
STUDEX_ROLE=dark-factory                # on GCE VMs only
```

**Auth (MacBook):**

```bash
gcloud auth login
gcloud auth application-default login
./scripts/gcp-preflight.sh
```

---

## Phase 1 — Enable APIs + Secret Manager

```bash
export PROJECT=studex-platform   # match lab-mesh.env

gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  compute.googleapis.com \
  --project="$PROJECT"

# Create secret (paste token in console or pipe once — never commit)
echo -n 'YOUR_SHOPIFY_ADMIN_TOKEN' | gcloud secrets create shopify-admin \
  --data-file=- --project="$PROJECT" \
  2>/dev/null || gcloud secrets versions add shopify-admin --data-file=- --project="$PROJECT"
```

Grant Cloud Run access to the secret (default compute SA or custom):

```bash
gcloud secrets add-iam-policy-binding shopify-admin \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project="$PROJECT"
```

Replace `PROJECT_NUMBER` from `gcloud projects describe $PROJECT --format='value(projectNumber)'`.

---

## Phase 2 — Cloud Run: Studbot verify API

From repo root (after `GCP_PROJECT_ID` in `lab-mesh.env`):

```bash
./scripts/gcp-deploy-verify.sh
```

Or manual steps — see [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) § B.

**Done when:**

- `curl -sS "$(gcloud run services describe studbot-verify --region=africa-south1 --format='value(status.url)')/health"` → `{"ok":true,...}`
- Map `verify.studexmeat.com` → Cloud Run managed cert
- Set host env: `STUDBOT_VERIFY_URL=https://verify.studexmeat.com/api/verify-subscription`

---

## Phase 3 — Dark Factory public site (Firebase)

```bash
cd infra/gcp
cp .firebaserc.example .firebaserc   # edit project id
firebase login
firebase init hosting   # public dir already mission-control/factory via firebase.json
firebase deploy --only hosting
```

Hostname: `factory.studexmeat.com` (DNS to Firebase). Details: [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) § C.

---

## Phase 4 — GCE worker VMs (Orgo replacement)

**One VM = one persistent agent host** (Hermes gateway, factory queue, Grokbots). Not exposed on public LB.

### Create instance (example)

```bash
chmod +x infra/gcp/gce-dark-factory.example.sh
GCP_PROJECT_ID=studex-platform ./infra/gcp/gce-dark-factory.example.sh
```

Or Console: Ubuntu 22.04 LTS, `e2-standard-4`, tag `studex-worker`, block project-wide SSH keys if using OS Login.

### Bootstrap on the VM

```bash
gcloud compute ssh dark-factory --zone=africa-south1-b
curl -fsSL https://raw.githubusercontent.com/TumeloRamaphosa/Portable-agents/cursor/pov-course-needle-1375/scripts/gcp-dark-factory-vm-bootstrap.sh | bash
# Or clone repo and run:
# ./scripts/gcp-dark-factory-vm-bootstrap.sh
sudo tailscale up
cd /opt/studex/Portable-agents
# copy lab-mesh.env, herdr, Hermes — see STUDEX_FLEET_MESH.md
./scripts/hermes-gateway-tmux.sh
tailscale serve --bg 8642
```

**Codex worker pool (was “10 Orgo desktops”):** add VMs `codex-worker-01` … or scale **one** `dark-factory` with multiple Herdr panes first. Mission Control tracks count in [gcp/index.html](../mission-control/gcp/index.html).

---

## Phase 5 — Wire studexmeat + MSI brain

| Step | Doc |
|------|-----|
| Shopify domains + subscriptions | [STUDEXMEAT.md](../shopify/STUDEXMEAT.md) |
| Studbot `verifyUrl` | [MERCHANT_SETUP.md](../shopify/MERCHANT_SETUP.md) |
| VM OpenBot / Herdr | [OPENBOT_NODE_MESH.md](./OPENBOT_NODE_MESH.md) |
| MSI local brain | [MSI_BRAIN_SETUP.md](./MSI_BRAIN_SETUP.md) |

---

## Verify (ZTE-010 / ZTE-014)

| Check | Command |
|-------|---------|
| GCP tooling | `./scripts/gcp-preflight.sh` |
| Verify API | `POST` test email → `{ "active": boolean }` |
| Factory site | Browser 200 on `factory.*` |
| Worker private | `tailscale ping dark-factory`; `npm run factory:status` on VM |
| Archive | `./scripts/agent-work-archive.sh` → Stud-Bot-Depo |

Obsidian checklist: `integrations/obsidian-herdr/gcp-stack.md.example` → `herdr/gcp.md`.

---

## Where agents save during deploy

See [DEPLOY_TIMELINE_AND_SAVES.md](./DEPLOY_TIMELINE_AND_SAVES.md) — git, Obsidian `brain/`, **Stud-Bot-Depo**, Notion Memory.

## Related

- [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) — commerce + today order
- [COMMAND_CENTERS.md](./COMMAND_CENTERS.md) — CC1 GCP
- [STUDEX_FLEET_MESH.md](./STUDEX_FLEET_MESH.md) — tailnet + Paperclip invites
- Factory **ZTE-010** (ship) · **ZTE-014** (GCP replaces Orgo)