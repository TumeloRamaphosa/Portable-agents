import { useEffect, useState } from "react";
import { loadSettings } from "../lib/settings";
import { probeConfigured, fixedDot, type ServiceDot } from "../lib/statusProbe";

function Dot({ s }: { s: ServiceDot }) {
  return (
    <span className="dot-item" title={s.status}>
      <span className={`dot ${s.status}`} />
      {s.label}
    </span>
  );
}

export function StatusDots() {
  const [dots, setDots] = useState<ServiceDot[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const s = loadSettings();
      const probes = await Promise.all([
        probeConfigured(s.hermesUrl),
        probeConfigured(s.ollamaProbeUrl),
        probeConfigured(s.lmStudioProbeUrl),
        probeConfigured(s.modelHouseProbeUrl),
        probeConfigured(s.giteaProbeUrl),
      ]);
      if (cancelled) return;
      const vaultStatus = s.vaultPath.trim()
        ? s.obsidianVaultSet
          ? ("up" as const)
          : ("unchecked" as const)
        : ("unchecked" as const);
      setDots([
        { id: "hermes", label: "Hermes", status: probes[0] },
        { id: "ollama", label: "Ollama", status: probes[1] },
        { id: "lmstudio", label: "LM Studio", status: probes[2] },
        { id: "modelhouse", label: "Model house", status: probes[3] },
        { id: "gitea", label: "Gitea", status: probes[4] },
        fixedDot("blotato", "Blotato drafts", "fixed"),
        { id: "obsidian", label: "Obsidian vault", status: vaultStatus },
      ]);
    }
    run();
    const id = setInterval(run, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="status-dots">
      {dots.map((d) => (
        <Dot key={d.id} s={d} />
      ))}
    </div>
  );
}
