export type DotStatus = "up" | "down" | "unchecked" | "fixed";

export type ServiceDot = {
  id: string;
  label: string;
  status: DotStatus;
};

async function probeUrl(url: string): Promise<boolean> {
  if (!url.trim()) return false;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    await fetch(url, { method: "GET", mode: "no-cors", signal: controller.signal });
    clearTimeout(t);
    return true;
  } catch {
    return false;
  }
}

export async function probeConfigured(url: string): Promise<DotStatus> {
  if (!url.trim()) return "unchecked";
  const ok = await probeUrl(url);
  return ok ? "up" : "down";
}

export function fixedDot(id: string, label: string, status: DotStatus): ServiceDot {
  return { id, label, status };
}
