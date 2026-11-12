import { useState } from "react";
import { loadSettings, saveSettings, type StudioSettings } from "../lib/settings";

export function SettingsPage() {
  const [form, setForm] = useState<StudioSettings>(loadSettings());
  const [saved, setSaved] = useState(false);

  function update<K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    saveSettings(form);
    setSaved(true);
  }

  return (
    <>
      <h1 className="headline">Settings</h1>
      <p style={{ color: "var(--muted)" }}>
        Stored in localStorage. Optional defaults via <code>.env.local</code> (gitignored).
      </p>

      <form className="panel" onSubmit={onSave}>
        <div className="field-row">
          <label className="field">Vault path</label>
          <input
            value={form.vaultPath}
            onChange={(e) => update("vaultPath", e.target.value)}
            placeholder="Absolute path to Obsidian vault"
          />
        </div>
        <div className="field-row">
          <label className="field">Chat endpoint URL (OpenAI-compatible)</label>
          <input
            value={form.endpointUrl}
            onChange={(e) => update("endpointUrl", e.target.value)}
            placeholder="Your local LLM endpoint"
          />
        </div>
        <div className="field-row">
          <label className="field">Model</label>
          <input
            value={form.model}
            onChange={(e) => update("model", e.target.value)}
            placeholder="Model name"
          />
        </div>
        <div className="field-row">
          <label className="field">Hermes URL</label>
          <input
            value={form.hermesUrl}
            onChange={(e) => update("hermesUrl", e.target.value)}
            placeholder="Hermes link"
          />
        </div>
        <div className="field-row">
          <label className="field">
            <input
              type="checkbox"
              checked={form.giteaConfigured}
              onChange={(e) => update("giteaConfigured", e.target.checked)}
            />{" "}
            Gitea remote configured
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            <input
              type="checkbox"
              checked={form.obsidianVaultSet}
              onChange={(e) => update("obsidianVaultSet", e.target.checked)}
            />{" "}
            Obsidian vault reachable (manual confirm)
          </label>
        </div>

        <h2 style={{ marginTop: "1rem" }}>Status probe URLs</h2>
        <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
          Only configured URLs are probed. Leave blank for unchecked.
        </p>
        <div className="field-row">
          <label className="field">Ollama probe URL</label>
          <input
            value={form.ollamaProbeUrl}
            onChange={(e) => update("ollamaProbeUrl", e.target.value)}
          />
        </div>
        <div className="field-row">
          <label className="field">LM Studio probe URL</label>
          <input
            value={form.lmStudioProbeUrl}
            onChange={(e) => update("lmStudioProbeUrl", e.target.value)}
          />
        </div>
        <div className="field-row">
          <label className="field">Model house (OmniRoute) probe URL</label>
          <input
            value={form.modelHouseProbeUrl}
            onChange={(e) => update("modelHouseProbeUrl", e.target.value)}
          />
        </div>
        <div className="field-row">
          <label className="field">Gitea probe URL</label>
          <input
            value={form.giteaProbeUrl}
            onChange={(e) => update("giteaProbeUrl", e.target.value)}
          />
        </div>

        <button type="submit" className="btn primary">
          Save
        </button>
        {saved && (
          <span style={{ marginLeft: "0.75rem", color: "var(--up)", fontSize: "0.8rem" }}>
            Saved
          </span>
        )}
      </form>
    </>
  );
}
