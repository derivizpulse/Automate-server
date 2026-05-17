import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../lib/cn";

function formatSummary(selected: string[], allLabel: string, maxNames = 2): string {
  if (selected.length === 0) return allLabel;
  if (selected.length === 1) return selected[0];
  if (selected.length <= maxNames) return selected.join(", ");
  return `${selected.length} selected`;
}

export function MultiSelectFilter({
  id,
  label,
  options,
  value,
  onChange,
  allLabel,
  className,
}: {
  id: string;
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  allLabel: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, search]);

  const selectedSet = useMemo(() => new Set(value), [value]);
  const summary = formatSummary(value, allLabel);
  const showAll = value.length === 0;

  function toggleOption(opt: string) {
    if (showAll) {
      onChange(options.filter((o) => o !== opt));
      return;
    }
    if (selectedSet.has(opt)) {
      onChange(value.filter((v) => v !== opt));
      return;
    }
    const next = [...value, opt];
    if (next.length >= options.length) {
      onChange([]);
      return;
    }
    onChange(
      next.sort((a, b) => options.indexOf(a) - options.indexOf(b))
    );
  }

  function resetToAll() {
    onChange([]);
    setSearch("");
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <label htmlFor={id} className="cf-field-label shrink-0">
        {label}
      </label>
      <div ref={rootRef} className="relative w-full min-w-0">
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            "c-input flex h-7 w-full items-center justify-between gap-2 pr-7 text-left",
            value.length > 0 && "border-cf-primary/50 bg-cf-primary-light/20"
          )}
          onClick={() => setIsOpen((o) => !o)}
        >
          <span
            className={cn(
              "min-w-0 truncate text-[12px]",
              value.length === 0 ? "text-cf-text" : "font-medium text-cf-primary"
            )}
          >
            {summary}
          </span>
        </button>
        <span
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-cf-secondary"
          aria-hidden
        >
          {isOpen ? "▲" : "▼"}
        </span>

        {isOpen && (
          <div
            className="absolute left-0 right-0 top-[calc(100%+4px)] z-[220] overflow-hidden rounded-cf border border-cf-gs-20 bg-white shadow-modal"
            role="listbox"
            aria-multiselectable
            aria-label={`${label} options`}
          >
            <div className="border-b border-cf-border-soft bg-cf-surface px-2 py-1.5">
              <input
                className="c-input mb-1.5 w-full"
                placeholder={`Search ${label.toLowerCase()}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
              />
              <button
                type="button"
                className="text-[10px] font-medium text-cf-primary hover:underline"
                onClick={resetToAll}
              >
                Show all
              </button>
            </div>
            <div className="max-h-[220px] overflow-auto py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const checked = showAll || selectedSet.has(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="option"
                      aria-selected={checked}
                      className={cn(
                        "flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] transition-colors",
                        checked
                          ? "bg-cf-primary-light/60 text-cf-text hover:bg-cf-primary-light"
                          : "bg-white text-cf-text hover:bg-cf-gs-5"
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleOption(opt)}
                    >
                      <span
                        className={cn(
                          "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[2px] border text-[9px] leading-none",
                          checked
                            ? "border-cf-primary bg-cf-primary text-white"
                            : "border-cf-gs-20 bg-white"
                        )}
                        aria-hidden
                      >
                        {checked ? "✓" : ""}
                      </span>
                      <span className={checked ? "font-medium" : undefined}>{opt}</span>
                    </button>
                  );
                })
              ) : (
                <div className="px-2.5 py-2 text-[11px] text-cf-muted">No matches</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
