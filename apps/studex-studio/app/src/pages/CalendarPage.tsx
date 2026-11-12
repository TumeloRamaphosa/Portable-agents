import { WEEK_HOLDS, SAST_SLOT_HOLDS } from "../data/calendar";

export function CalendarPage() {
  return (
    <>
      <h1 className="headline">Calendar</h1>
      <p style={{ color: "var(--muted)" }}>
        Week view · SAST holds {SAST_SLOT_HOLDS.join(" / ")} — not schedules
      </p>

      <div className="grid-2">
        {WEEK_HOLDS.map((day) => (
          <section key={day.day} className="panel">
            <h2>{day.day}</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{day.label}</p>
            <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1rem" }}>
              {day.slots.map((slot) => (
                <li key={slot}>
                  {slot} SAST <span className="tag">hold</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
