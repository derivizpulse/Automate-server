import type { OperationJob } from "../types";

function minutesAgo(m: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - m);
  return d.toISOString();
}

/** Sample jobs for the Operations tab (running, queued, and recent outcomes). */
export const initialOperationJobs: OperationJob[] = [
  {
    id: "op-1",
    dbId: "db-3",
    dbName: "WholeDentalWellness_C1_LIVE",
    server: "Aquila-1",
    kind: "backup",
    status: "running",
    progress: 72,
    message: "Backing up… 72%",
    startedAt: minutesAgo(4),
    updatedAt: minutesAgo(0),
  },
  {
    id: "op-2",
    dbId: "db-25",
    dbName: "EastsideSmiles_C2_LIVE",
    server: "Raven-2",
    kind: "backup_and_delete",
    status: "queued",
    progress: 0,
    message: "Queued…",
    startedAt: minutesAgo(1),
    updatedAt: minutesAgo(1),
    batchId: "batch-live-0422",
  },
  {
    id: "op-3",
    dbId: "db-12",
    dbName: "EastsideSmiles_C2",
    server: "Aquila-2",
    kind: "delete",
    status: "running",
    progress: 41,
    message: "Deleting database… 41%",
    startedAt: minutesAgo(6),
    updatedAt: minutesAgo(0),
  },
  {
    id: "op-4",
    dbId: "db-13",
    dbName: "EastsideSmiles_C2_ITL",
    server: "Aquila-3",
    kind: "backup",
    status: "succeeded",
    progress: 100,
    message: "Completed",
    startedAt: minutesAgo(28),
    updatedAt: minutesAgo(22),
  },
  {
    id: "op-6",
    dbId: "db-22",
    dbName: "LakesideDental_C4_ITL",
    server: "Nova-1",
    kind: "backup",
    status: "failed",
    progress: 58,
    message: "Backup failed — blob write timeout",
    startedAt: minutesAgo(18),
    updatedAt: minutesAgo(17),
    error: "Azure blob upload timed out after 120s",
  },
  {
    id: "op-8",
    dbId: "db-6",
    dbName: "SmileBright_C2_LIVE",
    server: "Orion-2",
    kind: "backup_and_delete",
    status: "succeeded",
    progress: 100,
    message: "Completed",
    startedAt: minutesAgo(90),
    updatedAt: minutesAgo(85),
  },
];
