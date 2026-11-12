#!/usr/bin/env node
/**
 * Print factory intake + pulse summary (no network).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const queuePath = join(root, "factory/intake/queue.json");
const pulsePath = join(root, "factory/pulse/events.jsonl");

function loadQueue() {
  if (!existsSync(queuePath)) return { items: [] };
  return JSON.parse(readFileSync(queuePath, "utf8"));
}

function loadPulseLines() {
  if (!existsSync(pulsePath)) return [];
  return readFileSync(pulsePath, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return { raw: line };
      }
    });
}

const queue = loadQueue();
const items = queue.items || [];
const byStatus = items.reduce((acc, it) => {
  const s = it.status || "unknown";
  acc[s] = (acc[s] || 0) + 1;
  return acc;
}, {});

console.log("=== Studex ZTE factory ===");
console.log("Intake:", byStatus);
items
  .filter((it) => it.status === "queued")
  .slice(0, 5)
  .forEach((it) => console.log(`  queued: ${it.id} · ${it.title} · ${it.ownerBot}`));

const pulse = loadPulseLines();
console.log("Pulse events:", pulse.length);
pulse.slice(-3).forEach((ev) => console.log(" ", ev.ts || ev.time || "?", ev.kind || ev.message || ev));
