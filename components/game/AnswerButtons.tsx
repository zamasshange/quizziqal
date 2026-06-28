"use client";

import { AnswerColor } from "@/lib/types";
import { ANSWER_LABELS } from "@/lib/roundSettings";

const COLOR_MAP: Record<AnswerColor, string> = {
  red: "var(--kahoot-red)",
  blue: "var(--kahoot-blue)",
  yellow: "var(--kahoot-yellow)",
  green: "var(--kahoot-green)",
};

interface AnswerButtonsProps {
  answers: { text: string; color: AnswerColor; correct?: boolean }[];
  onAnswer?: (index: number) => void;
  disabled?: boolean;
  reveal?: boolean;
  selectedIndex?: number;
  layout?: "grid" | "host";
}

export default function AnswerButtons({
  answers,
  onAnswer,
  disabled,
  reveal,
  selectedIndex,
  layout = "grid",
}: AnswerButtonsProps) {
  const gridClass =
    layout === "host"
      ? "grid h-full w-full grid-cols-2 grid-rows-2 gap-2 p-3 lg:gap-3 lg:p-6"
      : "grid h-full w-full grid-cols-2 grid-rows-2 gap-2 p-3 lg:gap-3 lg:p-4";

  return (
    <div className={gridClass}>
      {answers.map((answer, i) => {
        const label = ANSWER_LABELS[i] ?? String(i + 1);
        const isSelected = selectedIndex === i;
        const showCorrect = reveal && answer.correct;

        if (layout === "host" || disabled) {
          return (
            <div
              key={i}
              className={`answer-btn flex items-center gap-3 rounded-lg p-3 text-white shadow-lg lg:p-5 ${
                showCorrect ? "ring-4 ring-white ring-offset-2" : ""
              } ${isSelected ? "ring-4 ring-white scale-[0.98]" : ""}`}
              style={{ background: COLOR_MAP[answer.color] }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black/20 text-lg font-extrabold lg:h-10 lg:w-10 lg:text-xl">
                {label}
              </span>
              <span className="text-sm font-bold leading-tight lg:text-base">{answer.text}</span>
            </div>
          );
        }

        return (
          <button
            key={i}
            type="button"
            onClick={() => onAnswer?.(i)}
            disabled={disabled}
            className={`answer-btn flex items-center gap-2 rounded-lg p-3 text-left text-white shadow-md lg:gap-3 lg:p-5 ${
              showCorrect ? "ring-4 ring-white" : ""
            } ${isSelected ? "ring-4 ring-white scale-[0.98]" : ""} ${
              disabled ? "cursor-not-allowed opacity-70" : ""
            }`}
            style={{ background: COLOR_MAP[answer.color] }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black/20 text-base font-extrabold lg:h-10 lg:w-10 lg:text-lg">
              {label}
            </span>
            <span className="text-xs font-bold leading-tight lg:text-sm">{answer.text}</span>
          </button>
        );
      })}
    </div>
  );
}

export { COLOR_MAP };
