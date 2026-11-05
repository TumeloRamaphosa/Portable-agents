/**
 * POST /api/shopify-webhook
 * Verifies Shopify HMAC and acknowledges subscription-related topics.
 * Extend to persist status in your DB if you outgrow email lookup.
 */

import crypto from "node:crypto";

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method not allowed");
  }

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    res.statusCode = 503;
    return res.end("Webhook secret not configured");
  }

  const raw = await readRawBody(req);
  const hmac = req.headers["x-shopify-hmac-sha256"];
  if (!hmac) {
    res.statusCode = 401;
    return res.end("Missing HMAC");
  }

  const digest = crypto.createHmac("sha256", secret).update(raw).digest("base64");
  const a = Buffer.from(digest);
  const b = Buffer.from(hmac);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    res.statusCode = 401;
    return res.end("Invalid HMAC");
  }

  const topic = req.headers["x-shopify-topic"] || "";
  console.log("Shopify webhook:", topic);

  res.statusCode = 200;
  res.end("ok");
}
