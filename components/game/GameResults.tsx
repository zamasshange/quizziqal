"use client";

import Link from "next/link";
import { useMemo } from "react";
import ConfettiBurst from "./ConfettiBurst";
import { finishTitle } from "@/lib/gameFlavor";
import type { Quiz } from "@/lib/types";

type Props = {
  quiz: Quiz;
  score: number;
  correctCount: number;
  total: number;
  onSetup: () => void;
  onPlayAgain: () => void;
};

export default function GameResults({
  quiz,
  score,
  correctCount,
  total,
  onSetup,
  onPlayAgain,
}: Props) {
  const pct = total ? Math.round((correctCount / total) * 100) : 0;
  const title = useMemo(() => finishTitle(pct), [pct]);
  const showConfetti = pct >= 60;

  return (
    <div className="play-arena relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <div className="play-arena-glow pointer-events-none absolute inset-0" aria-hidden />
      {showConfetti && <ConfettiBurst count={40} />}

      <div className="relative z-10 mb-6 w-full max-w-md animate-bounce-in rounded-3xl border-4 border-white/25 bg-white/10 px-8 py-10 text-center backdrop-blur-md">
        <p className="mb-2 text-7xl animate-wiggle">{quiz.coverIcon}</p>
        <h1 className="mb-1 text-2xl font-extrabold text-white lg:text-3xl">{title}</h1>
        <p className="mb-4 text-sm font-semibold text-white/60">
          {correctCount}/{total} correct · {pct}%
        </p>
        <p className="text-6xl font-extrabold text-yellow-300 tabular-nums drop-shadow-lg">
          {score.toLocaleString()}
        </p>
        <p className="text-xs font-extrabold uppercase tracking-widest text-white/50">brain points</p>
      </div>

      <div className="relative z-10 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onSetup}
          className="game-pill rounded-full bg-white px-8 py-3 font-extrabold text-[var(--kahoot-purple)]"
        >
          🎛️ Tweak settings
        </button>
        <button
          type="button"
          onClick={onPlayAgain}
          className="game-pill rounded-full bg-[var(--kahoot-green)] px-8 py-3 font-extrabold text-white shadow-[0_4px_0_#1a5c08]"
        >
          🔁 Again!
        </button>
        <Link
          href="/discover"
          className="game-pill rounded-full border-2 border-white/50 bg-white/10 px-8 py-3 text-center font-extrabold text-white"
        >
          🏠 Escape
        </Link>
      </div>
    </div>
  );
}
