import type { DatabaseRow, DbAction, DbTrigger, DeliverableStatus, SourceEnvironment } from "../types";
import { classifyDatabaseName, addDaysIso, parseDatabaseContext } from "../lib/classify";

// Reference date aligned with demo “today” (May 17, 2026)
const TODAY = new Date("2026-05-17T00:00:00Z");

function d(offset: number) {
  return addDaysIso(TODAY, offset);
}

function row(
  id: string,
  name: string,
  server: string,
  environment: SourceEnvironment,
  sizeGb: number,
  action: DbAction,
  trigger: DbTrigger,
  deliverableStatus: DeliverableStatus,
  actionDate: string | null,
  deletionDate: string | null,
  windowDays: number | null,
  restoredByStaging: boolean,
  autoBackedUp = false,
): DatabaseRow {
  const parsed = parseDatabaseContext(name);
  const normalizedDeliverableStatus =
    deliverableStatus === "LIVE Completed" && !parsed.isLive
      ? null
      : deliverableStatus;
  return {
    id,
    name,
    accountName: parsed.accountName,
    conversionName: parsed.conversionName,
    liveCopyNumber: parsed.liveCopyNumber,
    server,
    environment,
    sizeGb,
    classification: classifyDatabaseName(name),
    action,
    trigger,
    deliverableStatus: normalizedDeliverableStatus,
    actionDate,
    deletionDate,
    windowDays,
    restoredByStaging,
    autoBackedUp,
  };
}

/** Mock databases — Account_Conversion naming; _SB / _ITL / _LIVE suffixes keep parsed context */
export const initialDatabases: DatabaseRow[] = [
  // ── Expires today (Day 5 of 5) ──
  row("db-1",  "WholeDentalWellness_C1",        "Aquila-1",  "Build VM",  12.3, "Delete",          "Trigger 1", "SB Completed",       d(-5),  d(0),   5, true),
  // ── Expires tomorrow (Day 4 of 5) ──
  row("db-2",  "SmileBright_C2",                "Aquila-1",  "Build VM",  8.7,  "Delete",          "Trigger 1", "ITL Completed",      d(-4),  d(1),   5, true),
  // ── Backup & Delete — _LIVE 30-day window ──
  row("db-3",  "WholeDentalWellness_C1_LIVE",   "Aquila-1",  "Aquila",    55.5, "Backup & Delete", "Trigger 2", "LIVE Completed",     d(0),   d(30),  30, false, true),
  row("db-4",  "WholeDentalWellness_C1_LIVE_2", "Aquila-2",  "Aquila",    120,  "Backup & Delete", "Trigger 2", "LIVE Completed",     d(0),   d(30),  30, false, true),
  // ── Pending Delete — longer window ──
  row("db-5",  "NorthBridgeDental_C3",          "Raven-1",   "Raven",     32,   "Scheduled Delete","Trigger 2", null,                 d(-10), d(7),   30, false),
  row("db-6",  "SmileBright_C2_LIVE",           "Orion-2",   "Aquila",    67,   "Backup & Delete", "Trigger 2", "LIVE Completed",     d(0),   d(30),  30, false, true),
  // ── Excluded ──
  row("db-7",  "CarePlusOrtho_C1",              "Aquila-3",  "Build VM",  18,   "None",            "None",      null,                 d(-5),  null,   null, true),
  row("db-8",  "CarePlusOrtho_C1_LIVE",         "Aquila-1",  "Aquila",    25,   "None",            "None",      null,                 d(-36), null,   null, false),
  row("db-9",  "NorthBridgeDental_C3_LIVE",     "Raven-1",   "Raven",     12.4, "None",            "None",      null,                 d(-84), null,   null, false),
  // Extra LIVE excluded case: still inside 30-day frame, useful to test "Lift Exclusion" reschedule prompt.
  row("db-19", "CarePlusOrtho_C1_LIVE_2",       "Aquila-2",  "Aquila",    27,   "Backup & Delete", "Trigger 2", "LIVE Completed",     d(-20), d(10),  30, false, true),
  // ── Monitored (no delete flow) — generic names use Active deliverable ──
  row("db-10", "LakesideDental_C4",             "Raven-2",   "Raven",     8.2,  "None",            "None",      "Active",             null,   null,   null, false),
  row("db-11", "LakesideDental_C4_SB",          "Aquila-3",  "Build VM",  15,   "None",            "None",      "Active",             null,   null,   null, true),
  row("db-12", "EastsideSmiles_C2",             "Aquila-2",  "Aquila",    3.1,  "Scheduled Delete","Trigger 1", "SB Completed",       d(0),   d(5),   5,  false),
  row("db-13", "EastsideSmiles_C2_ITL",         "Aquila-3",  "Build VM",  22,   "Scheduled Delete","Trigger 1", "ITL Completed",      d(0),   d(5),   5,  true),
  row("db-14", "MetroDentalGroup_C5_LIVE",      "Raven-3",   "Aquila",    200,  "Backup & Delete", "Trigger 2", "LIVE Completed",     d(0),   d(30),  30, false, true),
  row("db-15", "MetroDentalGroup_C5",           "Raven-1",   "Raven",     0.5,  "None",            "None",      "Active",             null,   null,   null, false),
  row("db-16", "WholeDentalWellness_C1_SB",     "Orion-1",   "SB",        40,   "Scheduled Delete","Trigger 1", "SB Completed",       d(0),   d(5),   5,  false),
  row("db-17", "WholeDentalWellness_C1_SB_2",   "Nova-1",    "SB",        28,   "Scheduled Delete","Trigger 1", "SB Completed",       d(0),   d(5),   5,  false),
  row("db-18", "WholeDentalWellness_C1_ITL",    "Atlas-1",   "ITL",       19,   "Scheduled Delete","Trigger 1", "ITL Completed",      d(0),   d(5),   5,  false),

  // ── ITL / SB copies — Account_Conversion in name (parsed account + conversion) ──
  row("db-20", "EastsideSmiles_C2_ITL_2",       "Aquila-1", "ITL", 41, "Scheduled Delete", "Trigger 1", "ITL Completed", d(0), d(5), 5, false),
  row("db-21", "MetroDentalGroup_C5_ITL",     "Orion-1",  "ITL", 58, "Scheduled Delete", "Trigger 1", "ITL Completed", d(0), d(5), 5, false),
  row("db-22", "LakesideDental_C4_ITL",       "Nova-1",   "ITL", 24, "Scheduled Delete", "Trigger 1", "ITL Completed", d(0), d(7),  7,  false),
  row("db-23", "NorthBridgeDental_C3_ITL",    "Aquila-2", "ITL", 76, "Scheduled Delete", "Trigger 1", "ITL Completed", d(0), d(7),  7,  false),
  row("db-24", "CarePlusOrtho_C1_ITL",        "Aquila-3", "ITL", 19, "Scheduled Delete", "Trigger 1", "ITL Completed", d(0), d(5), 5, false),
  row("db-25", "EastsideSmiles_C2_LIVE",                 "Raven-2",  "Aquila", 45, "Backup & Delete", "Trigger 2", "LIVE Completed", d(0), d(30), 30, false, true),
  row("db-26", "SummitOrtho_Phase1",                     "Raven-1",  "Raven", 14, "None", "None", "Active", null, null, null, false),
];
