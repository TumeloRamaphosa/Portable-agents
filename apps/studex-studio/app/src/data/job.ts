export const ACTIVE_JOB_ID = "001-from-the-veld-to-the-table";

export const ACTIVE_JOB = {
  id: ACTIVE_JOB_ID,
  title: "From the Veld to the Table",
  product: "Wagyu Biltong Gold",
  narrator: "StudBot (approved originals only)",
  nextGate: "G1",
  vaultRelative: `Studio/Jobs/${ACTIVE_JOB_ID}`,
};

export const SCRIPT_SCENES = [
  {
    id: 1,
    title: "Dawn on the farm",
    line: "Before there was a brand, there was a farmer who got up before the sun.",
  },
  {
    id: 2,
    title: "The craft",
    line: "Wagyu Biltong Gold isn't rushed. It's made the old way, then checked the new way.",
  },
  {
    id: 3,
    title: "The proof",
    line: "Every batch carries its story: where it came from, who handled it, and when.",
  },
  {
    id: 4,
    title: "The table",
    line: "From the farmer's hands to yours. Studex. Proof before scale.",
  },
  {
    id: 5,
    title: "Close",
    line: "This is just the start. We're aiming to bring this standard to coffee next.",
  },
];

export const SHOT_LIST = [
  { scene: 1, beat: "Dawn", note: "Wide veld, pre-dawn light" },
  { scene: 2, beat: "Craft", note: "Hands, curing rack" },
  { scene: 3, beat: "Proof", note: "Batch trace card" },
  { scene: 4, beat: "Table", note: "Product on board" },
  { scene: 5, beat: "Close", note: "Studex mark, hold" },
];

export const VAULT_PATHS = [
  "README.md",
  "script.md",
  "shot-list.md",
  "reviews.md",
  "drafts/",
  "finals/",
];

export const GATES = [
  { id: "G1", label: "Script lock", operable: true },
  { id: "G2", label: "Local draft accepted", operable: false },
  { id: "G3", label: "Paid polish", operable: false },
  { id: "G4", label: "Final cut", operable: false },
  { id: "G5", label: "Schedule draft (Blotato)", operable: false },
];

export const LATER_ROOMS = [
  "Magnific",
  "Open Higgsfield",
  "OpenMontage",
  "Blender",
  "DaVinci Resolve",
  "Okara marketing team",
  "ComfyUI",
];

export const MESH_NODES = [
  { name: "MacBook", role: "Director", status: "placeholder" },
  { name: "Razer", role: "Render", status: "placeholder" },
  { name: "Mac mini", role: "Studio node", status: "placeholder" },
  { name: "big babushka", role: "Heavy render", status: "placeholder" },
];
