// Deriviz — Operations: in-progress backup / delete jobs (present) + optional completed history

import { useMemo, useState } from "react";
import {
  DateRangePickers,
  boundsFromIsoRange,
  formatRangeLabel,
  shiftIsoDate,
  type DateRangeBounds,
} from "../components/DateRangeFilter";
import { MultiSelectFilter } from "../components/MultiSelectFilter";
import { isOperationalJob } from "../lib/operations";
import { matchesTeamFilter, type TeamFilter } from "../lib/teams";
import { useDerivizStore } from "../store/useDerivizStore";
import type { OperationJob, OperationKind, OperationStatus } from "../types";

const TODAY_ISO = "2026-05-17";

const KIND_LABEL: Record<OperationKind, string> = {
  backup: "Backup",
  delete: "Delete",
  backup_and_delete: "Backup & Delete",
  reschedule: "Reschedule",
  schedule_delete: "Schedule",
};

const KIND_FILTER_OPTIONS = ["Backup", "Delete", "Backup & Delete"];

const STATUS_FILTER_OPTIONS = ["Queued", "Running", "Succeeded", "Failed", "Cancelled"] as const;

const FILTER_TO_STATUS: Record<(typeof STATUS_FILTER_OPTIONS)[number], OperationStatus> = {
  Queued: "queued",
  Running: "running",
  Succeeded: "succeeded",
  Failed: "failed",
  Cancelled: "cancelled",
};

const STATUS_STYLE: Record<
  OperationStatus,
  { bg: string; color: string; border: string }
> = {
  queued:   { bg: "#F7F8FA", color: "#5D6F7E", border: "#D9E0E7" },
  running:  { bg: "#E8F8FA", color: "#007A8F", border: "#A8D8DF" },
  succeeded:{ bg: "#F0FDF4", color: "#1B8A4A", border: "#BBF7D0" },
  failed:   { bg: "#FEF2F2", color: "#B23838", border: "#FECACA" },
  cancelled:{ bg: "#F4F4F5", color: "#71717A", border: "#E4E4E7" },
};

type StatusView = "active" | "completed" | "all";

function isoDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

function jobInDateRange(job: OperationJob, bounds: DateRangeBounds | null): boolean {
  if (!bounds) return true;
  const d = isoDateOnly(job.updatedAt);
  return d >= bounds.from && d <= bounds.to;
}

function isActiveJob(job: OperationJob): boolean {
  return job.status === "queued" || job.status === "running";
}

