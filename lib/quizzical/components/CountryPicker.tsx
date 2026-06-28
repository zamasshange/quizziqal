"use client";

import CountryFlag from "@/components/CountryFlag";
import { COUNTRIES } from "@/lib/progression/countries";

type CountryPickerProps = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
};

export default function CountryPicker({
  value,
  onChange,
  disabled = false,
}: CountryPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COUNTRIES.map((c) => {
        const selected = value === c.code;
        return (
          <button
            key={c.code}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onChange(c.code)}
            className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-extrabold transition-colors disabled:opacity-60 ${
              selected
                ? "border-ink bg-grass text-white"
                : "border-ink/20 bg-white text-ink/70 hover:border-ink/40"
            }`}
          >
            <CountryFlag
              code={c.code}
              width={24}
              className={selected ? "border-white/40" : ""}
            />
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
