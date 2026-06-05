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

/** Mock databases — sizes span TB (>1000 GB), GB (10–1000), and MB (<10) for display demos */
export const initialDatabases: DatabaseRow[] = [
  // ── Expires today (Day 5 of 5) ──
  row("db-1",  "WholeDentalWellness_C1",        "Aquila-1",  "Build VM",  12.3,  "Delete",          "Trigger 1", "SB Completed",       d(-5),  d(0),   5, true),
  // ── Expires tomorrow (Day 4 of 5) ──
  row("db-2",  "SmileBright_C2",                "Aquila-1",  "Build VM",  6.8,   "Delete",          "Trigger 1", "ITL Completed",      d(-4),  d(1),   5, true),
  // ── Backup & Delete — _LIVE 30-day window ──
  row("db-3",  "WholeDentalWellness_C1_LIVE",   "Aquila-1",  "Aquila",    55.5,  "Backup & Delete", "Trigger 2", "LIVE Completed",     d(0),   d(30),  30, false, true),
  row("db-4",  "WholeDentalWellness_C1_LIVE_2", "Aquila-2",  "Aquila",    1350,  "Backup & Delete", "Trigger 2", "LIVE Completed",     d(0),   d(30),  30, false, true),
  // ── Pending Delete — longer window ──
  row("db-5",  "NorthBridgeDental_C3",          "Raven-1",   "Raven",     32,    "Scheduled Delete","Trigger 2", null,                 d(-10), d(7),   30, false),
  row("db-6",  "SmileBright_C2_LIVE",           "Orion-2",   "Aquila",    67,    "Backup & Delete", "Trigger 2", "LIVE Completed",     d(0),   d(30),  30, false, true),
  // ── Excluded ──
  row("db-7",  "CarePlusOrtho_C1",              "Aquila-3",  "Build VM",  18,    "None",            "None",      null,                 d(-5),  null,   null, true),
  row("db-8",  "CarePlusOrtho_C1_LIVE",         "Aquila-1",  "Aquila",    25,    "None",            "None",      null,                 d(-36), null,   null, false),
  row("db-9",  "NorthBridgeDental_C3_LIVE",     "Raven-1",   "Raven",     12.4,  "None",            "None",      null,                 d(-84), null,   null, false),
  row("db-19", "CarePlusOrtho_C1_LIVE_2",       "Aquila-2",  "Aquila",    27,    "Backup & Delete", "Trigger 2", "LIVE Completed",     d(-20), d(10),  30, false, true),
  // ── Monitored (no delete flow) ──
  row("db-10", "LakesideDental_C4",             "Raven-2",   "Raven",     8.2,   "None",            "None",      "Active",             null,   null,   null, false),
  row("db-11", "LakesideDental_C4_SB",          "Aquila-3",  "Build VM",  15,    "None",            "None",      "Active",             null,   null,   null, true),
  row("db-12", "EastsideSmiles_C2",             "Aquila-2",  "Aquila",    3.1,   "Scheduled Delete","Trigger 1", "SB Completed",       d(0),   d(5),   5,  false),
  row("db-13", "EastsideSmiles_C2_ITL",         "Aquila-3",  "Build VM",  22,    "Scheduled Delete","Trigger 1", "ITL Completed",      d(0),   d(5),   5,  true),
  row("db-14", "MetroDentalGroup_C5_LIVE",      "Raven-3",   "Aquila",    2100,  "Backup & Delete", "Trigger 2", "LIVE Completed",     d(0),   d(30),  30, false, true),
  row("db-15", "MetroDentalGroup_C5",           "Raven-1",   "Raven",     0.5,   "None",            "None",      "Active",             null,   null,   null, false),
  row("db-16", "WholeDentalWellness_C1_SB",     "Orion-1",   "SB",        40,    "Scheduled Delete","Trigger 1", "SB Completed",       d(0),   d(5),   5,  false),
  row("db-17", "WholeDentalWellness_C1_SB_2",   "Nova-1",    "SB",        28,    "Scheduled Delete","Trigger 1", "SB Completed",       d(0),   d(5),   5,  false),
  row("db-18", "WholeDentalWellness_C1_ITL",    "Atlas-1",   "ITL",       19,    "Scheduled Delete","Trigger 1", "ITL Completed",      d(0),   d(5),   5,  false),

  // ── ITL / SB copies ──
  row("db-20", "EastsideSmiles_C2_ITL_2",       "Aquila-1",  "ITL",       41,    "Scheduled Delete", "Trigger 1", "ITL Completed", d(0), d(5), 5, false),
  row("db-21", "MetroDentalGroup_C5_ITL",       "Orion-1",   "ITL",       58,    "Scheduled Delete", "Trigger 1", "ITL Completed", d(0), d(5), 5, false),
  row("db-22", "LakesideDental_C4_ITL",         "Nova-1",    "ITL",       24,    "Scheduled Delete", "Trigger 1", "ITL Completed", d(0), d(7),  7,  false),
  row("db-23", "NorthBridgeDental_C3_ITL",      "Aquila-2",  "ITL",       76,    "Scheduled Delete", "Trigger 1", "ITL Completed", d(0), d(7),  7,  false),
  row("db-24", "CarePlusOrtho_C1_ITL",          "Aquila-3",  "ITL",       19,    "Scheduled Delete", "Trigger 1", "ITL Completed", d(0), d(5), 5, false),
  row("db-25", "EastsideSmiles_C2_LIVE",        "Raven-2",   "Aquila",    45,    "Backup & Delete", "Trigger 2", "LIVE Completed", d(0), d(30), 30, false, true),
  row("db-26", "SummitOrtho_Phase1",            "Raven-1",   "Raven",     14,    "None", "None", "Active", null, null, null, false),
  row("db-27", "ArchiveWarehouse_C1",           "Titan-1",   "Aquila",    1250,  "None", "None", "Active", null, null, null, false),
  row("db-28", "StandardClinic_C2",             "Skylark-1", "Raven",     275,   "None", "None", "Active", null, null, null, false),
  row("db-29", "DevScratch_C3",                 "Sandbox-1", "Build VM",  2.5,   "None", "None", "Active", null, null, null, false),

  // ── Additional demo rows (Overview / filters) ──
  row("db-30", "PioneerDental_C6",              "Titan-1",   "Aquila",    45,    "None",            "None",      "Active",             null,   null,   null, false),
  row("db-31", "HorizonSmiles_C1",              "Skylark-1", "Raven",     112,   "None",            "None",      "Active",             d(-2),  null,   null, false),
  row("db-32", "ValleyViewDental_C4",           "Sandbox-1", "Build VM",  4.8,   "Delete",          "Trigger 1", "SB Completed",       d(-3),  d(2),   5,  true),
  row("db-33", "CoastalFamily_C2_LIVE",         "Phoenix-1", "Aquila",    890,   "Backup & Delete", "Trigger 2", "LIVE Completed",     d(-1),  d(29),  30, false, true),
  row("db-34", "NationalOrtho_C7",            "Lyra-1",    "Aquila",    180,   "Scheduled Delete","Trigger 2", "ITL Completed",      d(0),   d(7),   7,  false),
  row("db-35", "BrightPath_ACC1201",          "Aquila-1",  "Aquila",    2560,  "None",            "None",      "Active",             null,   null,   null, false),
  row("db-36", "SunriseDental_C5",            "Raven-2",   "Raven",     2.1,   "None",            "None",      "Active",             null,   null,   null, false),
  row("db-37", "GreenValley_C3_ITL",          "Atlas-1",   "ITL",       33,    "Scheduled Delete","Trigger 1", "ITL Completed",      d(-1),  d(6),   7,  false),
  row("db-38", "PeakPerformance_C1_LIVE",     "Nova-1",    "Aquila",    420,   "Backup",          "None",      "LIVE Completed",     d(0),   null,   null, false, true),
  row("db-39", "HarborPoint_C2_SB",           "Orion-1",   "SB",        36,    "Scheduled Delete","Trigger 1", "SB Completed",       d(0),   d(5),   5,  false),
  row("db-40", "RidgelineDental_C1",          "Aquila-2",  "Build VM",  9.6,   "Delete",          "Trigger 1", "ITL Completed",      d(-4),  d(1),   5,  true),

  // ── Deliverable status showcase (Conv. status column) ──
  row("db-41", "ActiveMonitoring_C1",         "Aquila-1",  "Aquila",    18,    "None",            "None",      "Active",             null,   null,   null, false),
  row("db-42", "ActiveMonitoring_C2",         "Titan-1",   "Raven",     94,    "None",            "None",      "Active",             d(-1),  null,   null, false),
  row("db-43", "SilverLake_C1_SB",            "Orion-1",   "SB",        52,    "Scheduled Delete","Trigger 1", "SB Completed",       d(0),   d(5),   5,  false),
  row("db-44", "SilverLake_C1_SB_2",          "Nova-1",    "SB",        31,    "None",            "None",      "SB Completed",       d(-3),  null,   null, false),
  row("db-45", "Clearwater_C2_ITL",           "Atlas-1",   "ITL",       47,    "Scheduled Delete","Trigger 1", "ITL Completed",      d(0),   d(7),   7,  false),
  row("db-46", "Clearwater_C2_ITL_2",         "Lyra-1",    "ITL",       62,    "Delete",          "Trigger 1", "ITL Completed",      d(-2),  d(5),   5,  false),
  row("db-47", "WestsideFamily_C3_LIVE",      "Aquila-2",  "Aquila",    128,   "Backup & Delete", "Trigger 2", "LIVE Completed",     d(0),   d(30),  30, false, true),
  row("db-48", "WestsideFamily_C3_LIVE_2",    "Raven-3",   "Aquila",    340,   "Backup & Delete", "Trigger 2", "LIVE Completed",     d(-5),  d(25),  30, false, true),
  row("db-49", "MapleGrove_C4_LIVE",          "Phoenix-1", "Aquila",    78,    "None",            "None",      "LIVE Completed",     d(-10), null,   null, false),
  row("db-50", "Oakwood_C5",                  "Skylark-1", "Build VM",  11,    "Scheduled Delete","Trigger 1", "SB Completed",       d(0),   d(5),   5,  true),
  row("db-51", "Riverbend_C6_ITL",            "Sandbox-1", "ITL",       15,    "None",            "None",      "ITL Completed",      null,   null,   null, false),
  row("db-52", "CedarPoint_C7_LIVE",          "Orion-1",   "Aquila",    520,   "Backup",          "None",      "LIVE Completed",     d(-2),  null,   null, false, true),
];
