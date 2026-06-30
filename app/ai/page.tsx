"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SonkeAppShell from "@/components/skin/SonkeAppShell";
import { ContentModule, SectionHeading } from "@/components/skin/content";

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
    <SonkeAppShell pageTitle="AI Quiz" searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <ContentModule className="sonke-game-hero-module">
        <div className="sonke-game-hero-copy">
          <p className="sonke-game-badge">Powered by AI</p>
          <h1 className="sonke-game-title">Create a quiz on anything</h1>
          <p className="sonke-game-tagline">
            Type any topic and we&apos;ll build a fresh multiple-choice quiz for you to play instantly.
          </p>
        </div>
      </ContentModule>

      <ContentModule panel>
        <form onSubmit={generate}>
          <label className="sonke-section-title" style={{ fontSize: "1.1rem" }}>
            Topic
          </label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. The Roman Empire, K-pop, the human body…"
            maxLength={120}
            className="sonke-search-input"
            autoFocus
          />

          <SectionHeading>Suggestions</SectionHeading>
          <nav className="sonke-category-nav">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTopic(s)}
                className="sonke-category-pill"
              >
                {s}
              </button>
            ))}
          </nav>

          <div className="sonke-game-columns" style={{ marginTop: "1rem" }}>
            <div>
              <p className="sonke-subsection-title">Questions</p>
              <div className="sonke-category-nav">
                {COUNTS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={count === n ? "sonke-category-pill active" : "sonke-category-pill"}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="sonke-subsection-title">Difficulty</p>
              <div className="sonke-category-nav">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={difficulty === d ? "sonke-category-pill active" : "sonke-category-pill"}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="sonke-badge-note" style={{ color: "#e5296b" }}>
              {error}
            </p>
          )}

          <div className="sonke-play-actions" style={{ marginTop: "1rem" }}>
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="sonke-btn sonke-btn-play"
            >
              {loading ? "Generating quiz…" : "Generate & play"}
            </button>
          </div>
        </form>
      </ContentModule>
    </SonkeAppShell>
  );
}
