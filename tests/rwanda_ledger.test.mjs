import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateLedger, loadLedger } from "../mission-control/rwanda-ledger.mjs";

const fixture = () => ({
  schema_version: 1,
  company_id: "rwanda-coffee",
  generated_at: "2026-11-10T00:00:00Z",
  jobs: [],
});

test("empty real ledger validates and sorts errors", () => {
  assert.deepEqual(validateLedger(fixture()), []);
  const invalid = { schema_version: 2, jobs: [{ id: "", title: 4, state: "invented", owner: null, created_at: "" }] };
  const errors = validateLedger(invalid);
  assert.deepEqual(errors, [...errors].sort());
  assert.ok(errors.some((error) => error.includes("schema_version")));
  for (const field of ["id", "title", "state", "owner", "created_at"]) {
    assert.ok(errors.some((error) => error.includes(`jobs[0].${field}`)), field);
  }
});

test("ledger rejects non-objects and non-array jobs without crashing", () => {
  assert.deepEqual(validateLedger(null), ["ledger: must be an object"]);
  assert.ok(validateLedger({ schema_version: 1, jobs: {} }).some((error) => error.includes("jobs")));
});

test("loadLedger fetches a no-store JSON resource", async () => {
  let request;
  const data = await loadLedger("./jobs.json", async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => fixture() };
  });
  assert.equal(request.url, "./jobs.json");
  assert.deepEqual(request.options, { cache: "no-store", headers: { Accept: "application/json" } });
  assert.deepEqual(data, fixture());
});

test("loadLedger rejects missing files and invalid payloads", async () => {
  await assert.rejects(loadLedger("./missing.json", async () => ({ ok: false, status: 404 })), /404/);
  await assert.rejects(loadLedger("./bad.json", async () => ({ ok: true, json: async () => ({}) })), /schema_version/);
});

test("static UI has no dispatch, persistence, mock metrics, or markup injection sinks", async () => {
  const html = await readFile(new URL("../mission-control/rwanda-ledger.html", import.meta.url), "utf8");
  const js = await readFile(new URL("../mission-control/rwanda-ledger.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(html + js, /\.innerHTML|localStorage|showTab|approvePost|auto-dispatch|new execution/i);
  assert.doesNotMatch(html, /fetch\s*\(/);
  assert.match(html, /Read-only ledger/);
  assert.match(html, /Not connected to agent execution/);
});

test("checked-in ledger fixture is empty and current-schema", async () => {
  const work = JSON.parse(await readFile(new URL("../work/rwanda/jobs.json", import.meta.url), "utf8"));
  const copy = JSON.parse(await readFile(new URL("../mission-control/jobs.json", import.meta.url), "utf8"));
  assert.deepEqual(work, copy);
  assert.deepEqual(validateLedger(work), []);
  assert.equal(work.jobs.length, 0);
  assert.match(work.generated_at, /Z$/);
});
