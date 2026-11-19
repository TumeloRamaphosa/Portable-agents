# Deployment plan — today · GCP · Dark Factory · studexmeat.com

**Goal:** Ship three public surfaces on a clear split: **Shopify** owns commerce, **GCP** hosts Studex APIs and **client** stacks, **Dark Factory** is the factory UI + ZTE worker (VM + optional public read-only site).

## Surface map

| Surface | Role | Host | Repo / source |
|---------|------|------|----------------|
| **www.studexmeat.com** | Storefront, subscriptions, checkout | **Shopify** (`57228b-3.myshopify.com`) | Products + selling plans in Admin |
| **Studbot unlock API** | `POST /api/verify-subscription` | **GCP Cloud Run** (recommended) or Vercel | `api/verify-subscription.mjs`, `vercel.json` routes |
| **Dark Factory site** | Factory OS UI (`mission-control/factory/`) | **GCP** (Cloud Run or Firebase Hosting) | This repo, static + optional API later |
| **Mission Control (optional)** | Internal / demo console | GCP or same Run service prefix | `mission-control/index.html` |
| **Client deployments** | Per-customer env (PwC, pilots) | **GCP** (one project or folder per client) | Portable-agents + client env vars only |
| **Dark Factory worker** | Hermes gateway, factory queue, Grokbots | **VM** (GCP Compute or existing) + **Tailscale** | Not public internet; see [STUDEX_FLEET_MESH.md](./STUDEX_FLEET_MESH.md) |

```
                    Internet
                        │
        ┌───────────────┼───────────────┐
        │               │               │
  www.studexmeat.com   factory.*      api.* (GCP Run)
  (Shopify CDN)        Dark Factory UI   verify-subscription
        │               │               │
        └───────────────┴───────────────┘
                        │
              Studbot / web clients
                        │
              Tailscale (private)
        Mac Mini · dark-factory VM · Naledsi
```

---

## A — www.studexmeat.com (today)

**Already live on Shopify.** Today is **wiring**, not rebuilding the store.

### Checklist

- [ ] Shopify Admin → **Settings → Domains**: `www.studexmeat.com` primary, SSL active, apex redirects to `www`.
- [ ] Confirm Tier 4 / Tier 5 products use **subscription selling plans** ([STUDEXMEAT.md](../shopify/STUDEXMEAT.md)).
- [ ] (Recommended) Create product **Studbot — Portable Agents Monthly**; set `STUDBOT_SUBSCRIBE_URL` everywhere ([MERCHANT_SETUP.md](../shopify/MERCHANT_SETUP.md)).
- [ ] Deploy **verify API** on GCP (section B); set `STUDBOT_VERIFY_URL` to that HTTPS URL.
- [ ] Update `studbot/index.html` `window.STUDBOT_CONFIG.verifyUrl` and redeploy static Studbot host (Firebase/GCS or Shopify theme link).
- [ ] Test: subscribe test customer → Studbot **Unlock** with same email → 200 from verify API (no tokens in chat or git).

### Secrets (GCP Secret Manager only)

- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_ADMIN_API_TOKEN`
- Optional webhook secret for `api/shopify-webhook.mjs`

---

## B — GCP: Studex platform + client pattern (today)

**Project suggestion:** one **Studex platform** project (e.g. `studex-platform`) for Meat/Factory/verify; **separate GCP projects** (or folders + VPC-SC later) per **client** deployment.

### B1 — Platform services (deploy today)

| Service | GCP product | Artifact |
|---------|-------------|----------|
| Subscription verify | **Cloud Run** (Node 20+) | Container built from repo `api/` + minimal server |
| Dark Factory static site | **Cloud Run** (nginx/caddy static) or **Firebase Hosting** | `mission-control/factory/**` |
| Hermes intake (optional move) | Cloud Run | Separate repo today; migrate off Vercel later ([HERMES_INTAKE.md](./HERMES_INTAKE.md)) |

**Cloud Run — verify API (minimal path)**

1. Enable: `run.googleapis.com`, `secretmanager.googleapis.com`, `artifactregistry.googleapis.com`.
2. Create secrets (versions in Console only).
3. Build and deploy from repo root (example; adjust project/region):

```bash
gcloud config set project STUDEX_PLATFORM_PROJECT
gcloud artifacts repositories create portable-agents \
  --repository-format=docker --location=africa-south1

# Dockerfile.verify (add to repo when ready) or use buildpacks:
gcloud run deploy studbot-verify \
  --source=. \
  --region=africa-south1 \
  --allow-unauthenticated \
  --set-secrets=SHOPIFY_ADMIN_API_TOKEN=shopify-admin:latest \
  --set-env-vars=SHOPIFY_STORE_DOMAIN=57228b-3.myshopify.com
```

4. Map custom domain e.g. `api.studexmeat.com` or `verify.studexmeat.com` → Cloud Run (managed cert).
5. Set `STUDBOT_VERIFY_URL=https://verify.studexmeat.com/api/verify-subscription`.

> Until a `Dockerfile` lands in repo, you can deploy a **single-function** wrapper or keep Vercel for verify only — but **client** deploys still standardize on GCP from today.

### B2 — Client deployments (forward standard)

Use the same template for every customer (PwC anchor, pilots):

| Layer | Client GCP |
|-------|------------|
| **Identity** | Dedicated project or `client-<slug>` folder |
| **Compute** | Cloud Run (stateless) + optional GCE for GPU/Hermes gateway |
| **Secrets** | Secret Manager — no keys in Portable-agents git |
| **Networking** | Cloud Armor + HTTPS LB; **no** public Paperclip; Tailscale or IAP for ops |
| **CI** | Cloud Build trigger on client branch or tag |
| **Observability** | Cloud Logging + alert on 5xx on verify/intake |

**Client checklist (per onboard)**

- [ ] Project + billing + IAM (least privilege deploy SA).
- [ ] Deploy branded Mission Control **read-only** demo if required.
- [ ] Hermes gateway on GCE or client VM — **not** on same public URL as Shopify.
- [ ] Archive: `agent-work-archive.sh` → Drive ([STUDEX_FIVE_NODE_DEPLOY.md](./STUDEX_FIVE_NODE_DEPLOY.md)).

---

## C — Dark Factory **site** (today)

**Two parts — do not conflate:**

| Part | What | Today |
|------|------|--------|
| **Public site** | `mission-control/factory/index.html` + assets | Host on GCP (Firebase Hosting fastest for static) |
| **Worker VM** | Hermes, queue, `npm run factory:status` | GCP VM or existing host; **Tailscale only** |

### Public Factory UI (GCP Firebase Hosting — fast today)

```bash
# From repo root
firebase init hosting   # public dir: mission-control/factory OR use multi-site
firebase deploy --only hosting:dark-factory
```

Suggested hostname: `factory.studexmeat.com` or `dark-factory.studexglobalmarkets.com` (DNS CNAME to Firebase/Run).

**Content:** Static only — links to `docs/PROJECT_STATUS.md` paths are relative; for production, add a small redirect layer or publish docs as static copy in deploy script.

### Worker VM (same day if VM exists)

On the **dark-factory** host:

```bash
git clone https://github.com/TumeloRamaphosa/Portable-agents.git
cp docs/lab-mesh.env.example docs/lab-mesh.env   # LAB_HOST_DARK_FACTORY
./scripts/msi-herdr-claude-bootstrap.sh
./scripts/hermes-gateway-tmux.sh
tailscale serve --bg 8642
```

Paperclip: invite as external agent ([STUDEX_FLEET_MESH.md](./STUDEX_FLEET_MESH.md)). Obsidian: `integrations/obsidian-herdr/dark-factory.md.example`.

**Verify public + private separately**

- Public: browser loads Factory UI over HTTPS (200).
- Private: `npm run factory:status` on VM; Tailscale ping `dark-factory`.

---

## D — Today execution order (single squad)

| Step | Owner | Done when |
|------|--------|-----------|
| 1 | Commerce | `www.studexmeat.com` SSL + subscription products OK |
| 2 | GCP | Platform project + Secret Manager secrets created |
| 3 | GCP | Cloud Run **studbot-verify** deployed + domain mapped |
| 4 | GCP | Dark Factory **static** site live (Firebase or Run) |
| 5 | Studbot | `verifyUrl` points to GCP; unlock flow PASS |
| 6 | Infra | Dark Factory **VM** on tailnet (optional if VM ready) |
| 7 | Docs | `STUDBOT_VERIFY_URL` in host env only; commit **example** only |

**Do not** commit Shopify admin tokens. **Do not** expose Paperclip `:3100` on public GCP LB.

---

## E — Factory queue

Tracked as **ZTE-010** in `factory/intake/queue.json` (GCP + Dark Factory site + studexmeat wiring).

---

## Related

- [shopify/STUDEXMEAT.md](../shopify/STUDEXMEAT.md)
- [shopify/MERCHANT_SETUP.md](../shopify/MERCHANT_SETUP.md)
- [STUDEX_FLEET_MESH.md](./STUDEX_FLEET_MESH.md)
- [HERMES_INTAKE.md](./HERMES_INTAKE.md) (Vercel today; GCP migration optional)
- [CASHCLAW_STRATEGY.md](./CASHCLAW_STRATEGY.md) (pricing must match storefront)