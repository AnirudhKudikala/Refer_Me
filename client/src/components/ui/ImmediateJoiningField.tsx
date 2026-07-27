import { cn } from "../../lib/utils";

interface ImmediateJoiningFieldProps {
  immediateJoining: boolean;
  noticePeriod: string;
  onImmediateChange: (checked: boolean) => void;
  onNoticePeriodChange: (value: string) => void;
}

export function ImmediateJoiningField({
  immediateJoining,
  noticePeriod,
  onImmediateChange,
  onNoticePeriodChange,
}: ImmediateJoiningFieldProps) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={immediateJoining}
          onChange={(e) => {
            onImmediateChange(e.target.checked);
            if (e.target.checked) onNoticePeriodChange("");
          }}
          className="h-4 w-4 rounded border-theme accent-[var(--color-accent)]"
        />
        <span className="text-sm text-theme group-hover:text-accent transition-colors">Available for immediate joining</span>
      </label>
      {!immediateJoining && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-muted">Notice Period</label>
          <input
            value={noticePeriod}
            onChange={(e) => onNoticePeriodChange(e.target.value)}
            placeholder="e.g. 30 days, 2 months"
            className={cn(
              "w-full rounded-xl border border-theme px-4 py-2.5 text-sm text-theme",
              "placeholder:text-muted/60 focus:border-[var(--color-accent)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
            )}
            style={{ backgroundColor: "var(--color-input-bg)" }}
          />
        </div>
      )}
    </div>
  );
}
