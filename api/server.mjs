/**
 * Minimal HTTP server for GCP Cloud Run (studbot-verify).
 * Routes: POST /api/verify-subscription
 */
import http from "node:http";
import verifyHandler from "./verify-subscription.mjs";

const PORT = Number(process.env.PORT || 8080);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (url.pathname === "/health" || url.pathname === "/") {
    if (req.method === "GET") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true, service: "studbot-verify" }));
      return;
    }
  }
  if (url.pathname === "/api/verify-subscription") {
    await verifyHandler(req, res);
    return;
  }
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`studbot-verify listening on ${PORT}`);
});