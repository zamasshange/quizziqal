"use client";

import type { RevealStatus } from "./RevealCard";
import { playClick } from "@/lib/sound";

type Props = {
  status: RevealStatus;
  continueLabel: string;
  onContinue: () => void;
  correctAnswer?: string;
  knowledgeSaved?: boolean;
};

export default function MobileRevealBar({
  status,
  continueLabel,
  onContinue,
  correctAnswer,
  knowledgeSaved = false,
}: Props) {
  const correct = status === "correct";
  const statusText =
    status === "correct"
      ? "Correct!"
      : status === "timeout"
        ? "Time's up!"
        : "Incorrect";
  const statusIcon = status === "correct" ? "🎉" : status === "timeout" ? "⏰" : "😬";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t-4 border-ink bg-white shadow-[0_-6px_0_0_#0d0d0d] md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div
        className={`flex items-center justify-between gap-2 px-4 py-2 text-white ${
          correct ? "bg-grass" : "bg-answer1"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2 font-display text-sm font-extrabold">
          <span className="text-lg">{statusIcon}</span>
          <span className="truncate">{statusText}</span>
        </span>
        {!correct && correctAnswer && (
          <span className="max-w-[45%] truncate text-right text-xs font-bold opacity-90">
            {correctAnswer}
          </span>
        )}
        {correct && knowledgeSaved && (
          <span className="max-w-[45%] truncate text-right text-[10px] font-semibold opacity-80">
            Saved
          </span>
        )}
      </div>
      <div className="px-4 pt-3">
        <button
          type="button"
          onClick={() => {
            playClick();
            onContinue();
          }}
          className="w-full rounded-2xl border-4 border-ink bg-ink py-3.5 font-display text-base font-extrabold tracking-wide text-white shadow-[0_4px_0_0_#0d0d0d] transition-transform active:translate-y-1 active:shadow-none"
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}
