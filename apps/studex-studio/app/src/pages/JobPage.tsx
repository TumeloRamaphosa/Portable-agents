import { useParams, Link } from "react-router-dom";
import {
  ACTIVE_JOB,
  SCRIPT_SCENES,
  SHOT_LIST,
  VAULT_PATHS,
  GATES,
  LATER_ROOMS,
} from "../data/job";
import { loadG1State } from "../lib/gates";
import { loadSettings } from "../lib/settings";

export function JobPage() {
  const { jobId } = useParams();
  const g1 = loadG1State();
  const vault = loadSettings().vaultPath;

  if (jobId !== ACTIVE_JOB.id) {
    return (
      <p>
        Job not found.{" "}
        <Link to={`/jobs/${ACTIVE_JOB.id}`}>Open {ACTIVE_JOB.title}</Link>
      </p>
    );
  }

  return (
    <>
      <h1 className="headline">{ACTIVE_JOB.title}</h1>
      <p style={{ color: "var(--muted)" }}>
        {ACTIVE_JOB.product} · vault: {vault || "(unset)"}/{ACTIVE_JOB.vaultRelative}
      </p>

      <div className="grid-2">
        <section className="panel">
          <h2>Script</h2>
          <ol style={{ paddingLeft: "1.1rem", margin: 0 }}>
            {SCRIPT_SCENES.map((s) => (
              <li key={s.id} style={{ marginBottom: "0.65rem" }}>
                <strong>{s.title}</strong> — &ldquo;{s.line}&rdquo;
              </li>
            ))}
          </ol>
        </section>

        <section className="panel">
          <h2>Shot list</h2>
          <table className="data">
            <thead>
              <tr>
                <th>Scene</th>
                <th>Beat</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {SHOT_LIST.map((row) => (
                <tr key={row.scene}>
                  <td>{row.scene}</td>
                  <td>{row.beat}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="panel">
        <h2>Vault paths</h2>
        <ul>
          {VAULT_PATHS.map((p) => (
            <li key={p}>
              <code>
                {ACTIVE_JOB.vaultRelative}/{p}
              </code>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Gates</h2>
        <ul className="checklist">
          {GATES.map((g) => (
            <li key={g.id} className={g.operable ? "" : "locked"}>
              <input
                type="checkbox"
                checked={g.id === "G1" && g1 === "yes"}
                disabled={!g.operable}
                readOnly
              />
              <span>
                {g.id} — {g.label}
                {g.id === "G1" && (
                  <span className="tag awaiting" style={{ marginLeft: "0.35rem" }}>
                    {g1}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <Link to="/screening" className="btn">
          Screen G1
        </Link>
      </section>

      <section className="panel">
        <h2>Later</h2>
        <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
          Room cards — not installed in Phase 1
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {LATER_ROOMS.map((r) => (
            <span key={r} className="tag">
              {r}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
