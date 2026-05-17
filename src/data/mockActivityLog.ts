import type { ActivityEntry } from "../types";

function minutesAgo(m: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - m);
  return d.toISOString();
}

/** Seed audit log — includes manual reschedules that explain 7-day ITL windows */
export const initialActivityLog: ActivityEntry[] = [
  {
    id: "act-init",
    at: "2026-05-17T08:00:00.000Z",
    message: "Deriviz initialized — databases synced across server groups",
    dbName: "—",
    server: "All",
    category: "system",
  },
  {
    id: "act-t2",
    at: "2026-05-17T09:15:00.000Z",
    message:
      "Trigger 2: Conversion implemented — Live: 3 → Backup & delete (+30d) · Build VM: 2 → Delete (+5d) · CS envs: 10 → Scheduled delete (+7d)",
    dbName: "—",
    server: "—",
    category: "trigger",
  },
  {
    id: "act-22-schedule",
    at: "2026-05-17T09:16:02.000Z",
    message: "Scheduled — triggers May 17, 2026 · deletion May 22, 2026",
    dbId: "db-22",
    dbName: "LakesideDental_C4_ITL",
    server: "Nova-1",
    category: "manual",
  },
  {
    id: "act-23-schedule",
    at: "2026-05-17T09:16:04.000Z",
    message: "Scheduled — triggers May 17, 2026 · deletion May 22, 2026",
    dbId: "db-23",
    dbName: "NorthBridgeDental_C3_ITL",
    server: "Aquila-2",
    category: "manual",
  },
  {
    id: "act-22-reschedule",
    at: minutesAgo(38),
    message:
      "Rescheduled deletion date — May 22, 2026 → May 24, 2026 (retention window: 5 → 7 days)",
    dbId: "db-22",
    dbName: "LakesideDental_C4_ITL",
    server: "Nova-1",
    category: "manual",
  },
  {
    id: "act-23-reschedule",
    at: minutesAgo(22),
    message:
      "Rescheduled deletion date — May 22, 2026 → May 24, 2026 (retention window: 5 → 7 days)",
    dbId: "db-23",
    dbName: "NorthBridgeDental_C3_ITL",
    server: "Aquila-2",
    category: "manual",
  },
];
