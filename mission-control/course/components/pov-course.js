/**
 * First-person POV course navigation for Portable Agents training paths.
 */
(function (global) {
  "use strict";

  /**
   * @param {Object} config
   * @param {HTMLElement} config.root
   * @param {Object} config.course
   * @param {Function} [config.NeedleClass]
   */
  function PovCourseNav(config) {
    this.root = config.root;
    this.course = config.course;
    this.NeedleClass = config.NeedleClass || global.PortableNeedle;
    this.index = 0;
    this.mapOpen = false;

    this.viewport = this.root.querySelector("[data-pov-viewport]");
    this.corridor = this.root.querySelector("[data-pov-corridor]");
    this.card = this.root.querySelector("[data-pov-step-card]");
    this.hudStep = this.root.querySelector("[data-pov-hud-step]");
    this.btnBack = this.root.querySelector("[data-pov-back]");
    this.btnForward = this.root.querySelector("[data-pov-forward]");
    this.mapDrawer = this.root.querySelector("[data-pov-map-drawer]");
    this.mapTrack = this.root.querySelector("[data-pov-map-track]");
    this.mapToggle = this.root.querySelector("[data-pov-map-toggle]");

    var needleMount = this.root.querySelector("[data-needle-mount]");
    if (needleMount && this.NeedleClass) {
      this.needle = new this.NeedleClass(needleMount, { agentLabel: "NEEDLE" });
      this.needle.setAgentConnected(false);
    }

    this._bind();
    this._renderMap();
    this._goTo(0, false);
  }

  PovCourseNav.prototype._bind = function () {
    var self = this;
    this.btnBack.addEventListener("click", function () {
      self.step(-1);
    });
    this.btnForward.addEventListener("click", function () {
      self.step(1);
    });
    if (this.mapToggle) {
      this.mapToggle.addEventListener("click", function () {
        self.mapOpen = !self.mapOpen;
        self.mapDrawer.classList.toggle("is-open", self.mapOpen);
        self.mapToggle.textContent = self.mapOpen
          ? "Hide path overview"
          : "Path overview (legacy map)";
      });
    }
    document.addEventListener("keydown", function (ev) {
      if (ev.target && /input|textarea|select/i.test(ev.target.tagName)) return;
      if (ev.key === "ArrowRight" || ev.key === "d" || ev.key === "D") {
        ev.preventDefault();
        self.step(1);
      }
      if (ev.key === "ArrowLeft" || ev.key === "a" || ev.key === "A") {
        ev.preventDefault();
        self.step(-1);
      }
    });
  };

  PovCourseNav.prototype.step = function (delta) {
    var next = this.index + delta;
    if (next < 0 || next >= this.course.steps.length) return;
    this._goTo(next, true);
  };

  PovCourseNav.prototype._goTo = function (idx, animate) {
    this.index = idx;
    var steps = this.course.steps;
    var current = steps[idx];
    var next = idx < steps.length - 1 ? steps[idx + 1] : null;

    this.card.style.opacity = animate ? "0" : "1";
    this.card.style.transform = animate
      ? "translate(-50%, -48%) translateZ(-40px) scale(0.98)"
      : "translate(-50%, -50%) translateZ(0)";

    var self = this;
    window.setTimeout(
      function () {
        self.card.querySelector("[data-step-title]").textContent = current.title;
        self.card.querySelector("[data-step-body]").textContent = current.body;
        self.card.querySelector("[data-step-meta]").textContent =
          "Checkpoint " + (idx + 1) + " of " + steps.length + " · " + (current.tag || "module");

        self.card.style.opacity = "1";
        self.card.style.transform = "translate(-50%, -50%) translateZ(0)";

        var drift = (current.bearing || 0) * 0.08;
        self.corridor.style.transform =
          "translateZ(" + -idx * 28 + "px) rotateY(" + drift + "deg)";

        self._layoutWaypoints();
        self._updateHud();
        self._updateNeedle(current, next, steps.length - idx - 1);
        self._updateMap();
        self._updateButtons();
      },
      animate ? 180 : 0
    );
  };

  PovCourseNav.prototype._layoutWaypoints = function () {
    var existing = this.viewport.querySelectorAll(".pov-waypoint");
    existing.forEach(function (n) {
      n.remove();
    });
    var steps = this.course.steps;
    for (var i = 0; i < steps.length; i++) {
      if (i < this.index) continue;
      var wp = document.createElement("div");
      wp.className = "pov-waypoint";
      if (i === this.index) wp.classList.add("is-current");
      if (i === this.index + 1) wp.classList.add("is-next");
      var depth = (i - this.index + 1) * 80;
      var spread = ((steps[i].bearing || 0) / 180) * 40;
      wp.style.transform =
        "translate(-50%, -50%) translate3d(" + spread + "px, " + (-depth * 0.35) + "px, " + -depth + "px)";
      wp.style.top = "42%";
      wp.title = steps[i].title;
      this.corridor.appendChild(wp);
    }
  };

  PovCourseNav.prototype._updateHud = function () {
    this.hudStep.textContent =
      "Facing checkpoint " + (this.index + 1) + " · POV navigation";
  };

  PovCourseNav.prototype._updateNeedle = function (current, next, stepsAhead) {
    if (!this.needle) return;
    if (next) {
      var bearing = next.bearing != null ? next.bearing : 0;
      this.needle.setBearing(bearing);
      this.needle.setTarget(next.title, stepsAhead);
    } else {
      this.needle.setBearing(current.bearing || 0);
      this.needle.setTarget("Path complete", 0);
    }
  };

  PovCourseNav.prototype._updateButtons = function () {
    this.btnBack.disabled = this.index === 0;
    this.btnForward.disabled = this.index >= this.course.steps.length - 1;
    this.btnForward.textContent =
      this.index >= this.course.steps.length - 1 ? "Complete" : "Advance →";
  };

  PovCourseNav.prototype._renderMap = function () {
    if (!this.mapTrack) return;
    this.mapTrack.innerHTML = "";
    var steps = this.course.steps;
    var self = this;
    steps.forEach(function (step, i) {
      if (i > 0) {
        var conn = document.createElement("div");
        conn.className = "pov-map-connector";
        conn.setAttribute("aria-hidden", "true");
        self.mapTrack.appendChild(conn);
      }
      var node = document.createElement("button");
      node.type = "button";
      node.className = "pov-map-node";
      node.textContent = step.short || step.title;
      node.addEventListener("click", function () {
        self._goTo(i, true);
      });
      self.mapTrack.appendChild(node);
    });
  };

  PovCourseNav.prototype._updateMap = function () {
    if (!this.mapTrack) return;
    var nodes = this.mapTrack.querySelectorAll(".pov-map-node");
    nodes.forEach(function (node, i) {
      node.classList.remove("is-done", "is-here");
      if (i < this.index) node.classList.add("is-done");
      if (i === this.index) node.classList.add("is-here");
    }, this);
  };

  global.PovCourseNav = PovCourseNav;
})(typeof window !== "undefined" ? window : globalThis);
