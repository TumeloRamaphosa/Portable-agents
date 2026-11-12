import { useState } from "react";
import { appendReviewEntry, vaultReviewsPath, downloadReviewsFile } from "../lib/reviews";
import { saveG1State, loadG1State, type G1State } from "../lib/gates";
import { hasVaultPath } from "../lib/settings";

export function ScreeningPage() {
  const [g1, setG1] = useState<G1State>(loadG1State());
  const [note, setNote] = useState("");
  const [lastPath, setLastPath] = useState<string | null>(vaultReviewsPath());

  function decide(decision: G1State) {
    if (decision === "pending") return;
    saveG1State(decision);
    setG1(decision);
    appendReviewEntry({ gate: "G1 Script lock", decision, note: note || undefined });
    setLastPath(vaultReviewsPath());
    setNote("");
  }

  return (
    <>
      <h1 className="headline">Screening</h1>
      <p style={{ color: "var(--muted)" }}>
        G1 — yes / no / revise. Appends to reviews content when vault path is set.
      </p>

      <section className="panel">
        <p>
          Current G1: <span className="tag awaiting">{g1}</span>
        </p>
        <div className="field-row">
          <label className="field">Note (optional)</label>
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" className="btn primary" onClick={() => decide("yes")}>
            Yes — lock script
          </button>
          <button type="button" className="btn" onClick={() => decide("no")}>
            No
          </button>
          <button type="button" className="btn" onClick={() => decide("revise")}>
            Revise
          </button>
        </div>
      </section>

      {hasVaultPath() && lastPath && (
        <div className="banner">
          Vault target: <code>{lastPath}</code> — copy into your vault or download reviews.md
          <div style={{ marginTop: "0.5rem" }}>
            <button type="button" className="btn" onClick={downloadReviewsFile}>
              Download reviews.md
            </button>
          </div>
        </div>
      )}
    </>
  );
}
