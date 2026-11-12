import { ACTIVE_JOB } from "../data/job";
import { loadSettings } from "./settings";

const REVIEWS_KEY = "studex-studio-reviews-md";

export function loadReviewsMarkdown(): string {
  return (
    localStorage.getItem(REVIEWS_KEY) ??
    "# Reviews and gate decisions\n\n"
  );
}

export function appendReviewEntry(entry: {
  gate: string;
  decision: string;
  note?: string;
}): string {
  const ts = new Date().toISOString();
  const block =
    `\n## ${entry.gate} — ${entry.decision}\n- **When:** ${ts}\n` +
    (entry.note ? `- **Note:** ${entry.note}\n` : "");
  const next = loadReviewsMarkdown() + block;
  localStorage.setItem(REVIEWS_KEY, next);
  return next;
}

export function vaultReviewsPath(): string | null {
  const vault = loadSettings().vaultPath.trim();
  if (!vault) return null;
  return `${vault}/${ACTIVE_JOB.vaultRelative}/reviews.md`;
}

export function downloadReviewsFile(): void {
  const blob = new Blob([loadReviewsMarkdown()], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reviews.md";
  a.click();
  URL.revokeObjectURL(url);
}
