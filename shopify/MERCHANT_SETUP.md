# Studbot monthly subscription (Shopify)

**Studex store:** [www.studexmeat.com](https://www.studexmeat.com) — see [`STUDEXMEAT.md`](STUDEXMEAT.md) for domains and product URLs.

Sell **Portable Agents / Studbot** as a **monthly subscription** on your Shopify store. Subscribers unlock the web Studbot surfaces and the Android app after email verification (no license keys in the repo).

## 1. Create the subscription product

1. In **Shopify Admin → Products → Add product**
   - Title: `Studbot — Portable Agents Monthly`
   - Type: digital / service (no shipping required)
2. **Settings → Checkout → Subscriptions** (or install [Shopify Subscriptions](https://apps.shopify.com/shopify-subscriptions) if needed).
3. Add a **selling plan**: monthly billing, price you choose (ZAR/USD).
4. Note **Variant ID** and **Selling plan ID** (from product URL or Admin API).

## 2. Checkout link (Studbot “Subscribe” button)

Set in deployment env (see `subscription.env.example`):

```text
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_SUBSCRIBE_URL=https://your-store.myshopify.com/cart/VARIANT_ID:1?selling_plan=SELLING_PLAN_ID
```

Or use the product page URL with the subscription option pre-selected.

## 3. Custom app for access verification

1. **Settings → Apps → Develop apps → Create an app**
2. Enable **Admin API** scopes:
   - `read_customers`
   - `read_orders` (optional, for one-time fallback)
   - `read_own_subscription_contracts` / subscription scopes your plan exposes
3. Install the app and copy the **Admin API access token** → server env only:

```text
SHOPIFY_ADMIN_API_TOKEN=shpat_...
```

Never commit this token. Use Vercel/host env vars.

## 4. Deploy the verify API

From repo root, deploy `api/` to Vercel (or any Node host):

```bash
# Vercel: set env vars in dashboard, then
vercel
```

Endpoints:

| Route | Purpose |
|-------|---------|
| `POST /api/verify-subscription` | Body `{ "email": "buyer@example.com" }` → `{ "active": true }` if an active subscription contract exists |
| `POST /api/shopify-webhook` | Optional: HMAC-verified webhooks to cache subscription status |

Point Studbot at your deployment:

```text
STUDBOT_VERIFY_URL=https://your-app.vercel.app/api/verify-subscription
```

## 5. Customer flow

1. User taps **Subscribe** → Shopify checkout (monthly plan).
2. After purchase, open **Studbot** → enter the **same email** as checkout → **Unlock**.
3. App calls `verify-subscription`; on success, stores a local session (7 days, re-check on launch).

## 6. Android Studbot

Set `verifyUrl` and `subscribeUrl` in `studbot-android` build config or `local.properties` (see `studbot-android/README.md`).

## Compliance

- Show cancel/manage link to Shopify **customer account** subscription portal.
- Privacy: only verify email against Shopify; do not store payment data in Portable Agents repo.
