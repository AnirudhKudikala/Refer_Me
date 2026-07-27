import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ label, value, onChange, placeholder = "Add and press Enter", className }: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addTag(); }
    if (e.key === "Backspace" && !input && value.length > 0) onChange(value.slice(0, -1));
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <label className="block text-sm font-medium text-muted">{label}</label>}
      <div className="flex flex-wrap gap-2 rounded-xl border border-theme p-3 focus-within:border-[var(--color-accent)]/50 focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20" style={{ backgroundColor: "var(--color-input-bg)" }}>
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-accent-muted)] px-2.5 py-1 text-xs font-medium text-accent">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="rounded hover:opacity-70 p-0.5" aria-label={`Remove ${tag}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-theme placeholder:text-muted/60 outline-none"
        />
      </div>
    </div>
  );
}
