const PODS = [
  { name: "Schpielberg", role: "Content desk" },
  { name: "Writers' Room", role: "Draft" },
  { name: "Naledi", role: "Line check" },
  { name: "Queue", role: "Idle" },
];

export function AgentPods() {
  return (
    <footer className="agent-pods" aria-label="Agent pods">
      {PODS.map((p) => (
        <div key={p.name} className="agent-pod">
          <strong>{p.name}</strong> · {p.role}
        </div>
      ))}
    </footer>
  );
}
