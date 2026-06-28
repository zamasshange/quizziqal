"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SoloQuizPlayer from "@/components/game/SoloQuizPlayer";
import type { Quiz } from "@/lib/types";

export default function PlayGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/games/${gameId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => setQuiz(data.quiz))
      .catch(() => setError("Game not found"));
  }, [gameId]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--kahoot-purple)] p-6">
        <div className="text-center text-white">
          <h1 className="text-xl font-bold">{error}</h1>
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

  return <SoloQuizPlayer gameId={gameId} templateQuiz={quiz} />;
}
