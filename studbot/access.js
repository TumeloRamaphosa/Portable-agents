(function (global) {
  "use strict";

  var STORAGE_KEY = "studbot_subscription_session";

  function config() {
    return global.STUDBOT_CONFIG || {};
  }

  function isGateEnabled() {
    var c = config();
    return !!(c.requireSubscription && c.verifyUrl);
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s.expiresAt || Date.now() > s.expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return s;
    } catch (e) {
      return null;
    }
  }

  function saveSession(email) {
    var days = config().sessionDays || 7;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        email: email,
        expiresAt: Date.now() + days * 24 * 60 * 60 * 1000,
      }),
    );
  }

  function hasAccess() {
    if (!isGateEnabled()) return true;
    return !!getSession();
  }

  function subscribeUrl() {
    return config().subscribeUrl || "#";
  }

  function verifyEmail(email, onDone) {
    var c = config();
    fetch(c.verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })
      .then(function (r) {
        return r.json().then(function (body) {
          return { ok: r.ok, body: body };
        });
      })
      .then(function (result) {
        if (result.ok && result.body.active) {
          saveSession(email);
          onDone(true, null);
        } else if (result.ok) {
          onDone(false, "No active Shopify subscription for this email.");
        } else {
          onDone(false, result.body.error || "Verification failed.");
        }
      })
      .catch(function () {
        onDone(false, "Could not reach subscription service.");
      });
  }

  function mountGate(root) {
    if (!isGateEnabled()) return;
    if (hasAccess()) return;

    var overlay = document.createElement("div");
    overlay.id = "studbot-subscription-gate";
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:9999;background:rgba(10,10,10,.96);display:flex;align-items:center;justify-content:center;padding:24px;font-family:Space Mono,monospace;color:#F5F1E8;";

    overlay.innerHTML =
      '<div style="max-width:420px;width:100%;border:1px solid rgba(201,168,76,.25);padding:28px;background:#111">' +
      '<div style="font-family:Bebas Neue,sans-serif;font-size:32px;letter-spacing:.1em;color:#C9A84C;margin-bottom:8px">STUDBOT</div>' +
      '<p style="font-size:12px;color:#8A8578;line-height:1.6;margin:0 0 20px">Monthly subscription at <a href="https://www.studexmeat.com" target="_blank" rel="noopener" style="color:#C9A84C">studexmeat.com</a> unlocks Portable Agents training, NEEDLE course, and Mission Control links.</p>' +
      '<a id="studbot-subscribe-link" href="' +
      subscribeUrl() +
      '" target="_blank" rel="noopener" style="display:block;text-align:center;padding:12px;background:#C9A84C;color:#0A0A0A;font-weight:700;font-size:11px;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;margin-bottom:16px">Subscribe on Shopify</a>' +
      '<label style="font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#5C594F">Checkout email</label>' +
      '<input id="studbot-sub-email" type="email" placeholder="you@example.com" style="width:100%;margin:8px 0 12px;padding:10px;background:#0A0A0A;border:1px solid rgba(255,255,255,.08);color:#F5F1E8;font-family:inherit;font-size:12px" />' +
      '<button id="studbot-sub-unlock" type="button" style="width:100%;padding:12px;border:0;background:#C9A84C;color:#0A0A0A;font-weight:700;font-size:11px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer">Unlock Studbot</button>' +
      '<p id="studbot-sub-error" style="font-size:11px;color:#E5484D;margin:12px 0 0;min-height:1.2em"></p>' +
      "</div>";

    document.body.appendChild(overlay);

    document.getElementById("studbot-sub-unlock").addEventListener("click", function () {
      var email = document.getElementById("studbot-sub-email").value;
      var err = document.getElementById("studbot-sub-error");
      err.textContent = "";
      verifyEmail(email, function (ok, message) {
        if (ok) {
          overlay.remove();
        } else {
          err.textContent = message || "Not subscribed.";
        }
      });
    });
  }

  global.StudbotAccess = {
    hasAccess: hasAccess,
    isGateEnabled: isGateEnabled,
    mountGate: mountGate,
    verifyEmail: verifyEmail,
  };
})(typeof window !== "undefined" ? window : globalThis);
