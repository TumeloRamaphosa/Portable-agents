const JOB_STATES = new Set(["planned", "dispatched", "completed_work", "awaiting_approval", "reviewed", "released", "blocked"]);

export function validateLedger(data) {
  if (data === null || typeof data !== "object" || Array.isArray(data)) return ["ledger: must be an object"];
  const errors = [];
  if (data.schema_version !== 1) errors.push("schema_version: must equal 1");
  if (typeof data.company_id !== "string" || !data.company_id.trim()) errors.push("company_id: must be a nonempty string");
  if (typeof data.generated_at !== "string" || !data.generated_at.trim()) errors.push("generated_at: must be a nonempty string");
  if (!Array.isArray(data.jobs)) {
    errors.push("jobs: must be an array");
  } else {
    data.jobs.forEach((job, index) => {
      if (job === null || typeof job !== "object" || Array.isArray(job)) {
        errors.push(`jobs[${index}]: must be an object`);
        return;
      }
      for (const field of ["id", "title", "state", "owner", "created_at"]) {
        if (typeof job[field] !== "string" || !job[field].trim()) errors.push(`jobs[${index}].${field}: must be a nonempty string`);
      }
      if (typeof job.state === "string" && !JOB_STATES.has(job.state)) errors.push(`jobs[${index}].state: unsupported state`);
    });
  }
  return errors.sort();
}

export async function loadLedger(url, fetchImplementation) {
  const request = fetchImplementation || globalThis.fetch;
  const response = await request(url, { cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Ledger request failed (${response.status})`);
  const data = await response.json();
  const errors = validateLedger(data);
  if (errors.length) throw new Error(errors.join("; "));
  return data;
}
