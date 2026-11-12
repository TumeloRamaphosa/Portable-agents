const STORAGE_KEY = "studex-studio-settings-v1";

export type StudioSettings = {
  vaultPath: string;
  endpointUrl: string;
  model: string;
  hermesUrl: string;
  giteaConfigured: boolean;
  ollamaProbeUrl: string;
  lmStudioProbeUrl: string;
  modelHouseProbeUrl: string;
  giteaProbeUrl: string;
  obsidianVaultSet: boolean;
};

const defaults: StudioSettings = {
  vaultPath: "",
  endpointUrl: import.meta.env.VITE_DEFAULT_ENDPOINT_URL ?? "",
  model: import.meta.env.VITE_DEFAULT_MODEL ?? "",
  hermesUrl: import.meta.env.VITE_HERMES_URL ?? "",
  giteaConfigured: false,
  ollamaProbeUrl: "",
  lmStudioProbeUrl: "",
  modelHouseProbeUrl: "",
  giteaProbeUrl: "",
  obsidianVaultSet: false,
};

export function loadSettings(): StudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(patch: Partial<StudioSettings>): StudioSettings {
  const next = { ...loadSettings(), ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function hasVaultPath(): boolean {
  return loadSettings().vaultPath.trim().length > 0;
}
