import type { ActivityEntry } from "../types";

/** Demo signed-in user for manual audit entries when no actor is passed. */
export const CURRENT_AUDIT_ACTOR = "Jordan Lee";

/** Trigger batch summaries are hidden from the Audit Log table. */
export function isAuditLogVisible(entry: ActivityEntry): boolean {
  return entry.category !== "trigger";
}

export function auditTypeLabel(entry: ActivityEntry): string {
  if (entry.category === "trigger") return "Trigger";
  if (entry.category === "system" || entry.category === "automation") return "System";
  return entry.actorName?.trim() || "User";
}

export function auditEntryMatchesSearch(entry: ActivityEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    entry.dbName,
    entry.server,
    entry.message,
    entry.actorName,
    auditTypeLabel(entry),
    entry.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}
