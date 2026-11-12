export const PIPELINE_STAGES = [
  { id: "idea", label: "Idea" },
  { id: "script", label: "Script" },
  { id: "compliance", label: "Compliance" },
  { id: "visual", label: "Visual drafts" },
  { id: "edit", label: "Edit" },
  { id: "approval", label: "Approval" },
  { id: "blotato", label: "Blotato draft" },
  { id: "publish", label: "Publish", locked: true },
] as const;

export const ACTIVE_JOB_STAGE = "script";
