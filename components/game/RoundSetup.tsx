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
    <div
      className="sonke-play-page"
      style={{
        background: `linear-gradient(180deg, #2638c4 0%, #0081ca 55%, #99cf16 100%)`,
      }}
    >
      <div className="sonke-play-sky" aria-hidden="true" />
      <div className="sonke-play-hills" aria-hidden="true" />

      <main className="sonke-play-main">
        <div className="sonke-play-stage">
          <div className="sonke-play-splash">
            <div className="sonke-play-splash-emoji" aria-hidden="true">
              {quiz.coverIcon}
            </div>
            <h1 className="sonke-play-title">{quiz.title}</h1>
            <p className="sonke-play-tagline">
              Configure your round — then play!
            </p>

            <div className="sonke-play-frame w-full max-w-md text-left">
              {error ? (
                <div role="alert" className="sonke-badge-note mb-4">
                  {error}
                </div>
              ) : null}

              <p className="sonke-subsection-title">Difficulty</p>
              <div className="sonke-category-nav mb-4">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onDifficulty(d)}
                    className={
                      difficulty === d ? "sonke-category-pill active" : "sonke-category-pill"
                    }
                    title={DIFFICULTY_FLAVOR[d]}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <p className="sonke-subsection-title">Questions</p>
              <div className="sonke-category-nav mb-4 flex-wrap">
                {QUESTION_COUNT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onQuestionCount(n)}
                    className={
                      questionCount === n ? "sonke-category-pill active" : "sonke-category-pill"
                    }
                  >
                    {n}
                  </button>
                ))}
              </div>

              <p className="sonke-subsection-title">Timer</p>
              <div className="sonke-category-nav mb-4 flex-wrap">
                {TIMER_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onTimer(t)}
                    className={
                      timerSeconds === t ? "sonke-category-pill active" : "sonke-category-pill"
                    }
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
              className="sonke-play-start-btn"
            >
              <span className="sonke-play-start-icon" aria-hidden="true">▶</span>
              {loading ? "Loading…" : startLabel}
            </button>

            <Link href="/discover" className="sonke-play-attribution">
              Back to Discover
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
