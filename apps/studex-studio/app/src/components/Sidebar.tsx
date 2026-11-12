import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Today", end: true },
  { to: "/jobs/001-from-the-veld-to-the-table", label: "Jobs" },
  { to: "/content-plan", label: "Content plan" },
  { to: "/calendar", label: "Calendar" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/screening", label: "Screening" },
  { to: "/chat", label: "Writers' Room" },
  { to: "/settings", label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <h1>Studex Studio</h1>
        <div className="strap">Dark Factory · Phase 1</div>
      </div>
      <nav>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
