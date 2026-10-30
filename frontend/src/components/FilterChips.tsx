interface FilterChipsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  counts: Record<T, number>;
  onChange: (value: T) => void;
  label: string;
  // Smaller chips for the secondary (category) row
  compact?: boolean;
}

export default function FilterChips<T extends string>({ options, value, counts, onChange, label, compact = false }: FilterChipsProps<T>) {
  return (
    // Scrolls sideways on phones, wraps in the wider side panel
    <div role="radiogroup" aria-label={label} className="no-scrollbar flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full font-medium transition-colors ${
              compact ? 'h-8 px-3 text-[13px]' : 'h-9 px-3.5 text-sm'
            } ${
              selected
                ? 'bg-primary text-white shadow-sm'
                : 'bg-raised text-fg-soft ring-1 ring-line ring-inset hover:bg-muted'
            }`}
          >
            {option.label}
            <span className={`text-xs tabular-nums ${selected ? 'text-white/70' : 'text-fg-muted'}`}>
              {counts[option.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
