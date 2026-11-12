export type ContentRow = {
  week: number;
  day: string;
  title: string;
  format: string;
  status: "draft" | "awaiting-g1" | "locked";
  gate: string;
};

export const CONTENT_PLAN_WEEK1: ContentRow[] = [
  {
    week: 1,
    day: "Mon",
    title: "From the Veld to the Table — script read",
    format: "Launch video",
    status: "awaiting-g1",
    gate: "G1",
  },
  {
    week: 1,
    day: "Tue",
    title: "Proof before scale — brand strap",
    format: "Short",
    status: "draft",
    gate: "G1",
  },
  {
    week: 1,
    day: "Wed",
    title: "Biltong craft — process sketch",
    format: "Still board",
    status: "draft",
    gate: "G1",
  },
  {
    week: 1,
    day: "Thu",
    title: "Trace card explainer",
    format: "Carousel draft",
    status: "draft",
    gate: "G1",
  },
  {
    week: 1,
    day: "Fri",
    title: "Week-one wrap — vault log",
    format: "Note",
    status: "draft",
    gate: "G1",
  },
];

export const contentPlanJson = {
  series: "Studex Studio week 1",
  timezone: "SAST",
  rows: CONTENT_PLAN_WEEK1,
};
