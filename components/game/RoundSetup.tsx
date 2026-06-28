"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Quiz } from "@/lib/types";
import {
  QUESTION_COUNT_OPTIONS,
  DIFFICULTIES,
  TIMER_OPTIONS,
  type QuestionCount,
  type Difficulty,
  type TimerSeconds,
} from "@/lib/roundSettings";
import {
  DIFFICULTY_FLAVOR,
  pickRandom,
  SETUP_START_LINES,
} from "@/lib/gameFlavor";

type Props = {
  quiz: Quiz;
  difficulty: Difficulty;
  questionCount: QuestionCount;
  timerSeconds: TimerSeconds;
  loading?: boolean;
  error?: string | null;
  onDifficulty: (d: Difficulty) => void;
  onQuestionCount: (n: QuestionCount) => void;
  onTimer: (t: TimerSeconds) => void;
  onStart: () => void;
};

export default function RoundSetup({
  quiz,
  difficulty,
  questionCount,
  timerSeconds,
  loading,
  error,
  onDifficulty,
  onQuestionCount,
  onTimer,
  onStart,
}: Props) {
  const startLabel = useMemo(() => pickRandom(SETUP_START_LINES), []);

  return (
    <div className="play-arena relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-5">
      <div className="play-arena-glow pointer-events-none absolute inset-0" aria-hidden />
      <span className="pointer-events-none absolute left-8 top-12 text-5xl opacity-30 animate-float" aria-hidden>🎪</span>
      <span className="pointer-events-none absolute right-10 top-20 text-4xl opacity-30 animate-float-slow" aria-hidden>🤡</span>
      <span className="pointer-events-none absolute bottom-16 left-12 text-4xl opacity-25 animate-wiggle" aria-hidden>🃏</span>

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-4 border-white/25 bg-white p-6 shadow-2xl lg:p-8">
        <div
          className="pointer-events-none absolute -right-6 -top-6 text-6xl opacity-20 animate-wiggle"
          aria-hidden
        >
          {quiz.coverIcon}
        </div>

        <div className="relative mb-6 text-center">
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black/10 text-5xl shadow-lg animate-bounce-in"
            style={{ background: quiz.coverGradient }}
          >
            {quiz.coverIcon}
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">{quiz.title}</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Configure your chaos — then dominate (maybe) 🎯
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="mb-5 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            😬 {error}
          </div>
        ) : null}

        <div className="mb-5">
          <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-gray-400">
            How brave are you?
          </label>
          <div className="flex flex-col gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onDifficulty(d)}
                className={`game-pill rounded-xl px-4 py-2.5 text-left text-sm font-extrabold ${
                  difficulty === d
                    ? "game-pill-active bg-[var(--kahoot-purple)] text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {d}
                <span className="ml-2 text-xs font-semibold opacity-70">
                  {DIFFICULTY_FLAVOR[d]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-gray-400">
            How many rounds of pain?
          </label>
          <div className="grid grid-cols-5 gap-2">
            {QUESTION_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onQuestionCount(n)}
                className={`game-pill rounded-xl py-2.5 text-sm font-extrabold ${
                  questionCount === n
                    ? "game-pill-active bg-[var(--kahoot-purple)] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-gray-400">
            Seconds before panic
          </label>
          <div className="grid grid-cols-5 gap-2">
            {TIMER_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTimer(t)}
                className={`game-pill rounded-xl py-2.5 text-sm font-extrabold ${
                  timerSeconds === t
                    ? "bg-[var(--kahoot-blue)] text-white shadow-[0_3px_0_#0a3d7a]"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={onStart}
          className="game-pill w-full rounded-full bg-[var(--kahoot-green)] py-4 text-lg font-extrabold text-white shadow-[0_5px_0_#1a5c08] disabled:opacity-50"
        >
          {loading ? "Summoning questions…" : startLabel}
        </button>

        <Link
          href="/discover"
          className="mt-4 block text-center text-sm font-semibold text-gray-400 underline"
        >
          🏃 Chicken out — back to Discover
        </Link>
      </div>
    </div>
  );
}
