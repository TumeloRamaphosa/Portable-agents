#!/usr/bin/env node
/**
 * Studex Home Hub — TV, voice, games, Linux-Studex bridge.
 * Default port 3088 (set HOME_HUB_PORT; avoid double-URL bugs in proxies).
 */
import express from "express";
import cors from "cors";
import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.HOME_HUB_PORT || "3088", 10);
const LINUX_STUDEX_URL = (process.env.LINUX_STUDEX_URL || "http://127.0.0.1:4000").replace(/\/$/, "");

function loadEnvFile() {
  const p = join(__dirname, "home.env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i);
    const v = t.slice(i + 1);
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvFile();

function runPy(tool, argsObj = {}) {
  return new Promise((resolve) => {
    const script = join(__dirname, "home_tools.py");
    const child = spawn("python3", [script, tool, JSON.stringify(argsObj)], {
      env: { ...process.env },
    });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", () => resolve(out.trim() || "ok"));
  });
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "studex-home-hub",
    port: PORT,
    linuxStudex: LINUX_STUDEX_URL,
    samsung: !!process.env.SAMSUNG_TV_IP,
    phonon: process.env.PHONON_ENABLED === "true",
  });
});

app.post("/api/tv/samsung", async (req, res) => {
  const action = req.body?.action || "home";
  const message = await runPy("tv_samsung", { action });
  res.json({ ok: true, action, message });
});

app.post("/api/tv/jvc", async (req, res) => {
  const action = req.body?.action || "power";
  const message = await runPy("tv_jvc", { action });
  res.json({ ok: true, action, message });
});

app.post("/api/speak", async (req, res) => {
  const text = req.body?.text || "";
  const message = await runPy("speak_phonon", { text });
  res.json({ ok: true, message });
});

app.post("/api/games/launch", async (req, res) => {
  const target = req.body?.target || "steam_bigpicture";
  const message = await runPy("launch_game", { target });
  res.json({ ok: true, target, message });
});

app.post("/api/scene", async (req, res) => {
  const name = req.body?.name || "gaming";
  const message = await runPy("scene_lounge", { name });
  res.json({ ok: true, name, message });
});

app.get("/api/studex/status", async (_req, res) => {
  try {
    const r = await fetch(`${LINUX_STUDEX_URL}/api/health`);
    const j = await r.json();
    res.json({ ok: true, studex: j });
  } catch (e) {
    res.status(502).json({ ok: false, error: String(e.message || e) });
  }
});

app.post("/api/studex/tmux", async (req, res) => {
  try {
    const r = await fetch(`${LINUX_STUDEX_URL}/api/tmux`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    res.json(await r.json());
  } catch (e) {
    res.status(502).json({ ok: false, error: String(e.message || e) });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Studex Home Hub http://127.0.0.1:${PORT}/api/health`);
  console.log(`Open UI: http://127.0.0.1:8080/home-console/ (with python3 -m http.server)`);
});
