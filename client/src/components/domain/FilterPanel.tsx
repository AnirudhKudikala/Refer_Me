import { useState } from "react";
import { Search, SlidersHorizontal, X, CalendarDays, ChevronDown } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { TagInput } from "../ui/TagInput";
import { DatePicker, parseDateString } from "../ui/DatePicker";
import { cn } from "../../lib/utils";

export type InterestStatusFilter = "ALL" | "ACCEPTED" | "PENDING" | "DECLINED";

export interface SeekerFilters {
  skills: string[];
  roles: string[];
  minExp: string;
  maxExp: string;
  location: string;
  updatedUntil: string;
  interestStatus: InterestStatusFilter;
}

interface FilterPanelProps {
  filters: SeekerFilters;
  onChange: (filters: SeekerFilters) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  const update = (partial: Partial<SeekerFilters>) => {
    onChange({ ...filters, ...partial });
  };

  const clearAll = () => {
    onChange({
      skills: [],
      roles: [],
      minExp: "",
      maxExp: "",
      location: "",
      updatedUntil: "",
      interestStatus: "ALL",
    });
    setDateFilterOpen(false);
  };

  const hasFilters =
    filters.skills.length > 0 ||
    filters.roles.length > 0 ||
    filters.minExp ||
    filters.maxExp ||
    filters.location ||
    !!filters.updatedUntil ||
    filters.interestStatus !== "ALL";

  const selectedDateLabel = filters.updatedUntil
    ? parseDateString(filters.updatedUntil)?.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-theme"
          aria-expanded={expanded}
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      {expanded && (
        <div className="space-y-4">
          <Input
            label="Location"
            placeholder="e.g. San Francisco"
            value={filters.location}
            onChange={(e) => update({ location: e.target.value })}
            aria-label="Filter by location"
          />
          <TagInput label="Tech Stack" value={filters.skills} onChange={(skills) => update({ skills })} placeholder="React, Python, node..." />
          <TagInput label="Job Role" value={filters.roles} onChange={(roles) => update({ roles })} placeholder="Engineer, Developer..." />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Experience"
              type="number"
              min={0}
              placeholder="0"
              value={filters.minExp}
              onChange={(e) => update({ minExp: e.target.value })}
            />
            <Input
              label="Max Experience"
              type="number"
              min={0}
              placeholder="10"
              value={filters.maxExp}
              onChange={(e) => update({ maxExp: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="interest-status" className="block text-sm font-medium text-muted">
              Interest status
            </label>
            <select
              id="interest-status"
              value={filters.interestStatus}
              onChange={(e) => update({ interestStatus: e.target.value as InterestStatusFilter })}
              className="w-full rounded-xl border border-theme px-4 py-2.5 text-sm text-theme focus:border-[var(--color-accent)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
              style={{ backgroundColor: "var(--color-input-bg)" }}
            >
              <option value="ALL">View all</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PENDING">Pending</option>
              <option value="DECLINED">Declined</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted">Profile updated until</p>
            <button
              type="button"
              onClick={() => setDateFilterOpen((open) => !open)}
              className={cn(
                "w-full flex items-center justify-between gap-2 rounded-xl border border-theme px-4 py-2.5 text-sm transition-colors",
                "hover:border-[var(--color-accent)]/40 focus:border-[var(--color-accent)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20",
                dateFilterOpen && "border-[var(--color-accent)]/40"
              )}
              style={{ backgroundColor: "var(--color-input-bg)" }}
              aria-expanded={dateFilterOpen}
            >
              <span className="flex items-center gap-2 min-w-0">
                <CalendarDays className="h-4 w-4 shrink-0 text-muted" />
                <span className={selectedDateLabel ? "text-theme truncate" : "text-muted"}>
                  {selectedDateLabel ?? "Select date"}
                </span>
              </span>
              <ChevronDown
                className={cn("h-4 w-4 shrink-0 text-muted transition-transform", dateFilterOpen && "rotate-180")}
              />
            </button>
            {dateFilterOpen && (
              <DatePicker
                value={filters.updatedUntil}
                onChange={(updatedUntil) => update({ updatedUntil })}
                helperText="Only show candidates whose profile was last updated on or before this date."
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input
        type="search"
        placeholder="Search by name or headline..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-theme py-2.5 pl-10 pr-4 text-sm text-theme placeholder:text-muted/60 focus:border-[var(--color-accent)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
        style={{ backgroundColor: "var(--color-input-bg)" }}
        aria-label="Search seekers"
      />
    </div>
  );
}
