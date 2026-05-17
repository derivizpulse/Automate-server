import type { Classification } from "../types";

export function parseDatabaseContext(name: string): {
  accountName: string | null;
  conversionName: string | null;
  liveCopyNumber: number | null;
  isLive: boolean;
} {
  const parts = name.split("_").filter(Boolean);
  if (parts.length < 2) {
    return { accountName: null, conversionName: null, liveCopyNumber: null, isLive: false };
  }

  const liveIndex = parts.findIndex((p) => p.toUpperCase() === "LIVE");
  const liveCopyPart = liveIndex >= 0 ? parts[liveIndex + 1] : null;
  const liveCopyNumber = liveCopyPart && /^\d+$/.test(liveCopyPart) ? Number(liveCopyPart) : null;

  return {
    accountName: parts[0] ?? null,
    conversionName: parts[1] ?? null,
    liveCopyNumber,
    isLive: liveIndex >= 0,
  };
}

/** LIVE, SB, and ITL databases may use the Backup & Delete lifecycle path. */
export function supportsBackupAndDelete(db: {
  name: string;
  environment?: string | null;
  classification?: string | null;
  deliverableStatus?: string | null;
}): boolean {
  const nameU = db.name.toUpperCase();
  return (
    parseDatabaseContext(db.name).isLive ||
    db.classification === "Live" ||
    db.deliverableStatus === "LIVE Completed" ||
    nameU.includes("_SB") ||
    nameU.includes("_ITL") ||
    db.environment === "SB" ||
    db.environment === "ITL"
  );
}

export function backupDeleteWindowDays(name: string): number {
  return parseDatabaseContext(name).isLive ? 30 : 7;
}

export function classifyDatabaseName(name: string): Classification {
  const parsed = parseDatabaseContext(name);
  if (parsed.isLive) return "Live";
  if (parsed.accountName && parsed.conversionName) return "Conversion";
  const u = name.toUpperCase();
  if (u.includes("_LIVE")) return "Live";
  if (u.includes("ACC") || u.includes("ACCOUNT")) return "Account";
  if (u.includes("CONV") || u.includes("CONVERSION")) return "Conversion";
  return "Ungrouped";
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function addDaysIso(base: Date, days: number): string {
  const x = new Date(base);
  x.setDate(x.getDate() + days);
  return x.toISOString();
}
