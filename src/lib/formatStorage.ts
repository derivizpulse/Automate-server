/**
 * Format a size stored in GB for display.
 * - Above 1000 → TB
 * - 10–1000 → GB
 * - Below 10 → MB
 */
export function formatStorageGb(gb: number): string {
  if (!Number.isFinite(gb) || gb < 0) return "—";

  if (gb > 1000) {
    const tb = gb / 1000;
    const rounded = tb >= 10 ? Math.round(tb) : Math.round(tb * 10) / 10;
    return `${rounded} TB`;
  }

  if (gb >= 10) {
    const rounded = gb >= 100 ? Math.round(gb) : Math.round(gb * 10) / 10;
    return `${rounded} GB`;
  }

  const mb = gb * 1024;
  const rounded = mb >= 100 ? Math.round(mb) : Math.round(mb * 10) / 10;
  return `${rounded} MB`;
}
