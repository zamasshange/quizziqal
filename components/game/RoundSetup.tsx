"use client";

import Link from "next/link";
import type { Quiz } from "@/lib/types";
import {
  QUESTION_COUNT_OPTIONS,
  DIFFICULTIES,
  TIMER_OPTIONS,
  type QuestionCount,
  type Difficulty,
  type TimerSeconds,
} from "@/lib/roundSettings";

type Props = {
  quiz: Quiz;
  difficulty: Difficulty;
  questionCount: QuestionCount;
  timerSeconds: TimerSeconds;
  loading?: boolean;
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
  onDifficulty,
  onQuestionCount,
  onTimer,
  onStart,
}: Props) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-5"
      style={{
        background:
          "linear-gradient(160deg, #46178f 0%, #6b2fd6 45%, #33348e 100%)",
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-4 border-white/20 bg-white p-6 shadow-2xl lg:p-8">
        <div
          className="pointer-events-none absolute -right-6 -top-6 text-6xl opacity-20"
          aria-hidden
        >
          {quiz.coverIcon}
        </div>

        <div className="relative mb-6 text-center">
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black/10 text-5xl shadow-lg"
            style={{ background: quiz.coverGradient }}
          >
            {quiz.coverIcon}
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">{quiz.title}</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Pick your round — then let&apos;s go! 🎯
          </p>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-gray-400">
            Difficulty
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
                  {d === "Easy" ? "😊 Easy picks" : d === "Medium" ? "🔥 Solid" : "🧠 Expert"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-gray-400">
            Questions
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
            Timer
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
          {loading ? "Loading…" : "▶  Start game!"}
        </button>

        <Link
          href="/discover"
          className="mt-4 block text-center text-sm font-semibold text-gray-400 underline"
        >
          ← Back to Discover
        </Link>
      </div>
    </div>
  );
}
