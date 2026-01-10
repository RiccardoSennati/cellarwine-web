"use client";

import { GlassChip } from "@/components/glass";

interface MultiSelectChipsProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
}

export function MultiSelectChips({
  options,
  selected,
  onChange,
  label,
}: MultiSelectChipsProps) {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <GlassChip
            key={option}
            selected={selected.includes(option)}
            onClick={() => toggleOption(option)}
          >
            {option}
          </GlassChip>
        ))}
      </div>
    </div>
  );
}

