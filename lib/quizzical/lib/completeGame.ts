"use client";

import type { GameHistoryEntry } from "@/lib/gameProgress";
import {
  addLocalLeaderboardScore,
  recordGameComplete,
  type GameType,
} from "@/lib/gameProgress";
import { useUser } from "@clerk/nextjs";

type CompleteGameInput = {
  gameKey: string;
  gameType: GameType;
  quizId: string;
  title: string;
  emoji: string;
  href: string;
  score: number;
  correct: number;
  total: number;
  quizCategory?: string;
  difficulty?: string;
};

export async function completeGameAndSubmit(
  input: CompleteGameInput,
  username: string,
): Promise<void> {
  const completedAt = Date.now();

  recordGameComplete({
    gameKey: input.gameKey,
    gameType: input.gameType,
    quizId: input.quizId,
    title: input.title,
    emoji: input.emoji,
    href: input.href,
    score: input.score,
    correct: input.correct,
    total: input.total,
    completedAt,
  });

  addLocalLeaderboardScore({
    gameKey: input.gameKey,
    title: input.title,
    emoji: input.emoji,
    score: input.score,
    correct: input.correct,
    total: input.total,
    username,
    completedAt,
  });

  try {
    await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameKey: input.gameKey,
        gameType: input.gameType,
        quizId: input.quizId,
        title: input.title,
        score: input.score,
        correct: input.correct,
        total: input.total,
      }),
    });
  } catch {
    /* offline — local scores still work */
  }

  try {
    const { recordProgressionEvent } = await import("@/lib/progression/client");
    await recordProgressionEvent({
      type: "quiz_complete",
      quizId: input.quizId,
      quizCategory: input.quizCategory,
      difficulty: input.difficulty,
      correct: input.correct,
      total: input.total,
    });
  } catch {
    /* progression optional */
  }
}

export function useCompleteGame() {
  const { user, isSignedIn } = useUser();
  const username =
    (user?.publicMetadata?.username as string | undefined) ??
    user?.username ??
    "Guest";

  return (input: CompleteGameInput) =>
    completeGameAndSubmit(input, isSignedIn ? username : "Guest");
}

export function formatHistoryDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export type { GameHistoryEntry };
