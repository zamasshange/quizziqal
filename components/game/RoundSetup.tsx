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
  const isPicture = quiz.tags.includes("picture") || quiz.tags.includes("intent");

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-5"
      style={{
        background:
          "linear-gradient(180deg, var(--kahoot-purple) 0%, var(--kahoot-purple-dark) 100%)",
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl lg:p-8">
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-4xl"
            style={{ background: quiz.coverGradient }}
          >
            {quiz.coverIcon}
          </div>
          <h1 className="text-xl font-extrabold text-gray-900">{quiz.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Choose your settings, then start playing
          </p>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
            Difficulty
          </label>
          <div className="flex flex-col gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onDifficulty(d)}
                className={`rounded-xl border-2 px-4 py-2.5 text-left text-sm font-bold transition-colors ${
                  difficulty === d
                    ? "border-[var(--kahoot-purple)] bg-[var(--kahoot-purple)] text-white"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[var(--kahoot-purple)]"
                }`}
              >
                {d}
                <span className="ml-2 text-xs font-semibold opacity-70">
                  {d === "Easy"
                    ? "household names"
                    : d === "Medium"
                      ? "well-known"
                      : "deep cuts"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
            Questions
          </label>
          <div className="grid grid-cols-5 gap-2">
            {QUESTION_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onQuestionCount(n)}
                className={`rounded-lg py-2 text-sm font-bold ${
                  questionCount === n
                    ? "bg-[var(--kahoot-purple)] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
            Timer per question
          </label>
          <div className="grid grid-cols-5 gap-2">
            {TIMER_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTimer(t)}
                className={`rounded-lg py-2 text-sm font-bold ${
                  timerSeconds === t
                    ? "bg-[var(--kahoot-blue)] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>

        {isPicture && (
          <p className="mb-4 text-center text-xs text-gray-400">
            Wikipedia-powered images · new questions every round
          </p>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={onStart}
          className="w-full rounded-full bg-[var(--kahoot-purple)] py-3.5 text-lg font-extrabold text-white disabled:opacity-50"
        >
          {loading ? "Loading quiz…" : "▶ Start"}
        </button>

        <Link
          href="/discover"
          className="mt-4 block text-center text-sm text-gray-500 underline"
        >
          Back to Discover
        </Link>
      </div>
    </div>
  );
}
