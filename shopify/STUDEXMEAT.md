# Studex Meat store — Studbot subscription

| | |
|---|---|
| **Storefront** | [https://www.studexmeat.com](https://www.studexmeat.com) |
| **Shopify Admin domain** | `57228b-3.myshopify.com` (for `SHOPIFY_STORE_DOMAIN` + Admin API) |
| **Support** | +27 84 421 6035 · info@studexmeat.com |

## Subscribe links (Portable Agents / Studbot)

Use these **monthly operator tiers** (AI stack described on the product pages) until a dedicated Studbot SKU exists:

| Plan | Checkout URL |
|------|----------------|
| **Tier 4 — Operator** | https://www.studexmeat.com/products/tier-4-operator-4-500-month |
| **Tier 5 — Ghost (Sovereign)** | https://www.studexmeat.com/products/tier-5-ghost-the-sovereign-7-500-month-and-up |

**Recommended:** add a digital product **“Studbot — Portable Agents Monthly”** on studexmeat.com with a Shopify **selling plan**, then set `STUDBOT_SUBSCRIBE_URL` to that product URL (see `MERCHANT_SETUP.md`).

## Server env (Vercel / host)

```bash
SHOPIFY_STORE_DOMAIN=57228b-3.myshopify.com
SHOPIFY_ADMIN_API_TOKEN=shpat_...   # Custom app in Shopify Admin — never commit
STUDBOT_SUBSCRIBE_URL=https://www.studexmeat.com/products/tier-4-operator-4-500-month
STUDBOT_VERIFY_URL=https://<your-deploy>/api/verify-subscription
```

## Customer unlock flow

1. Subscribe at studexmeat.com with the **same email** they use in Studbot.
2. Open [Studbot](../studbot/index.html) → **Subscribe on Shopify** → after checkout, **Unlock** with that email.
3. `api/verify-subscription` checks active **subscription contracts** for that customer via Admin API.

Ensure tier products use Shopify **Subscriptions** / selling plans so contracts appear in Admin API.
