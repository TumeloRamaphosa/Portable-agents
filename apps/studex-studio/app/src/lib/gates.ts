const G1_KEY = "studex-studio-g1";

export type G1State = "pending" | "yes" | "no" | "revise";

export function loadG1State(): G1State {
  const v = localStorage.getItem(G1_KEY);
  if (v === "yes" || v === "no" || v === "revise") return v;
  return "pending";
}

export function saveG1State(state: G1State): void {
  localStorage.setItem(G1_KEY, state);
}
