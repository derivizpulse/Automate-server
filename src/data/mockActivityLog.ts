import type { ActivityEntry } from "../types";

/** Demo “today” — aligned with mockDatabases (May 17, 2026). */
const TODAY = new Date("2026-05-17T14:00:00.000Z");

function atDaysAgo(days: number, hour = 14, minute = 0): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

/**
 * Seed audit log — events spread across 7d / 30d / 90d windows for date-range demos.
 * Newest entries first.
 */
export const initialActivityLog: ActivityEntry[] = [
  // ── Last 24h (always in “Last 7 days”) ──
  {
    id: "act-23-reschedule",
    at: atDaysAgo(0, 7, 30),
    message:
      "Rescheduled deletion date — May 22, 2026 → May 24, 2026 (retention window: 5 → 7 days)",
    dbId: "db-23",
    dbName: "NorthBridgeDental_C3_ITL",
    server: "Aquila-2",
    category: "manual",
    actorName: "Morgan Patel",
  },
  {
    id: "act-22-reschedule",
    at: atDaysAgo(0, 7, 14),
    message:
      "Rescheduled deletion date — May 22, 2026 → May 24, 2026 (retention window: 5 → 7 days)",
    dbId: "db-22",
    dbName: "LakesideDental_C4_ITL",
    server: "Nova-1",
    category: "manual",
    actorName: "Alex Kim",
  },
  {
    id: "act-sys-delete-recent",
    at: atDaysAgo(0, 6, 5),
    message: "Database deleted by automation — scheduled retention window ended",
    dbId: "db-11",
    dbName: "LakesideDental_C4_SB",
    server: "Aquila-3",
    category: "automation",
  },
  {
    id: "act-backup-live",
    at: atDaysAgo(0, 10, 20),
    message: "Backup completed — \\\\orion-2\\backups\\SmileBright_C2_LIVE_20260517.zip",
    dbId: "db-6",
    dbName: "SmileBright_C2_LIVE",
    server: "Orion-2",
    category: "manual",
    actorName: "Jordan Lee",
  },
  {
    id: "act-t2",
    at: atDaysAgo(0, 9, 15),
    message:
      "Trigger 2: Conversion implemented — Live: 3 → Backup & delete (+30d) · Build VM: 2 → Delete (+5d) · CS envs: 10 → Scheduled delete (+7d)",
    dbName: "—",
    server: "—",
    category: "trigger",
  },
  {
    id: "act-23-schedule",
    at: atDaysAgo(0, 9, 16),
    message: "Scheduled — triggers May 17, 2026 · deletion May 22, 2026",
    dbId: "db-23",
    dbName: "NorthBridgeDental_C3_ITL",
    server: "Aquila-2",
    category: "manual",
    actorName: "Morgan Patel",
  },
  {
    id: "act-22-schedule",
    at: atDaysAgo(0, 9, 16),
    message: "Scheduled — triggers May 17, 2026 · deletion May 22, 2026",
    dbId: "db-22",
    dbName: "LakesideDental_C4_ITL",
    server: "Nova-1",
    category: "manual",
    actorName: "Alex Kim",
  },
  {
    id: "act-init",
    at: atDaysAgo(0, 8, 0),
    message: "Deriviz initialized — databases synced across server groups",
    dbName: "—",
    server: "All",
    category: "system",
  },

  // ── 2–6 days ago (still in 7d window) ──
  {
    id: "act-exclude-7",
    at: atDaysAgo(3, 11, 0),
    message: "Excluded from automated actions",
    dbId: "db-7",
    dbName: "CarePlusOrtho_C1",
    server: "Aquila-3",
    category: "manual",
    actorName: "Sam Rivera",
  },
  {
    id: "act-16-schedule",
    at: atDaysAgo(4, 15, 30),
    message: "Scheduled — triggers May 13, 2026 · deletion May 18, 2026",
    dbId: "db-16",
    dbName: "WholeDentalWellness_C1_SB",
    server: "Orion-1",
    category: "manual",
    actorName: "Jordan Lee",
  },
  {
    id: "act-delete-now-12",
    at: atDaysAgo(5, 9, 45),
    message: "Deletion requested (manual)",
    dbId: "db-12",
    dbName: "EastsideSmiles_C2",
    server: "Aquila-2",
    category: "manual",
    actorName: "Alex Kim",
  },
  {
    id: "act-t1-partial",
    at: atDaysAgo(6, 8, 30),
    message:
      "Trigger 1: SB & ITL deliverables complete — Staging Restorer Build VM deletions scheduled",
    dbName: "—",
    server: "—",
    category: "trigger",
  },

  // ── 8–25 days ago (30d window, outside 7d) ──
  {
    id: "act-lift-exclusion",
    at: atDaysAgo(12, 13, 10),
    message: "Exclusion lifted — deletion scheduled May 28, 2026",
    dbId: "db-19",
    dbName: "CarePlusOrtho_C1_LIVE_2",
    server: "Aquila-2",
    category: "manual",
    actorName: "Morgan Patel",
  },
  {
    id: "act-sys-delete-older",
    at: atDaysAgo(15, 3, 0),
    message: "Database deleted by automation — scheduled retention window ended",
    dbId: "db-1",
    dbName: "WholeDentalWellness_C1",
    server: "Aquila-1",
    category: "automation",
  },
  {
    id: "act-14-backup-delete",
    at: atDaysAgo(18, 16, 0),
    message: "Scheduled — triggers Apr 29, 2026 · deletion May 29, 2026",
    dbId: "db-14",
    dbName: "MetroDentalGroup_C5_LIVE",
    server: "Raven-3",
    category: "manual",
    actorName: "Sam Rivera",
  },
  {
    id: "act-t2-older",
    at: atDaysAgo(22, 9, 0),
    message:
      "Trigger 2: Conversion implemented — Live: 2 → Backup & delete (+30d) · Build VM: 1 → Delete (+5d) · CS envs: 8 → Scheduled delete (+7d)",
    dbName: "—",
    server: "—",
    category: "trigger",
  },
  {
    id: "act-5-reschedule-old",
    at: atDaysAgo(24, 14, 20),
    message:
      "Rescheduled deletion date — May 1, 2026 → May 8, 2026 (retention window: 30 → 37 days)",
    dbId: "db-5",
    dbName: "NorthBridgeDental_C3",
    server: "Raven-1",
    category: "manual",
    actorName: "Jordan Lee",
  },

  // ── 35–80 days ago (90d window, outside 30d) ──
  {
    id: "act-bulk-sb",
    at: atDaysAgo(42, 10, 0),
    message: "Trigger 1 batch — 4 SB databases scheduled for 5-day delete window",
    dbName: "—",
    server: "—",
    category: "trigger",
  },
  {
    id: "act-17-schedule-old",
    at: atDaysAgo(48, 11, 30),
    message: "Scheduled — triggers Mar 30, 2026 · deletion Apr 4, 2026",
    dbId: "db-17",
    dbName: "WholeDentalWellness_C1_SB_2",
    server: "Nova-1",
    category: "manual",
    actorName: "Alex Kim",
  },
  {
    id: "act-sys-delete-legacy",
    at: atDaysAgo(55, 2, 15),
    message: "Database deleted by automation — scheduled retention window ended",
    dbId: "db-2",
    dbName: "SmileBright_C2",
    server: "Aquila-1",
    category: "automation",
  },
  {
    id: "act-sync-older",
    at: atDaysAgo(62, 8, 0),
    message: "Nightly sync completed — 28 databases across 6 servers",
    dbName: "—",
    server: "All",
    category: "system",
  },
  {
    id: "act-8-exclude-old",
    at: atDaysAgo(74, 15, 45),
    message: "Excluded from automated actions",
    dbId: "db-8",
    dbName: "CarePlusOrtho_C1_LIVE",
    server: "Aquila-1",
    category: "manual",
    actorName: "Morgan Patel",
  },
  {
    id: "act-t1-legacy",
    at: atDaysAgo(82, 7, 0),
    message:
      "Trigger 1: SB & ITL deliverables complete — Staging Restorer Build VM deletions scheduled",
    dbName: "—",
    server: "—",
    category: "trigger",
  },
  {
    id: "act-33-backup",
    at: atDaysAgo(0, 11, 45),
    message: "Manual backup started — CoastalFamily_C2_LIVE",
    dbId: "db-33",
    dbName: "CoastalFamily_C2_LIVE",
    server: "Phoenix-1",
    category: "manual",
    actorName: "Jordan Lee",
  },
  {
    id: "act-32-delete-schedule",
    at: atDaysAgo(0, 8, 20),
    message: "Scheduled delete — ValleyViewDental_C4 · deletion May 19, 2026",
    dbId: "db-32",
    dbName: "ValleyViewDental_C4",
    server: "Sandbox-1",
    category: "manual",
    actorName: "Alex Kim",
  },
  {
    id: "act-35-sync",
    at: atDaysAgo(1, 6, 0),
    message: "Nightly sync completed — 40 databases across 8 servers",
    dbName: "—",
    server: "All",
    category: "system",
  },
  {
    id: "act-40-exclude",
    at: atDaysAgo(3, 14, 30),
    message: "Excluded from automated actions",
    dbId: "db-36",
    dbName: "SunriseDental_C5",
    server: "Raven-2",
    category: "manual",
    actorName: "Morgan Patel",
  },
  {
    id: "act-47-live-trigger",
    at: atDaysAgo(0, 8, 0),
    message: "Trigger 2: LIVE milestone complete — WestsideFamily_C3_LIVE scheduled for backup & delete (+30d)",
    dbId: "db-47",
    dbName: "WestsideFamily_C3_LIVE",
    server: "Aquila-2",
    category: "trigger",
  },
  {
    id: "act-45-itl-complete",
    at: atDaysAgo(1, 10, 15),
    message: "ITL milestone marked complete — Clearwater_C2_ITL entered scheduled delete (+7d)",
    dbId: "db-45",
    dbName: "Clearwater_C2_ITL",
    server: "Atlas-1",
    category: "trigger",
  },
  {
    id: "act-43-sb-complete",
    at: atDaysAgo(2, 9, 30),
    message: "SB milestone marked complete — SilverLake_C1_SB scheduled for deletion (+5d)",
    dbId: "db-43",
    dbName: "SilverLake_C1_SB",
    server: "Orion-1",
    category: "trigger",
  },
];
