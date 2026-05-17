import { cn } from "../lib/cn";

export type DateRangePreset = "7d" | "30d" | "90d" | "all" | "custom";

export type DateRangeBounds = { from: string; to: string };

export function computeDateRangeBounds(
  preset: DateRangePreset,
  todayIso: string,
  customFrom: string,
  customTo: string
): DateRangeBounds | null {
  if (preset === "all") return null;
  if (preset === "custom") {
    const from = customFrom || addDaysIso(todayIso, -30);
    const to = customTo || todayIso;
    return from <= to ? { from, to } : { from: to, to: from };
  }
  const days = preset === "7d" ? 7 : preset === "90d" ? 90 : 30;
  return { from: addDaysIso(todayIso, -days), to: todayIso };
}

function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatRangeLabel(bounds: DateRangeBounds | null): string {
  if (!bounds) return "All time";
  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00.000Z`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  return `${fmt(bounds.from)} – ${fmt(bounds.to)}`;
}

export function DateRangeFilter({
  preset,
  onPresetChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  rangeLabel,
  className,
}: {
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  rangeLabel: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="cf-field-label">Date range</span>
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="c-select min-w-[132px]"
          value={preset}
          onChange={(e) => onPresetChange(e.target.value as DateRangePreset)}
          aria-label="Date range preset"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
          <option value="custom">Custom range</option>
        </select>
        <input
          type="date"
          className="c-input w-[132px]"
          value={dateFrom}
          max={dateTo || undefined}
          disabled={preset !== "custom"}
          onChange={(e) => onDateFromChange(e.target.value)}
          aria-label="Date range from"
        />
        <span className="text-[11px] text-cf-muted">to</span>
        <input
          type="date"
          className="c-input w-[132px]"
          value={dateTo}
          min={dateFrom || undefined}
          disabled={preset !== "custom"}
          onChange={(e) => onDateToChange(e.target.value)}
          aria-label="Date range to"
        />
        <span className="text-[11px] tabular-nums text-cf-secondary">{rangeLabel}</span>
      </div>
    </div>
  );
}
