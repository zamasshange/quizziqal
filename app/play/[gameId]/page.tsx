"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SoloQuizPlayer from "@/components/game/SoloQuizPlayer";
import { ContentModule } from "@/components/skin/content";
import type { Quiz } from "@/lib/types";

const SESSION_KEY = (id: string) => `quizziqal:quiz:${id}`;

export default function PlayGamePage() {
  const params = useParams();
  const quizId = params.gameId as string;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const cached =
          typeof window !== "undefined"
            ? sessionStorage.getItem(SESSION_KEY(quizId))
            : null;

        if (cached) {
          const parsed = JSON.parse(cached) as Quiz;
          if (!cancelled) setQuiz(parsed);
          return;
        }

        const res = await fetch(`/api/quiz/${encodeURIComponent(quizId)}`);
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        if (!cancelled) setQuiz(data.quiz);
      } catch {
        if (!cancelled) setError("Game not found");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  if (error) {
    return (
      <div className="sonke-pbs-shell flex min-h-screen items-center justify-center p-6">
        <ContentModule panel className="text-center">
          <h1 className="sonke-game-title" style={{ fontSize: "1.5rem" }}>{error}</h1>
          <p className="sonke-game-tagline">Try starting again from Discover.</p>
          <Link href="/discover" className="sonke-btn sonke-btn-play mt-4 inline-flex">
            Back to Discover
          </Link>
        </ContentModule>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="sonke-play-page flex min-h-screen items-center justify-center" style={{ background: "linear-gradient(180deg, #2638c4 0%, #99cf16 100%)" }}>
        <div className="sonke-play-start-btn animate-pulse">Loading…</div>
      </div>
    );
  }

  return <SoloQuizPlayer quizId={quizId} templateQuiz={quiz} />;
}
