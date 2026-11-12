(function () {
  "use strict";

  var log = document.getElementById("chat-log");
  var form = document.getElementById("chat-form");
  var input = document.getElementById("chat-input");

  function addBubble(text, who) {
    var div = document.createElement("div");
    div.className = "bubble " + (who === "user" ? "user" : "bot");
    div.innerHTML =
      '<div class="who">' +
      (who === "user" ? "You" : "Studbot") +
      "</div>" +
      text.replace(/\n/g, "<br>");
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function reply(message) {
    var q = message.toLowerCase().trim();
    if (!q) return "Ask me about the POV course, NEEDLE compass, Mission Control, or the pulse agent demo.";

    if (/needle|compass|bearing|pov|course/.test(q)) {
      return (
        "Open <a href=\"../mission-control/course/index.html\">POV course</a> — first-person checkpoints, not a left-to-right map. " +
        "NEEDLE is the on-page compass UI (bearing + next checkpoint). Keys: A/D or arrows to move."
      );
    }
    if (/mission|control|console|pwc|ops/.test(q)) {
      return (
        "<a href=\"../mission-control/index.html\">Mission Control</a> is the vertical ops console (roles, missions, fleet). " +
        "Studbot is the friendly entry point; it does not replace that console."
      );
    }
    if (/pulse|agent|demo|live|autonomous|anomal/.test(q)) {
      return (
        "Run the live agent proof: <code>cd mission-control/live-agent-demo && python3 agent.py</code>, " +
        "then edit <code>pulse.txt</code> (e.g. cpu_temp_c=78). Outputs land in <code>out/AUTONOMOUS_NOTE.md</code> and <code>out/actions.log</code>."
      );
    }
    if (/studex|black cloud|portable|sovereign/.test(q)) {
      return "Portable Agents / Black Cloud is Studex Group’s sovereign stack — Mission Control, field course, and offline-capable demos in this repo.";
    }
    if (/hello|hi|hey|help/.test(q)) {
      return "Hi — I’m Studbot. Try: “open course”, “what is NEEDLE?”, or “run pulse demo”. Or tap a quick prompt below.";
    }

    return (
      "I’m a local guide (no cloud API). Try questions about NEEDLE, the POV course, Mission Control, or the pulse watcher. " +
      "Or use the launch tiles on the left."
    );
  }

  function submit(text) {
    if (!text.trim()) return;
    addBubble(text, "user");
    window.setTimeout(function () {
      addBubble(reply(text), "bot");
    }, 120);
    input.value = "";
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    submit(input.value);
  });

  document.querySelectorAll("[data-prompt]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      submit(btn.getAttribute("data-prompt"));
    });
  });

  addBubble(
    "Studbot here — your entry point for Portable Agents. Ask about the POV course, NEEDLE compass, Mission Control, or the pulse agent demo.",
    "bot"
  );
})();
