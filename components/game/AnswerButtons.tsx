"use client";

import { AnswerColor } from "@/lib/types";

const COLOR_MAP: Record<AnswerColor, string> = {
  red: "var(--kahoot-red)",
  blue: "var(--kahoot-blue)",
  yellow: "var(--kahoot-yellow)",
  green: "var(--kahoot-green)",
};

const SHAPE_MAP: Record<AnswerColor, string> = {
  red: "▲",
  blue: "◆",
  yellow: "●",
  green: "■",
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
  if (layout === "host") {
    return (
      <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2 p-3 lg:gap-3 lg:p-6">
        {answers.map((answer, i) => (
          <div
            key={i}
            className={`answer-btn flex items-center justify-center rounded-lg p-3 text-center text-white shadow-lg lg:p-6 ${
              reveal && answer.correct ? "ring-4 ring-white ring-offset-2" : ""
            }`}
            style={{ background: COLOR_MAP[answer.color] }}
          >
            <div>
              <span className="mb-1 block text-2xl lg:mb-2 lg:text-3xl">{SHAPE_MAP[answer.color]}</span>
              <span className="text-sm font-bold lg:text-lg">{answer.text}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2 p-3 lg:gap-3 lg:p-4">
      {answers.map((answer, i) => (
        <button
          key={i}
          onClick={() => onAnswer?.(i)}
          disabled={disabled}
          className={`answer-btn flex flex-col items-center justify-center rounded-lg p-3 text-white shadow-md lg:p-6 ${
            reveal && answer.correct ? "ring-4 ring-white" : ""
          } ${selectedIndex === i ? "ring-4 ring-white scale-95" : ""} ${
            disabled ? "cursor-not-allowed opacity-70" : ""
          }`}
          style={{ background: COLOR_MAP[answer.color] }}
        >
          <span className="mb-1 text-2xl lg:mb-2 lg:text-3xl">{SHAPE_MAP[answer.color]}</span>
          <span className="text-xs font-bold leading-tight lg:text-base">{answer.text}</span>
        </button>
      ))}
    </div>
  );
}

export { COLOR_MAP, SHAPE_MAP };
