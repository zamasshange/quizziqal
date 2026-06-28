"use client";

import { useState } from "react";
import Button3D from "./Button3D";
import QuizPlayer from "./QuizPlayer";
import type { Quiz } from "@/lib/quizzes";

const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
const COUNTS = [3, 5, 10] as const;

const SUGGESTIONS = [
  "90s hip-hop",
  "The solar system",
  "Premier League history",
  "Greek mythology",
  "World capitals",
  "Marvel movies",
];

export default function AiQuizGenerator() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  async function generate(e?: React.FormEvent) {
    e?.preventDefault();
    if (loading) return;
    const trimmed = topic.trim();
    if (!trimmed) {
      setError("Please enter a topic.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmed, count, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Couldn't generate a quiz. Try again.");
        return;
      }
      setQuiz(data.quiz as Quiz);
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setQuiz(null);
    setError(null);
  }

  if (quiz) {
    return (
      <div className="pt-2">
        <QuizPlayer quiz={quiz} backHref="/ai" backLabel="New quiz" />
        <div className="mx-auto mt-4 max-w-2xl text-center">
          <button
            onClick={reset}
            className="text-sm font-bold text-ink/50 underline hover:text-ink"
          >
            ← Generate a different quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pt-2">
      <div className="mb-5 flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-ink bg-grass text-2xl text-white shadow-[0_3px_0_0_#0d0d0d]">
          🤖
        </span>
        <h1 className="mt-3 font-display text-2xl font-black text-ink md:text-3xl">
          A.I. Quiz Generator
        </h1>
        <p className="mt-1 max-w-md text-sm font-bold text-ink/60">
          Type any subject and our A.I. builds a fresh multiple-choice quiz for
          you to play.
        </p>
      </div>

      <form
        onSubmit={generate}
        className="rounded-3xl border-4 border-ink bg-white p-5 shadow-[0_6px_0_0_#0d0d0d] md:p-7"
      >
        <label className="block text-xs font-extrabold uppercase tracking-wide text-ink/60">
          Topic
        </label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. The Roman Empire, K-pop, the human body…"
          maxLength={120}
          className="mt-1.5 w-full rounded-xl border-[3px] border-ink bg-cream px-4 py-3 text-base font-bold text-ink outline-none placeholder:text-ink/35 focus:bg-white"
        />

        <div className="mt-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTopic(s)}
              className="rounded-full border-2 border-ink/15 bg-cream px-2.5 py-1 text-xs font-bold text-ink/60 hover:border-ink hover:text-ink"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <span className="block text-xs font-extrabold uppercase tracking-wide text-ink/60">
              Questions
            </span>
            <div className="mt-1.5 flex gap-2">
              {COUNTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCount(c)}
                  className={`flex-1 rounded-xl border-[3px] border-ink py-2 text-sm font-extrabold transition-colors ${
                    count === c
                      ? "bg-grass text-white"
                      : "bg-cream text-ink hover:bg-cream-dark"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-extrabold uppercase tracking-wide text-ink/60">
              Difficulty
            </span>
            <div className="mt-1.5 flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 rounded-xl border-[3px] border-ink py-2 text-sm font-extrabold transition-colors ${
                    difficulty === d
                      ? "bg-grass text-white"
                      : "bg-cream text-ink hover:bg-cream-dark"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border-2 border-ink/10 bg-coral/40 px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-center">
          <Button3D type="submit" variant="grass" size="lg">
            {loading ? "Generating…" : "✨ Generate quiz"}
          </Button3D>
        </div>
      </form>
    </div>
  );
}
