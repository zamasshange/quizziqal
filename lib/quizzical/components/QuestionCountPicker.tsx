"use client";

import { playClick } from "@/lib/sound";
import {
  QUESTION_COUNT_OPTIONS,
  type QuestionCount,
} from "@/lib/quizRoundSettings";

type Props = {
  value: QuestionCount;
  onChange: (count: QuestionCount) => void;
  className?: string;
};

export default function QuestionCountPicker({
  value,
  onChange,
  className = "max-w-xs",
}: Props) {
  return (
    <div className={`flex w-full flex-col gap-2 ${className}`}>
      <span className="text-left text-xs font-extrabold uppercase tracking-wide text-ink/45">
        Questions per round
      </span>
      <div className="grid grid-cols-5 gap-2">
        {QUESTION_COUNT_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              playClick();
              onChange(n);
            }}
            className={`rounded-xl border-[3px] border-ink py-2 text-sm font-extrabold transition-colors ${
              value === n
                ? "bg-sun text-ink"
                : "bg-cream text-ink hover:bg-cream-dark"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
