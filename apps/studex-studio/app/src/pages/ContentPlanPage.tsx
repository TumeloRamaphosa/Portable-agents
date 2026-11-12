import { CONTENT_PLAN_WEEK1, contentPlanJson } from "../data/contentPlan";

export function ContentPlanPage() {
  return (
    <>
      <h1 className="headline">Content plan</h1>
      <p style={{ color: "var(--muted)" }}>Week 1 seed · drafts awaiting G1</p>

      <section className="panel">
        <h2>Week 1</h2>
        <table className="data">
          <thead>
            <tr>
              <th>Day</th>
              <th>Title</th>
              <th>Format</th>
              <th>Status</th>
              <th>Gate</th>
            </tr>
          </thead>
          <tbody>
            {CONTENT_PLAN_WEEK1.map((row) => (
              <tr key={row.day}>
                <td>{row.day}</td>
                <td>{row.title}</td>
                <td>{row.format}</td>
                <td>
                  <span
                    className={`tag${row.status === "awaiting-g1" ? " awaiting" : ""}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td>{row.gate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>JSON seed</h2>
        <pre
          style={{
            fontSize: "0.75rem",
            overflow: "auto",
            margin: 0,
            color: "var(--muted)",
          }}
        >
          {JSON.stringify(contentPlanJson, null, 2)}
        </pre>
      </section>
    </>
  );
}
