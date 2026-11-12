import { ACTIVE_JOB_STAGE, PIPELINE_STAGES } from "../data/pipeline";

export function PipelinePage() {
  return (
    <>
      <h1 className="headline">Pipeline</h1>
      <p style={{ color: "var(--muted)" }}>
        Active job stage: <span className="tag awaiting">{ACTIVE_JOB_STAGE}</span>
      </p>

      <section className="panel">
        <div className="pipeline">
          {PIPELINE_STAGES.map((stage) => (
            <div
              key={stage.id}
              className={`stage${stage.id === ACTIVE_JOB_STAGE ? " active" : ""}${
                "locked" in stage && stage.locked ? " locked" : ""
              }`}
            >
              {stage.label}
              {"locked" in stage && stage.locked && (
                <div style={{ fontSize: "0.65rem", marginTop: "0.25rem" }}>locked</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
