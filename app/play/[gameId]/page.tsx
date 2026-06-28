"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SoloQuizPlayer from "@/components/game/SoloQuizPlayer";
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--kahoot-purple)] p-6">
        <div className="text-center text-white">
          <h1 className="text-xl font-bold">{error}</h1>
          <p className="mt-2 text-sm text-white/70">
            Try starting again from Discover.
          </p>
          <Link href="/discover" className="mt-4 inline-block underline">
            Back to Discover
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--kahoot-purple)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return <SoloQuizPlayer quizId={quizId} templateQuiz={quiz} />;
}
