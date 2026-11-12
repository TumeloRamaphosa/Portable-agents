export const SAST_SLOT_HOLDS = ["06:00", "12:30", "18:30", "19:30"] as const;

export type CalendarHold = {
  day: string;
  slots: readonly string[];
  label: string;
};

export const WEEK_HOLDS: CalendarHold[] = [
  { day: "Mon", slots: SAST_SLOT_HOLDS, label: "Hold — not a schedule" },
  { day: "Tue", slots: SAST_SLOT_HOLDS, label: "Hold — not a schedule" },
  { day: "Wed", slots: SAST_SLOT_HOLDS, label: "Hold — not a schedule" },
  { day: "Thu", slots: SAST_SLOT_HOLDS, label: "Hold — not a schedule" },
  { day: "Fri", slots: SAST_SLOT_HOLDS, label: "Hold — not a schedule" },
  { day: "Sat", slots: ["12:30", "18:30"], label: "Hold — lighter" },
  { day: "Sun", slots: ["06:00"], label: "Hold — planning" },
];
