import type { OperationJob, OperationKind } from "../types";

/** Long-running work shown on Operations — not schedule/date-only updates. */
export const OPERATIONAL_KINDS = [
  "backup",
  "delete",
  "backup_and_delete",
] as const satisfies readonly OperationKind[];

export type OperationalKind = (typeof OPERATIONAL_KINDS)[number];

export function isOperationalJob(job: Pick<OperationJob, "kind">): boolean {
  return (OPERATIONAL_KINDS as readonly OperationKind[]).includes(job.kind);
}
