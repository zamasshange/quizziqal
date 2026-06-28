"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

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

export default function AiQuizPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ai: { topic: trimmed, count, difficulty },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Couldn't generate a quiz. Try again.");
        return;
      }
      if (data.quiz?.id) {
        sessionStorage.setItem(
          `quizziqal:quiz:${data.quiz.id}`,
          JSON.stringify(data.quiz)
        );
        router.push(`/play/${data.quiz.id}`);
      }
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[220px]">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <main className="flex-1 p-3 pb-24 lg:p-8 lg:pb-8">
          <section
            className="mb-6 overflow-hidden rounded-xl p-5 text-white lg:rounded-2xl lg:p-10"
            style={{
              background:
                "linear-gradient(135deg, #5b19df 0%, var(--kahoot-purple) 50%, #a855f7 100%)",
            }}
          >
            <span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
              Powered by AI
            </span>
            <h1 className="mb-2 text-2xl font-extrabold lg:text-4xl">
              Create a quiz on anything
            </h1>
            <p className="max-w-lg text-sm text-white/90 lg:text-base">
              Type any topic and we&apos;ll build a fresh multiple-choice quiz for you to play instantly.
            </p>
          </section>

          <form
            onSubmit={generate}
            className="mx-auto max-w-xl rounded-2xl bg-white p-5 shadow-lg lg:p-8"
          >
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Topic
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The Roman Empire, K-pop, the human body…"
              maxLength={120}
              className="mb-3 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base font-medium outline-none focus:border-[var(--kahoot-purple)]"
              autoFocus
            />

            <div className="mb-5 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTopic(s)}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 hover:border-[var(--kahoot-purple)] hover:text-[var(--kahoot-purple)]"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mb-5 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                  Questions
                </label>
                <div className="flex gap-2">
                  {COUNTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(n)}
                      className={`flex-1 rounded-lg py-2 text-sm font-bold ${
                        count === n
                          ? "bg-[var(--kahoot-purple)] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                  Difficulty
                </label>
                <div className="flex flex-col gap-1">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`rounded-lg py-1.5 text-sm font-bold ${
                        difficulty === d
                          ? "bg-[var(--kahoot-purple)] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <p className="mb-4 text-center text-sm font-semibold text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full rounded-full bg-[var(--kahoot-purple)] py-3.5 text-lg font-extrabold text-white disabled:opacity-50"
            >
              {loading ? "Generating quiz…" : "Generate & play"}
            </button>
          </form>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
