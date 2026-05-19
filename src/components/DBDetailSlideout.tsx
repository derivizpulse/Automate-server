// CareFlow Design System — DB Detail Slideout panel
// Uses CareFlow modal shadow, header bg (#F7F8FA), border (#ECEFF2),
// body white, form label pattern, primary button token

import { useEffect, useMemo, useRef, useState } from "react";
import { useActivityForDb, useDerivizStore } from "../store/useDerivizStore";
import { ClassificationBadge, AutoBackedUpBadge } from "./Badge";
import { Toggle } from "./Toggle";
import {
  backupDeleteWindowDays,
  isLiveDatabase,
  supportsBackupAndDelete,
} from "../lib/classify";
import { formatStorageGb } from "../lib/formatStorage";
import type { ActivityEntry } from "../types";

type SlideoutAction =
  | "lift_exclusion"
  | "reschedule"
  | "delete"
  | "backup_delete";

/** Selected action while drafting “exclude” — empty until user picks (required). */
type ActionChoice = SlideoutAction | "";

type TriggerMode = "schedule_now" | "trigger_at";

const SCHEDULE_NOW_DELAY_MS = 5 * 60 * 1000;

function isoToUsMMDDYYYY(ymd: string): string {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return "";
  const [y, mo, d] = ymd.split("-");
  return `${mo}/${d}/${y}`;
}

function formatDbDayUs(iso: string | null): string {
  if (!iso) return "—";
  const ymd = new Date(iso).toISOString().slice(0, 10);
  return isoToUsMMDDYYYY(ymd);
}

