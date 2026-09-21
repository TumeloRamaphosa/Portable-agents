/**
 * Public Studbot config — override via window.STUDBOT_CONFIG before loading access.js
 */
(function (global) {
  global.STUDBOT_CONFIG = global.STUDBOT_CONFIG || {
    // Set at deploy time or inline in index.html
    verifyUrl: "",
    subscribeUrl: "",
    // When verifyUrl is empty, subscription gate is skipped (local/dev)
    requireSubscription: false,
    sessionDays: 7,
  };
})(typeof window !== "undefined" ? window : globalThis);