function isCompletedJob(job: OperationJob): boolean {
  return job.status === "succeeded" || job.status === "failed" || job.status === "cancelled";
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function jobMatchesOpsFilters(
  job: OperationJob,
  statusView: StatusView,
  statusSet: Set<OperationStatus> | null,
  kindSet: Set<string> | null,
  dateRangeBounds: DateRangeBounds | null
): boolean {
  if (statusSet && !statusSet.has(job.status)) return false;
  if (kindSet && !kindSet.has(KIND_LABEL[job.kind])) return false;

  const active = isActiveJob(job);
  if (statusView === "active" && !active) return false;
  if (statusView === "completed" && !isCompletedJob(job)) return false;

  // Queued / running always show — live operations, not bounded by history dates.
  if (active) return true;

  return jobInDateRange(job, dateRangeBounds);
}

function sortOpsJobs(a: OperationJob, b: OperationJob): number {
  const aActive = isActiveJob(a);
  const bActive = isActiveJob(b);
  if (aActive !== bActive) return aActive ? -1 : 1;
  if (a.status === "running" && b.status === "queued") return -1;
  if (a.status === "queued" && b.status === "running") return 1;
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

export function Operations({ teamFilter }: { teamFilter: TeamFilter }) {
  const jobs = useDerivizStore((s) => s.operationJobs);
  const dismissOperation = useDerivizStore((s) => s.dismissOperation);
  const cancelOrStopOperation = useDerivizStore((s) => s.cancelOrStopOperation);

  const [historyFrom, setHistoryFrom] = useState(() => shiftIsoDate(TODAY_ISO, -30));
  const [historyTo, setHistoryTo] = useState(TODAY_ISO);
  const [statusView, setStatusView] = useState<StatusView>("active");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [kindFilters, setKindFilters] = useState<string[]>([]);

  const showHistoryDateRange = statusView !== "active";

  const dateRangeBounds = useMemo(
    () => boundsFromIsoRange(historyFrom, historyTo),
    [historyFrom, historyTo]
  );
  const dateRangeLabel = useMemo(() => formatRangeLabel(dateRangeBounds), [dateRangeBounds]);

  const teamJobs = useMemo(
    () =>
      jobs.filter(
        (job) => matchesTeamFilter(job.server, teamFilter) && isOperationalJob(job)
      ),
    [jobs, teamFilter]
  );

  const activeNow = useMemo(() => teamJobs.filter(isActiveJob), [teamJobs]);

  const filteredJobs = useMemo(() => {
    const statusSet =
      statusFilters.length > 0
        ? new Set(statusFilters.map((s) => FILTER_TO_STATUS[s as keyof typeof FILTER_TO_STATUS]))
        : null;
    const kindSet = kindFilters.length > 0 ? new Set(kindFilters) : null;

    return teamJobs
      .filter((job) =>
        jobMatchesOpsFilters(job, statusView, statusSet, kindSet, dateRangeBounds)
      )
      .sort(sortOpsJobs);
  }, [teamJobs, statusView, statusFilters, kindFilters, dateRangeBounds]);

  const activeInView = useMemo(
    () => filteredJobs.filter(isActiveJob),
    [filteredJobs]
  );
  const completedInView = useMemo(
    () => filteredJobs.filter(isCompletedJob),
    [filteredJobs]
  );

  const jobsSummary = useMemo(() => {
    if (statusView === "active") {
      return `${activeInView.length} in progress now`;
    }
    if (statusView === "completed") {
      return `${completedInView.length} completed in ${dateRangeLabel.toLowerCase()}`;
    }
    if (activeInView.length === 0) {
      return `${completedInView.length} completed in ${dateRangeLabel.toLowerCase()}`;
    }
    return `${activeInView.length} in progress · ${completedInView.length} completed in ${dateRangeLabel.toLowerCase()}`;
  }, [statusView, activeInView.length, completedInView.length, dateRangeLabel]);

  return (
    <div className="flex min-h-0 flex-col gap-4" style={{ height: "calc(100svh - 6.5rem)", minHeight: 360 }}>
      <div className="shrink-0">
        <h1 className="text-[15px] font-semibold" style={{ color: "#1E2228" }}>
          Operations
        </h1>
        {activeNow.length > 0 && statusView !== "active" && (
          <p className="mt-1 text-[11px] text-cf-muted">
            <strong className="text-cf-text">{activeNow.length}</strong> job
            {activeNow.length === 1 ? "" : "s"} in progress right now (always shown in{" "}
            <button
              type="button"
              className="font-medium text-cf-primary underline-offset-2 hover:underline"
              onClick={() => setStatusView("active")}
            >
              Active
            </button>
            )
          </p>
        )}
      </div>

      <div className="shrink-0 flex flex-wrap items-end gap-x-3 gap-y-2">
        <div className="flex min-w-[200px] flex-col gap-1">
          <span className="cf-field-label">Show</span>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Job status view">
            {(
              [
                { id: "active" as const, label: "Active" },
                { id: "completed" as const, label: "Completed" },
                { id: "all" as const, label: "All" },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className="rounded-[4px] px-2.5 py-1 text-[11px] font-medium transition-colors"
                style={{
                  background: statusView === id ? "#E8F8FA" : "#F7F8FA",
                  color: statusView === id ? "#007A8F" : "#5D6F7E",
                  border: `1px solid ${statusView === id ? "#A8D8DF" : "#ECEFF2"}`,
                }}
                onClick={() => setStatusView(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {showHistoryDateRange && (
          <DateRangePickers
            className="min-w-[min(100%,440px)] basis-full lg:basis-auto lg:flex-1"
            label="Completed between"
            dateFrom={historyFrom}
            dateTo={historyTo}
            onDateFromChange={setHistoryFrom}
            onDateToChange={setHistoryTo}
            rangeLabel={dateRangeLabel}
          />
        )}
        <MultiSelectFilter
          id="ops-status-filter"
          label="Status"
          className="min-w-[180px]"
          allLabel="All statuses"
          options={[...STATUS_FILTER_OPTIONS]}
          value={statusFilters}
          onChange={setStatusFilters}
        />
        <MultiSelectFilter
          id="ops-kind-filter"
          label="Kind"
          className="min-w-[180px]"
          allLabel="All kinds"
          options={KIND_FILTER_OPTIONS}
          value={kindFilters}
          onChange={setKindFilters}
        />
      </div>

      {statusView === "active" && (
        <p className="shrink-0 text-[11px] text-cf-muted">
          Live queue and running backup/delete work — not limited by dates. Switch to{" "}
          <strong className="font-medium text-cf-secondary">Completed</strong> or{" "}
          <strong className="font-medium text-cf-secondary">All</strong> and pick a from/to range
          for finished jobs.
        </p>
      )}

      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[6px] bg-white"
        style={{ border: "1px solid #ECEFF2" }}
      >
        <div className="c-card-header shrink-0 flex items-center justify-between gap-2">
          <span>{statusView === "active" ? "In progress" : "Jobs"}</span>
          <span className="text-[11px] font-normal normal-case tracking-normal text-cf-muted">
            {jobsSummary}
          </span>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <p className="text-[13px] font-medium" style={{ color: "#354756" }}>
              {statusView === "active"
                ? "Nothing running right now"
                : "No jobs match these filters"}
            </p>
            <p className="mt-2 max-w-md text-[12px]" style={{ color: "#96A3AF" }}>
              {statusView === "active"
                ? "When you start a backup or delete from Overview, it appears here immediately."
                : "Try a wider completed date range, or switch to Active to see in-progress work."}
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead className="sticky top-0 z-10" style={{ background: "#F7F8FA", borderBottom: "1px solid #ECEFF2" }}>
                <tr>
                  {["Database", "Kind", "Status", "Progress", "Updated", ""].map((h) => (
                    <th key={h} className="cf-th whitespace-nowrap px-3 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job, i) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    stripe={i % 2 === 1}
                    onDismiss={() => dismissOperation(job.id)}
                    onCancelOrStop={() => cancelOrStopOperation(job.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function JobRow({
  job,
  stripe,
  onDismiss,
  onCancelOrStop,
}: {
  job: OperationJob;
  stripe: boolean;
  onDismiss: () => void;
  onCancelOrStop: () => void;
}) {
  const st = STATUS_STYLE[job.status];
  const showProgress = job.status === "queued" || job.status === "running";
  const canInterrupt = job.status === "queued" || job.status === "running";
  return (
    <tr style={{ background: stripe ? "#F7F8FA" : "#FFFFFF" }}>
      <td className="cf-td px-3 py-2 align-middle">
        <span className="font-medium" style={{ color: "#007A8F" }}>
          {job.dbName}
        </span>
        <span className="mt-0.5 block text-[10px]" style={{ color: "#96A3AF" }}>
          {job.server}
        </span>
      </td>
      <td className="cf-td align-middle text-[12px]" style={{ color: "#354756" }}>
        {KIND_LABEL[job.kind]}
      </td>
      <td className="cf-td align-middle">
        <span
          className="inline-flex rounded-[3px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
        >
          {job.status}
        </span>
      </td>
      <td className="cf-td align-middle min-w-[140px]">
        <div className="flex flex-col gap-1">
          <div
            className="h-2 w-full overflow-hidden rounded-full"
            style={{ background: "#EDF0F3" }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-300 ease-out"
              style={{
                width: `${job.progress}%`,
                background: job.status === "failed" ? "#DC2626" : "#007A8F",
              }}
            />
          </div>
          <span className="text-[10px]" style={{ color: "#5D6F7E" }}>
            {showProgress ? job.message : `${job.progress}% · ${job.message}`}
          </span>
        </div>
      </td>
      <td className="cf-td align-middle whitespace-nowrap text-[11px] tabular-nums" style={{ color: "#96A3AF" }}>
        {formatTime(job.updatedAt)}
      </td>
      <td className="cf-td align-middle">
        {canInterrupt ? (
          <button
            type="button"
            className="text-[11px] font-medium"
            style={{ color: "#007A8F" }}
            onClick={onCancelOrStop}
          >
            {job.status === "queued" ? "Cancel" : "Stop"}
          </button>
        ) : job.status === "succeeded" || job.status === "failed" || job.status === "cancelled" ? (
          <button
            type="button"
            className="text-[11px] font-medium"
            style={{ color: "#96A3AF" }}
            onClick={onDismiss}
          >
            Dismiss
          </button>
        ) : (
          <span className="text-[11px]" style={{ color: "#C9D1DA" }}>
            —
          </span>
        )}
      </td>
    </tr>
  );
}