function formatDbDateTimeUs(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function defaultTimeLocal(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function combineLocalDateTimeToIso(dateYmd: string, timeHm: string): string | null {
  const [y, mo, d] = dateYmd.split("-").map(Number);
  const [h, mi] = timeHm.split(":").map(Number);
  if (!y || !mo || !d || Number.isNaN(h) || Number.isNaN(mi)) return null;
  const local = new Date(y, mo - 1, d, h, mi, 0, 0);
  if (Number.isNaN(local.getTime())) return null;
  return local.toISOString();
}

function windowDaysForAction(
  action: SlideoutAction,
  db: { name: string } | null
): number {
  if (action === "backup_delete") {
    return db ? backupDeleteWindowDays(db.name) : 7;
  }
  return 5;
}

function deletionIsoFromActionDate(
  actionDateIso: string,
  action: SlideoutAction,
  db: { name: string } | null
): string {
  const d = new Date(actionDateIso);
  d.setUTCDate(d.getUTCDate() + windowDaysForAction(action, db));
  return d.toISOString();
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[2px]">
      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#96A3AF" }}>
        {label}
      </span>
      <span className="text-[12px]" style={{ color: "#354756" }}>{value}</span>
    </div>
  );
}

function formatActivityTimestamp(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

const ACTIVITY_CATEGORY_LABEL: Record<NonNullable<ActivityEntry["category"]>, string> = {
  system: "System",
  trigger: "Trigger",
  manual: "Manual",
  automation: "Automation",
};

function parseActivityMessage(message: string): { title: string; detail?: string } {
  const trimmed = message.trim();
  if (/^\\.+\\.zip$/i.test(trimmed) || (trimmed.includes("\\") && trimmed.endsWith(".zip"))) {
    return { title: "Backup artifact saved", detail: trimmed };
  }
  if (/backup/i.test(trimmed)) {
    return { title: trimmed, detail: undefined };
  }
  return { title: trimmed, detail: undefined };
}

function ActivityLogItem({ entry }: { entry: ActivityEntry }) {
  const { date, time } = formatActivityTimestamp(entry.at);
  const { title, detail } = parseActivityMessage(entry.message);
  const category = entry.category ? ACTIVITY_CATEGORY_LABEL[entry.category] : null;

  return (
    <li className="min-w-0 rounded-cf border border-cf-border-soft bg-cf-surface px-3 py-2.5">
      <div className="flex gap-3">
        <div className="w-[76px] shrink-0">
          <p className="text-[11px] font-semibold leading-snug text-cf-text">{date}</p>
          <p className="text-[10px] leading-snug text-cf-muted">{time}</p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-[12px] font-medium leading-snug text-cf-text">{title}</p>
            {category && (
              <span className="c-tag border-cf-border-soft bg-white text-[10px] text-cf-secondary">
                {category}
              </span>
            )}
          </div>
          {detail && (
            <p
              className="mt-1.5 break-all font-mono text-[11px] leading-relaxed text-cf-secondary"
              title={detail}
            >
              {detail}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

export function DBDetailSlideout({
  dbId,
  onClose,
  readOnly = false,
}: {
  dbId: string | null;
  onClose: () => void;
  readOnly?: boolean;
}) {
  const db        = useDerivizStore((s) => s.databases.find((d) => d.id === dbId) ?? null);
  const setExcluded = useDerivizStore((s) => s.setExcluded);
  const logActivity = useDerivizStore((s) => s.logActivity);
  const excluded  = useDerivizStore((s) => (dbId ? s.excludedIds.includes(dbId) : false));
  const scheduleDeletionByDate = useDerivizStore((s) => s.scheduleDeletionByDate);
  const liftExclusion = useDerivizStore((s) => s.liftExclusion);
  const setManual = useDerivizStore((s) => s.setManualOverride);
  const backupInProgress = useDerivizStore((s) =>
    Boolean(
      dbId &&
        s.operationJobs.some(
          (j) =>
            j.dbId === dbId &&
            j.kind === "backup" &&
            (j.status === "queued" || j.status === "running")
        )
    )
  );
  const activityLog = useActivityForDb(dbId ?? "");
  const { minScheduleIso, maxScheduleIso } = useMemo(() => {
    const now = new Date();
    const min = new Date(now);
    const max = new Date(now);
    max.setMonth(max.getMonth() + 2);
    return {
      minScheduleIso: min.toISOString().slice(0, 10),
      maxScheduleIso: max.toISOString().slice(0, 10),
    };
  }, []);
  const [draftExcluded, setDraftExcluded] = useState(excluded);
  const applyingNewExclusion = draftExcluded && !excluded;
  /** Store still excluded, user turned draft toggle off — must pick a fresh date before save. */
  const liftingExclusionDraft = excluded && !draftExcluded;
  const [scheduleDateInput, setScheduleDateInput] = useState("");
  const [triggerMode, setTriggerMode] = useState<TriggerMode>("trigger_at");
  const [triggerTimeInput, setTriggerTimeInput] = useState(defaultTimeLocal);
  const scheduleIso = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduleDateInput)) return null;
    return scheduleDateInput;
  }, [scheduleDateInput]);

  useEffect(() => {
    if (!db) return;
    // Already excluded: don’t auto-fill the context field (cleared when user turns Exclude on).
    if (draftExcluded && excluded) return;
    // Turning exclusion on: keep field empty (toggle also clears).
    if (draftExcluded && !excluded) return;
    if (liftingExclusionDraft) return;
    if (db.deletionDate) {
      const iso = new Date(db.deletionDate).toISOString().slice(0, 10);
      if (iso >= minScheduleIso && iso <= maxScheduleIso) {
        setScheduleDateInput(iso);
        return;
      }
    }
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const fallback = d.toISOString().slice(0, 10);
    const pick =
      fallback < minScheduleIso ? minScheduleIso : fallback > maxScheduleIso ? maxScheduleIso : fallback;
    setScheduleDateInput(pick);
  }, [db, minScheduleIso, maxScheduleIso, draftExcluded, excluded, liftingExclusionDraft]);

  const [selectedAction, setSelectedAction] = useState<ActionChoice>("delete");
  const [showBackupConfirm, setShowBackupConfirm] = useState(false);
  const [actionTouched, setActionTouched] = useState(false);
  const [dateTouched, setDateTouched] = useState(false);
  const [liftSaveWarning, setLiftSaveWarning] = useState(false);
  const prevDraftExcludedRef = useRef(draftExcluded);
  const excludeDraftPairRef = useRef<string | null>(null);

  useEffect(() => {
    excludeDraftPairRef.current = null;
    setTriggerMode("trigger_at");
    setTriggerTimeInput(defaultTimeLocal());
  }, [dbId]);

  useEffect(() => {
    const pair = `${draftExcluded}|${excluded}`;
    const prev = excludeDraftPairRef.current;
    if (prev !== null && applyingNewExclusion && prev === "false|false") {
      setScheduleDateInput("");
      setDateTouched(false);
      setSelectedAction("");
      setActionTouched(false);
    }
    excludeDraftPairRef.current = pair;
  }, [draftExcluded, excluded, applyingNewExclusion]);

  const actionOptions: { value: SlideoutAction; label: string }[] = useMemo(() => {
    if (draftExcluded && excluded) {
      return [{ value: "lift_exclusion", label: "Lift Exclusion" }];
    }
    const st =
      db?.action === "Delete" || db?.action === "Scheduled Delete"
        ? "Pending Deletion"
        : db?.action === "Backup & Delete"
          ? "Backup & Delete"
          : db?.action === "Backup"
            ? "Backup"
            : "Active";
    const canBackupDelete = Boolean(db && supportsBackupAndDelete(db));
    if (st === "Pending Deletion") {
      const opts: { value: SlideoutAction; label: string }[] = [
        { value: "delete", label: "Delete" },
      ];
      if (canBackupDelete) {
        opts.push({ value: "backup_delete", label: "Backup & Delete" });
      }
      return opts;
    }
    if (st === "Backup & Delete") {
      const opts: { value: SlideoutAction; label: string }[] = [
        { value: "delete", label: "Delete" },
      ];
      if (canBackupDelete) {
        opts.push({ value: "backup_delete", label: "Backup & Delete" });
      }
      return opts;
    }
    const opts: { value: SlideoutAction; label: string }[] = [{ value: "delete", label: "Delete" }];
    if (canBackupDelete) {
      opts.push({ value: "backup_delete", label: "Backup & Delete" });
    }
    return opts;
  }, [draftExcluded, excluded, db]);

  useEffect(() => {
    if (actionTouched) return;
    if (applyingNewExclusion) {
      setSelectedAction("");
      return;
    }
    const defaultQuickAction = (): SlideoutAction => {
      if (db && isLiveDatabase(db) && supportsBackupAndDelete(db)) return "backup_delete";
      return "delete";
    };
    if (liftingExclusionDraft) {
      const preferredAction = defaultQuickAction();
      const hasPreferred = actionOptions.some((opt) => opt.value === preferredAction);
      setSelectedAction(hasPreferred ? preferredAction : (actionOptions[0]?.value ?? "delete"));
      return;
    }
    const preferredAction: SlideoutAction =
      draftExcluded && excluded ? "lift_exclusion" : defaultQuickAction();
    const hasPreferred = actionOptions.some((opt) => opt.value === preferredAction);
    setSelectedAction(hasPreferred ? preferredAction : (actionOptions[0]?.value ?? "delete"));
  }, [
    applyingNewExclusion,
    liftingExclusionDraft,
    draftExcluded,
    excluded,
    db?.action,
    actionOptions,
    actionTouched,
  ]);

  useEffect(() => {
    setDraftExcluded(excluded);
    setActionTouched(false);
    setDateTouched(false);
    setTriggerMode("trigger_at");
    setTriggerTimeInput(defaultTimeLocal());
  }, [excluded, dbId]);

  const usesScheduleNow =
    selectedAction === "delete" || selectedAction === "backup_delete";
  const usesDateOnly =
    selectedAction === "reschedule" || selectedAction === "lift_exclusion";

  useEffect(() => {
    const wasDraftExcluded = prevDraftExcludedRef.current;
    // Reverting exclusion (draft toggle off while still excluded): clear date — user must enter one to save.
    if (wasDraftExcluded && !draftExcluded && excluded && db) {
      setScheduleDateInput("");
      setDateTouched(false);
    }
    prevDraftExcludedRef.current = draftExcluded;
  }, [draftExcluded, excluded, db]);

  const scheduleDateOk =
    !!scheduleIso &&
    scheduleIso >= minScheduleIso &&
    scheduleIso <= maxScheduleIso;

  const scheduleTriggerOk = useMemo(() => {
    if (usesScheduleNow && triggerMode === "schedule_now") return true;
    if (!scheduleDateOk) return false;
    if (usesDateOnly) return true;
    if (triggerMode !== "trigger_at") return false;
    const iso = combineLocalDateTimeToIso(scheduleIso!, triggerTimeInput);
    if (!iso) return false;
    return new Date(iso).getTime() > Date.now();
  }, [
    usesScheduleNow,
    usesDateOnly,
    triggerMode,
    scheduleDateOk,
    scheduleIso,
    triggerTimeInput,
  ]);
  const exclusionChanged = draftExcluded !== excluded;
  const backupFlowLocked = backupInProgress || showBackupConfirm;
  const quickActionsDisabled =
    readOnly || draftExcluded || backupFlowLocked;
  const exclusionToggleDisabled = readOnly || backupFlowLocked;
  const exclusionTurnOn = exclusionChanged && applyingNewExclusion;
  const exclusionLiftOff = exclusionChanged && !draftExcluded && excluded;
  const actionChanged = !draftExcluded && (actionTouched || dateTouched);
  const canSave =
    !readOnly &&
    !backupFlowLocked &&
    (exclusionTurnOn ||
      exclusionLiftOff ||
      (actionChanged && scheduleTriggerOk && !liftingExclusionDraft));
  const backupButtonDisabled = readOnly || backupInProgress;

  useEffect(() => {
    if (!liftingExclusionDraft || scheduleTriggerOk) setLiftSaveWarning(false);
  }, [liftingExclusionDraft, scheduleTriggerOk]);

  function resolveScheduleTimes(action: SlideoutAction): {
    actionDateIso: string;
    deletionDateIso: string;
  } | null {
    if (usesScheduleNow && triggerMode === "schedule_now") {
      const actionDateIso = new Date(Date.now() + SCHEDULE_NOW_DELAY_MS).toISOString();
      const deletionDateIso = deletionIsoFromActionDate(actionDateIso, action, db ?? null);
      return { actionDateIso, deletionDateIso };
    }
    if (!scheduleIso || !scheduleDateOk) return null;
    if (usesDateOnly) {
      const deletionDateIso = new Date(`${scheduleIso}T12:00:00.000Z`).toISOString();
      const actionDateIso =
        action === "lift_exclusion"
          ? new Date(Date.now() + SCHEDULE_NOW_DELAY_MS).toISOString()
          : db?.actionDate ?? new Date().toISOString();
      return { actionDateIso, deletionDateIso };
    }
    const actionDateIso = combineLocalDateTimeToIso(scheduleIso, triggerTimeInput);
    if (!actionDateIso) return null;
    const deletionDateIso = deletionIsoFromActionDate(actionDateIso, action, db ?? null);
    return { actionDateIso, deletionDateIso };
  }

  function applyActionWithDate(action: SlideoutAction) {
    if (!db) return;
    const times = resolveScheduleTimes(action);
    if (!times) return;
    const { actionDateIso, deletionDateIso } = times;
    if (action === "lift_exclusion") {
      liftExclusion(db.id);
      scheduleDeletionByDate(db.id, deletionDateIso, undefined, actionDateIso);
      return;
    }
    if (action === "delete") {
      const alreadyOnDeleteSchedule =
        db.action === "Delete" || db.action === "Scheduled Delete";
      if (!alreadyOnDeleteSchedule) {
        setManual(db.id, "Delete");
      }
      scheduleDeletionByDate(db.id, deletionDateIso, "Delete", actionDateIso);
      return;
    }
    if (action === "backup_delete") {
      setManual(db.id, "Backup & Delete");
      scheduleDeletionByDate(db.id, deletionDateIso, "Backup & Delete", actionDateIso);
      return;
    }
    scheduleDeletionByDate(db.id, deletionDateIso, undefined, actionDateIso);
  }

  function handleSave() {
    if (!db) return;
    if (backupInProgress || showBackupConfirm) return;
    if (exclusionLiftOff && !scheduleTriggerOk) {
      setLiftSaveWarning(true);
      return;
    }
    if (!canSave) return;
    setLiftSaveWarning(false);

    if (exclusionChanged) {
      if (draftExcluded) {
        if (!excluded) {
          logActivity("Excluded from automated actions", db.id);
        }
        setExcluded(db.id, true);
      } else {
        liftExclusion(db.id);
        const act = selectedAction as SlideoutAction;
        const times = resolveScheduleTimes(act);
        if (!times) return;
        if (act === "delete") {
          scheduleDeletionByDate(db.id, times.deletionDateIso, "Delete", times.actionDateIso);
        } else if (act === "backup_delete") {
          scheduleDeletionByDate(db.id, times.deletionDateIso, "Backup & Delete", times.actionDateIso);
        } else {
          scheduleDeletionByDate(db.id, times.deletionDateIso, undefined, times.actionDateIso);
        }
      }
    }

    if (
      actionChanged &&
      scheduleTriggerOk &&
      !draftExcluded &&
      selectedAction !== "" &&
      !exclusionLiftOff
    ) {
      applyActionWithDate(selectedAction as SlideoutAction);
    }
    onClose();
  }

  function confirmBackupNow() {
    if (!db) return;
    setManual(db.id, "Backup");
    setShowBackupConfirm(false);
  }

  if (!db) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[140]"
        style={{ background: "rgba(13,22,29,0.24)" }}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 z-[150] flex h-full w-[480px] flex-col"
        style={{
          background: "#FFFFFF",
          borderLeft: "1px solid #ECEFF2",
          boxShadow: "0 4px 24px rgba(13,22,29,0.24)",
        }}
      >
        {/* Header — CareFlow modal header pattern */}
        <header
          className="flex h-[44px] shrink-0 items-center justify-between px-4"
          style={{ background: "#F7F8FA", borderBottom: "1px solid #ECEFF2" }}
        >
          <h2 className="text-[14px] font-semibold" style={{ color: "#5D6F7E" }}>
            Database details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-[24px] w-[24px] items-center justify-center rounded-[4px] text-[16px] transition-colors hover:bg-[#ECEFF2] focus:outline-none"
            style={{ color: "#96A3AF" }}
            aria-label="Close panel"
          >
            ✕
          </button>
        </header>

        {/* Body */}
        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          {/* DB identity */}
          <div className="border-b px-4 py-4" style={{ borderColor: "#ECEFF2" }}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[16px] font-semibold" style={{ color: "#1E2228" }}>{db.name}</p>
              <button
                type="button"
                onClick={onClose}
                className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[4px] text-[16px] transition-colors hover:bg-[#ECEFF2] focus:outline-none"
                style={{ color: "#96A3AF" }}
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>
            <p className="text-[12px] mt-0.5" style={{ color: "#5D6F7E" }}>
              {db.environment} · {formatStorageGb(db.sizeGb)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              <ClassificationBadge classification={db.classification} />
              {db.autoBackedUp && <AutoBackedUpBadge />}
            </div>
          </div>

          {/* Action & Schedule */}
          <div className="border-b px-4 py-4 space-y-3" style={{ borderColor: "#ECEFF2" }}>
            <p className="section-hdr">Action &amp; Schedule</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Account"       value={db.accountName ?? "—"} />
              <Field label="Conversion"    value={db.conversionName ?? "—"} />
              <Field label="Action"        value={db.action} />
              <Field label="Action date"   value={formatDbDateTimeUs(db.actionDate)} />
              <Field label="Deletion date" value={formatDbDayUs(db.deletionDate)} />
              <Field label="Size"          value={formatStorageGb(db.sizeGb)} />
            </div>
          </div>

          {/* Manual backup — always available (excluded or not) */}
          <div className="border-b px-4 py-4" style={{ borderColor: "#ECEFF2" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-hdr">Backup</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#96A3AF" }}>
                  Run a manual backup anytime — works whether this database is excluded or not.
                </p>
              </div>
              <button
                type="button"
                className={`h-[28px] shrink-0 px-2.5 text-[11px] ${
                  backupInProgress ? "c-btn-primary" : "c-btn-outline"
                } ${backupButtonDisabled ? "opacity-45 cursor-not-allowed" : ""}`}
                disabled={backupButtonDisabled}
                onClick={() => setShowBackupConfirm(true)}
              >
                {backupInProgress ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block h-3 w-3 animate-spin rounded-full border border-white/70 border-t-transparent"
                      aria-hidden
                    />
                    Backup in progress
                  </span>
                ) : (
                  "Backup now"
                )}
              </button>
            </div>
            {backupInProgress || showBackupConfirm ? (
              <p className="mt-2 text-[11px]" style={{ color: "#96A3AF" }}>
                {showBackupConfirm && !backupInProgress
                  ? "Confirm backup to continue — schedule actions are locked meanwhile."
                  : "Backup in progress — schedule actions are locked until complete."}
              </p>
            ) : null}
          </div>

          {/* Exclude toggle */}
          <div className="border-b px-4 py-4" style={{ borderColor: "#ECEFF2" }}>
            <p className="section-hdr">Exclusion</p>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12px] font-medium" style={{ color: "#354756" }}>
                  Exclude from automated actions
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "#96A3AF" }}>
                  This database will be skipped in trigger runs.
                </p>
              </div>
              <div
                className={exclusionToggleDisabled ? "pointer-events-none opacity-60" : ""}
                aria-disabled={exclusionToggleDisabled}
              >
                <Toggle
                  on={draftExcluded}
                  onChange={(v) => {
                    if (exclusionToggleDisabled) return;
                    setDraftExcluded(v);
                    if (v && !excluded) {
                      setScheduleDateInput("");
                      setDateTouched(false);
                    }
                  }}
                  ariaLabel="Exclude"
                />
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="border-b px-4 py-4 space-y-3" style={{ borderColor: "#ECEFF2" }}>
            <p className="section-hdr">Quick actions</p>
            <div
              className={quickActionsDisabled ? "pointer-events-none opacity-60" : ""}
              aria-disabled={quickActionsDisabled}
            >
              <label className="flex flex-col gap-1">
                <span className="text-[11px]" style={{ color: "#5D6F7E" }}>
                  Action
                </span>
                <select
                  className="c-select w-full"
                  disabled={quickActionsDisabled}
                  value={selectedAction}
                  onChange={(e) => {
                    setSelectedAction(e.target.value as ActionChoice);
                    setActionTouched(true);
                  }}
                >
                  {actionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="mt-3 flex flex-col gap-2 border-0 p-0">
                <legend className="text-[11px] font-medium" style={{ color: "#5D6F7E" }}>
                  {usesDateOnly
                    ? selectedAction === "reschedule"
                      ? "New deletion date"
                      : "Action date"
                    : "When to run"}
                </legend>
                {usesScheduleNow && (
                  <div className="flex flex-col gap-2">
                    <label className="flex cursor-pointer items-start gap-2">
                      <input
                        type="radio"
                        name="trigger-mode"
                        className="mt-0.5"
                        checked={triggerMode === "schedule_now"}
                        disabled={quickActionsDisabled}
                        onChange={() => {
                          setTriggerMode("schedule_now");
                          setDateTouched(true);
                        }}
                      />
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[12px] font-medium" style={{ color: "#354756" }}>
                          Schedule now
                        </span>
                        <span className="text-[10px]" style={{ color: "#96A3AF" }}>
                          {selectedAction === "backup_delete"
                            ? "Backup & delete starts about 5 minutes after you save."
                            : "Delete starts about 5 minutes after you save."}
                        </span>
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-2">
                      <input
                        type="radio"
                        name="trigger-mode"
                        className="mt-0.5"
                        checked={triggerMode === "trigger_at"}
                        disabled={quickActionsDisabled}
                        onChange={() => {
                          setTriggerMode("trigger_at");
                          setDateTouched(true);
                        }}
                      />
                      <span className="text-[12px] font-medium" style={{ color: "#354756" }}>
                        Trigger at
                      </span>
                    </label>
                  </div>
                )}
                {(usesDateOnly || (usesScheduleNow && triggerMode === "trigger_at")) && (
                  <div className="flex flex-col gap-2">
                    {usesScheduleNow && triggerMode === "trigger_at" && (
                      <span className="text-[10px]" style={{ color: "#96A3AF" }}>
                        Pick when the action should start (must be in the future).
                      </span>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: "#96A3AF" }}>
                          Date
                        </span>
                        <input
                          type="date"
                          className="c-input w-full tabular-nums"
                          disabled={quickActionsDisabled}
                          min={minScheduleIso}
                          max={maxScheduleIso}
                          value={scheduleDateInput}
                          aria-label="Trigger date"
                          onChange={(e) => {
                            setScheduleDateInput(e.target.value);
                            setDateTouched(true);
                          }}
                        />
                      </label>
                      {!usesDateOnly && (
                        <label className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase tracking-wider" style={{ color: "#96A3AF" }}>
                            Time
                          </span>
                          <input
                            type="time"
                            className="c-input w-full tabular-nums"
                            disabled={quickActionsDisabled}
                            value={triggerTimeInput}
                            aria-label="Trigger time"
                            onChange={(e) => {
                              setTriggerTimeInput(e.target.value);
                              setDateTouched(true);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </fieldset>
            </div>
            {liftSaveWarning && liftingExclusionDraft ? (
              <p className="text-[11px] font-medium" style={{ color: "#B23838" }} role="alert">
                Enter a valid action date before lifting exclusion.
              </p>
            ) : null}
            {readOnly ? (
              <p className="text-[11px]" style={{ color: "#96A3AF" }}>
                Deleted records are read-only.
              </p>
            ) : draftExcluded ? (
              <p className="text-[11px]" style={{ color: "#96A3AF" }}>
                Turn off Exclusion to enable schedule actions below.
              </p>
            ) : liftingExclusionDraft ? (
              <p className="text-[11px]" style={{ color: "#96A3AF" }}>
                Enter action date (required) to lift exclusion and save your schedule.
              </p>
            ) : null}
          </div>

          {/* Activity log — schedule, exclusion, backup, and manual events */}
          <div className="min-w-0 px-4 py-4">
            <p className="section-hdr">Activity log</p>
            <p className="mb-3 text-[11px] leading-snug text-cf-muted">
              Schedule changes, exclusions, backups, and other actions for this database.
            </p>
            {activityLog.length === 0 ? (
              <p className="text-[12px]" style={{ color: "#96A3AF" }}>
                No activity for this database yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {activityLog.map((a) => (
                  <ActivityLogItem key={a.id} entry={a} />
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer — CareFlow modal footer pattern */}
        <footer
          className="flex h-[44px] shrink-0 items-center justify-end gap-2 px-4"
          style={{ borderTop: "1px solid #ECEFF2", background: "#FFFFFF" }}
        >
          <button type="button" className="c-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          {!readOnly && !backupInProgress && !showBackupConfirm && (
            <button type="button" className="c-btn-primary" disabled={!canSave} onClick={handleSave}>
              Save
            </button>
          )}
        </footer>
      </div>

      {showBackupConfirm && !readOnly && (
        <>
          <div
            className="fixed inset-0 z-[190]"
            style={{ background: "rgba(13,22,29,0.28)" }}
            onClick={() => setShowBackupConfirm(false)}
            aria-hidden
          />
          <div
            className="fixed left-1/2 top-1/2 z-[200] w-[380px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[6px] bg-white"
            style={{ border: "1px solid #ECEFF2", boxShadow: "0 10px 28px rgba(13,22,29,0.30)" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="backup-confirm-title"
          >
            <div className="border-b px-4 py-3" style={{ borderColor: "#ECEFF2", background: "#F7F8FA" }}>
              <h3 id="backup-confirm-title" className="text-[14px] font-semibold" style={{ color: "#5D6F7E" }}>
                Confirm backup
              </h3>
            </div>
            <div className="space-y-2 px-4 py-4">
              <p className="text-[12px]" style={{ color: "#354756" }}>
                Start backup now for <span className="font-medium">{db.name}</span>?
              </p>
              <p className="text-[11px]" style={{ color: "#96A3AF" }}>
                Backup will begin immediately and appear in Operations as in progress.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t px-4 py-3" style={{ borderColor: "#ECEFF2" }}>
              <button
                type="button"
                className="c-btn-ghost"
                onClick={() => setShowBackupConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="c-btn-primary"
                onClick={confirmBackupNow}
              >
                Backup now
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
