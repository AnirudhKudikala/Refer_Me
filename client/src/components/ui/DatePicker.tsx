import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateString(value: string): Date | null {
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  maxDate?: Date;
  helperText?: string;
}

export function DatePicker({
  label,
  value,
  onChange,
  maxDate = new Date(),
  helperText,
}: DatePickerProps) {
  const selected = parseDateString(value);
  const max = startOfDay(maxDate);
  const initialView = selected ?? max;

  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());

  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const leading = firstDay.getDay();
    const total = Math.ceil((leading + daysInMonth) / 7) * 7;

    return Array.from({ length: total }, (_, i) => {
      const dayNum = i - leading + 1;
      if (dayNum < 1 || dayNum > daysInMonth) return null;
      return new Date(viewYear, viewMonth, dayNum);
    });
  }, [viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const goMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const canGoNext =
    viewYear < max.getFullYear() ||
    (viewYear === max.getFullYear() && viewMonth < max.getMonth());

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-muted">{label}</p>}

      <div
        className="rounded-xl border border-theme p-3"
        style={{ backgroundColor: "var(--color-input-bg)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => goMonth(-1)}
            className="rounded-lg p-1.5 text-muted hover:text-theme hover:bg-[var(--color-accent-muted)] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-theme">{monthLabel}</span>
          <button
            type="button"
            onClick={() => goMonth(1)}
            disabled={!canGoNext}
            className="rounded-lg p-1.5 text-muted hover:text-theme hover:bg-[var(--color-accent-muted)] transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-[10px] font-medium text-muted py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="h-8" />;
            }

            const dateStr = toDateString(date);
            const isSelected = value === dateStr;
            const isFuture = startOfDay(date) > max;
            const isToday = toDateString(max) === dateStr;

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isFuture}
                onClick={() => onChange(isSelected ? "" : dateStr)}
                className={cn(
                  "h-8 rounded-lg text-xs font-medium transition-colors",
                  isSelected
                    ? "text-white"
                    : isFuture
                      ? "text-muted/30 cursor-not-allowed"
                      : "text-theme hover:bg-[var(--color-accent-muted)]",
                  isToday && !isSelected && "ring-1 ring-[var(--color-accent)]/40"
                )}
                style={
                  isSelected
                    ? { background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))" }
                    : undefined
                }
                aria-label={date.toLocaleDateString()}
                aria-pressed={isSelected}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {value && (
          <div className="mt-3 pt-3 border-t border-theme flex items-center justify-between gap-2">
            <p className="text-xs text-muted">
              Selected: {selected?.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-accent hover:opacity-80"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {helperText && <p className="text-xs text-muted">{helperText}</p>}
    </div>
  );
}

export { toDateString, parseDateString };
