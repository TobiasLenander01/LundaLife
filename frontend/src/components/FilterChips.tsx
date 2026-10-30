import { FilterOptions, FilterValue } from '@/types/app';

interface FilterChipsProps {
  value: FilterValue;
  counts: Record<FilterValue, number>;
  onChange: (value: FilterValue) => void;
}

export default function FilterChips({ value, counts, onChange }: FilterChipsProps) {
  return (
    // Scrolls sideways on phones, wraps in the wider side panel
    <div role="radiogroup" aria-label="Show events" className="no-scrollbar flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible">
      {FilterOptions.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors ${
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
