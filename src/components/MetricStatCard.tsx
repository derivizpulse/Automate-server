// CareFlow — compact clickable metric tile

import { cn } from "../lib/cn";
import { formatStorageGb } from "../lib/formatStorage";

export { formatStorageGb } from "../lib/formatStorage";

export type MetricFocus = "synced" | "pending" | "backup" | "excluded" | "recovered";

export const METRIC_ACCENT: Record<MetricFocus, string> = {
  synced: "#007A8F",
  pending: "#B23838",
  backup: "#C27803",
  excluded: "#5D6F7E",
  recovered: "#1B8A4A",
};

export function MetricStatCard({
  focus,
  label,
  count,
  storageGb,
  footnote,
  selected,
  urgent,
  onSelect,
}: {
  focus: MetricFocus;
  label: string;
  count: number;
  storageGb: number;
  /** One optional detail line (e.g. expires today) */
  footnote?: string;
  selected: boolean;
  urgent?: boolean;
  onSelect: () => void;
}) {
  const accent = METRIC_ACCENT[focus];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full flex-col gap-1 overflow-hidden rounded-md border py-2 pl-3 pr-2.5 text-left transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-cf-primary focus-visible:ring-offset-1",
        selected
          ? "border-cf-primary/45 bg-cf-primary-light/35 shadow-sm"
          : "border-cf-border-soft bg-white hover:border-cf-primary/25 hover:bg-cf-surface/40"
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: accent }}
        aria-hidden
      />

      <span
        className="truncate text-[9px] font-semibold uppercase tracking-[0.06em] text-cf-secondary"
        style={selected ? { color: accent } : undefined}
        title={label}
      >
        {label}
      </span>

      <div className="flex items-baseline gap-1.5 tabular-nums">
        <span
          className={cn(
            "text-[20px] font-semibold leading-none",
            urgent ? "text-cf-danger" : "text-cf-gs-100"
          )}
        >
          {count}
        </span>
        <span className="text-[10px] text-cf-muted">db</span>
        <span className="text-[10px] text-cf-gs-20" aria-hidden>
          ·
        </span>
        <span className="text-[16px] font-semibold leading-none" style={{ color: accent }}>
          {formatStorageGb(storageGb)}
        </span>
      </div>

      {footnote ? (
        <p
          className={cn(
            "truncate text-[9px] leading-tight",
            urgent ? "font-medium text-cf-danger" : "text-cf-muted"
          )}
          title={footnote}
        >
          {footnote}
        </p>
      ) : null}
    </button>
  );
}
