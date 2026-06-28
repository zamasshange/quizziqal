"use client";

import { AnswerColor } from "@/lib/types";
import { ANSWER_LABELS } from "@/lib/roundSettings";

const COLOR_MAP: Record<AnswerColor, string> = {
  red: "var(--kahoot-red)",
  blue: "var(--kahoot-blue)",
  yellow: "var(--kahoot-yellow)",
  green: "var(--kahoot-green)",
};

const COLOR_SHINE: Record<AnswerColor, string> = {
  red: "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 50%)",
  blue: "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 50%)",
  yellow: "linear-gradient(135deg, rgba(255,255,255,0.28) 0%, transparent 50%)",
  green: "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 50%)",
};

interface AnswerButtonsProps {
  answers: { text: string; color: AnswerColor; correct?: boolean }[];
  onAnswer?: (index: number) => void;
  disabled?: boolean;
  reveal?: boolean;
  selectedIndex?: number;
  layout?: "grid" | "stage";
}

export default function AnswerButtons({
  answers,
  onAnswer,
  disabled,
  reveal,
  selectedIndex,
  layout = "stage",
}: AnswerButtonsProps) {
  const gridClass =
    layout === "stage"
      ? "answer-grid-stage grid h-full w-full grid-cols-2 grid-rows-2 gap-2.5 p-3 pb-4 lg:gap-4 lg:p-2 lg:pb-2"
      : "grid h-full w-full grid-cols-2 grid-rows-2 gap-2.5 p-3 pb-4";

  return (
    <div className={gridClass}>
      {answers.map((answer, i) => {
        const label = ANSWER_LABELS[i] ?? String(i + 1);
        const isSelected = selectedIndex === i;
        const showCorrect = reveal && answer.correct;
        const isStatic = disabled && !onAnswer;

        const sharedClass = `answer-btn answer-btn-stage group relative flex items-center gap-2.5 overflow-hidden rounded-2xl px-3 py-3 text-white lg:flex-col lg:justify-center lg:gap-3 lg:px-4 lg:py-5 ${
          showCorrect ? "ring-4 ring-white ring-offset-2 ring-offset-transparent" : ""
        } ${isSelected ? "answer-btn-selected" : ""} ${
          disabled && !reveal ? "cursor-not-allowed opacity-80" : ""
        }`;

        const inner = (
          <>
            <span
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{ background: COLOR_SHINE[answer.color] }}
            />
            <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-black/25 bg-black/30 text-lg font-extrabold shadow-inner lg:h-14 lg:w-14 lg:rounded-2xl lg:text-2xl">
              {label}
            </span>
            <span className="relative z-10 text-xs font-extrabold leading-tight lg:text-center lg:text-base xl:text-lg">
              {answer.text}
            </span>
          </>
        );

        if (isStatic) {
          return (
            <div
              key={i}
              className={sharedClass}
              style={{ background: COLOR_MAP[answer.color] }}
            >
              {inner}
            </div>
          );
        }

        return (
          <button
            key={i}
            type="button"
            onClick={() => onAnswer?.(i)}
            disabled={disabled}
            className={`${sharedClass} text-left lg:text-center`}
            style={{ background: COLOR_MAP[answer.color] }}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}

export { COLOR_MAP };
