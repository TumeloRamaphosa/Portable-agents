import { Link } from "react-router-dom";
import { ACTIVE_JOB, MESH_NODES } from "../data/job";
import { loadG1State } from "../lib/gates";

export function TodayPage() {
  const g1 = loadG1State();

  return (
    <>
      <h1 className="headline">Today</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.25rem" }}>
        One active job · next gate · mesh placeholder · Robuska&apos;s mom&apos;s house (Phase 2)
      </p>

      <div className="grid-2">
        <section className="panel">
          <h2>Active job</h2>
          <p className="headline" style={{ fontSize: "1.15rem" }}>
            {ACTIVE_JOB.title}
          </p>
          <p>{ACTIVE_JOB.product}</p>
          <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
            {ACTIVE_JOB.narrator}
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            Next gate: <span className="tag awaiting">{ACTIVE_JOB.nextGate}</span>
            {g1 !== "pending" && (
              <span className="tag" style={{ marginLeft: "0.35rem" }}>
                G1: {g1}
              </span>
            )}
          </p>
          <Link to={`/jobs/${ACTIVE_JOB.id}`} className="btn primary" style={{ marginTop: "1rem", display: "inline-block" }}>
            Open job
          </Link>
        </section>

        <section className="panel">
          <h2>Mesh (placeholder)</h2>
          {MESH_NODES.map((n) => (
            <div key={n.name} className="mesh-node">
              <span>{n.name}</span>
              <span style={{ color: "var(--muted)" }}>
                {n.role} · {n.status}
              </span>
            </div>
          ))}
        </section>
      </div>

      <section className="panel">
        <h2>Service status</h2>
        <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
          Dots in the header probe only URLs you configure in Settings. Blotato drafts stays not wired.
        </p>
      </section>
    </>
  );
}
