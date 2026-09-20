/**
 * Needle — UI compass / bearing component for first-person course navigation.
 * Portable Agents only; not related to external "Needle" phone-agent products.
 *
 * @typedef {Object} NeedleOptions
 * @property {string} [agentLabel] - Label shown in the panel (default NEEDLE)
 * @property {boolean} [agentConnected] - Optional linked-state for future on-device hooks
 */

(function (global) {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";

  function el(name, attrs) {
    var node = document.createElementNS(SVG_NS, name);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        node.setAttribute(key, attrs[key]);
      });
    }
    return node;
  }

  /**
   * @param {HTMLElement} mountEl
   * @param {NeedleOptions} [options]
   */
  function Needle(mountEl, options) {
    this.mountEl = mountEl;
    this.options = options || {};
    this.bearingDeg = 0;
    this.targetLabel = "—";
    this.distanceLabel = "—";
    this._build();
  }

  Needle.prototype._build = function () {
    this.mountEl.innerHTML = "";
    this.svg = el("svg", {
      class: "needle-compass",
      viewBox: "0 0 180 180",
      role: "img",
      "aria-label": "Course direction needle",
    });

    var ring = el("circle", { class: "ring", cx: "90", cy: "90", r: "78" });
    this.svg.appendChild(ring);

    for (var i = 0; i < 72; i++) {
      var deg = i * 5;
      var rad = (deg - 90) * (Math.PI / 180);
      var inner = i % 6 === 0 ? 62 : 70;
      var outer = 76;
      var x1 = 90 + Math.cos(rad) * inner;
      var y1 = 90 + Math.sin(rad) * inner;
      var x2 = 90 + Math.cos(rad) * outer;
      var y2 = 90 + Math.sin(rad) * outer;
      this.svg.appendChild(
        el("line", {
          class: i % 6 === 0 ? "tick-major" : "tick-minor",
          x1: String(x1),
          y1: String(y1),
          x2: String(x2),
          y2: String(y2),
        })
      );
    }

    var cardinals = [
      { t: "N", x: 90, y: 18 },
      { t: "E", x: 162, y: 94 },
      { t: "S", x: 90, y: 168 },
      { t: "W", x: 18, y: 94 },
    ];
    cardinals.forEach(function (c) {
      var text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("class", "cardinal");
      text.setAttribute("x", String(c.x));
      text.setAttribute("y", String(c.y));
      text.setAttribute("text-anchor", "middle");
      text.textContent = c.t;
      this.svg.appendChild(text);
    }, this);

    this.forwardWedge = el("path", {
      class: "forward-wedge",
      d: "M90,90 L90,28 A40,40 0 0,1 118,52 Z",
    });
    this.svg.appendChild(this.forwardWedge);

    this.needleGroup = document.createElementNS(SVG_NS, "g");
    this.needleGroup.setAttribute("class", "needle-shaft");
    this.needleGroup.appendChild(
      el("path", {
        d: "M90,90 L90,32 L94,90 L90,108 L86,90 Z",
        fill: "#C9A84C",
      })
    );
    this.svg.appendChild(this.needleGroup);

    this.svg.appendChild(el("circle", { class: "needle-hub", cx: "90", cy: "90", r: "6" }));

    this.mountEl.appendChild(this.svg);

    this.readoutBearing = document.querySelector("[data-needle-bearing]");
    this.readoutTarget = document.querySelector("[data-needle-target]");
    this.readoutDistance = document.querySelector("[data-needle-distance]");
    this.readoutAgent = document.querySelector("[data-needle-agent-status]");
  };

  Needle.prototype.setBearing = function (degrees) {
    this.bearingDeg = ((degrees % 360) + 360) % 360;
    var rot = "rotate(" + this.bearingDeg + " 90 90)";
    this.needleGroup.setAttribute("transform", rot);
    this.forwardWedge.setAttribute("transform", rot);
    if (this.readoutBearing) {
      this.readoutBearing.textContent = Math.round(this.bearingDeg) + "°";
    }
  };

  Needle.prototype.setTarget = function (label, stepsAhead) {
    this.targetLabel = label || "—";
    this.distanceLabel =
      stepsAhead === undefined || stepsAhead === null
        ? "—"
        : stepsAhead === 0
          ? "You are here"
          : stepsAhead + " step" + (stepsAhead === 1 ? "" : "s") + " ahead";
    if (this.readoutTarget) this.readoutTarget.textContent = this.targetLabel;
    if (this.readoutDistance) this.readoutDistance.textContent = this.distanceLabel;
  };

  Needle.prototype.setAgentConnected = function (connected) {
    if (!this.readoutAgent) return;
    this.readoutAgent.textContent = connected ? "Linked" : "UI compass · local";
    this.readoutAgent.style.color = connected ? "var(--live)" : "var(--muted)";
  };

  global.PortableNeedle = Needle;
})(typeof window !== "undefined" ? window : globalThis);
