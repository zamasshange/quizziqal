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
      ? "grid h-full w-full grid-cols-2 grid-rows-2 gap-2.5 p-3 lg:gap-3 lg:p-5"
      : "grid h-full w-full grid-cols-2 grid-rows-2 gap-2.5 p-3 pb-4 lg:gap-3 lg:p-4";

  return (
    <div className={gridClass}>
      {answers.map((answer, i) => {
        const label = ANSWER_LABELS[i] ?? String(i + 1);
        const isSelected = selectedIndex === i;
        const showCorrect = reveal && answer.correct;
        const sharedClass = `answer-btn flex min-h-[72px] items-center gap-2.5 rounded-xl px-3 py-3 text-white lg:min-h-[88px] lg:gap-3 lg:px-4 lg:py-4 ${
          showCorrect ? "ring-4 ring-white ring-offset-2" : ""
        } ${isSelected ? "answer-btn-selected" : ""} ${
          disabled && !reveal ? "cursor-not-allowed opacity-80" : ""
        }`;

        if (layout === "host" || (disabled && !onAnswer)) {
          return (
            <div
              key={i}
              className={sharedClass}
              style={{ background: COLOR_MAP[answer.color] }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-black/20 bg-black/25 text-lg font-extrabold shadow-inner lg:h-11 lg:w-11 lg:text-xl">
                {label}
              </span>
              <span className="text-xs font-extrabold leading-tight lg:text-sm">
                {answer.text}
              </span>
            </div>
          );
        }

        return (
          <button
            key={i}
            type="button"
            onClick={() => onAnswer?.(i)}
            disabled={disabled}
            className={`${sharedClass} text-left`}
            style={{ background: COLOR_MAP[answer.color] }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-black/20 bg-black/25 text-lg font-extrabold shadow-inner lg:h-11 lg:w-11 lg:text-xl">
              {label}
            </span>
            <span className="text-xs font-extrabold leading-tight lg:text-sm">
              {answer.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export { COLOR_MAP };
