/**
 * POST /api/verify-subscription
 * Body: { "email": "customer@example.com" }
 * Returns: { "active": boolean, "source": "shopify" }
 *
 * Requires server env: SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN
 */

const ADMIN_VERSION = "2025-01";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function shopifyGraphql(store, token, query, variables) {
  const url = `https://${store}/admin/api/${ADMIN_VERSION}/graphql.json`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Shopify ${r.status}: ${text}`);
  }
  const data = await r.json();
  if (data.errors?.length) {
    throw new Error(data.errors.map((e) => e.message).join("; "));
  }
  return data.data;
}

async function customerHasActiveSubscription(store, token, email) {
  const query = `
    query StudbotVerify($query: String!) {
      customers(first: 1, query: $query) {
        edges {
          node {
            id
            email
            subscriptionContracts(first: 10) {
              edges {
                node {
                  status
                }
              }
            }
          }
        }
      }
    }
  `;
  const safeEmail = email.replace(/"/g, '\\"');
  const data = await shopifyGraphql(store, token, query, {
    query: `email:${safeEmail}`,
  });
  const customer = data.customers?.edges?.[0]?.node;
  if (!customer) return false;

  const contracts = customer.subscriptionContracts?.edges ?? [];
  const activeStatuses = new Set(["ACTIVE", "PAUSED"]);
  return contracts.some((e) => activeStatuses.has(e.node?.status));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const store = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN;
  if (!store || !token) {
    return json(res, 503, {
      error: "Subscription verify not configured",
      hint: "Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_API_TOKEN on the server",
    });
  }

  let email;
  try {
    if (req.body && typeof req.body === "object") {
      email = req.body.email;
    } else {
      let body = "";
      for await (const chunk of req) body += chunk;
      email = JSON.parse(body || "{}").email;
    }
  } catch {
    return json(res, 400, { error: "Invalid JSON" });
  }
  if (!email || typeof email !== "string") {
    return json(res, 400, { error: "email required" });
  }

  try {
    const active = await customerHasActiveSubscription(
      store,
      token,
      email.trim().toLowerCase(),
    );
    return json(res, 200, { active, source: "shopify" });
  } catch (err) {
    console.error(err);
    return json(res, 502, { error: "Shopify verification failed" });
  }
}
