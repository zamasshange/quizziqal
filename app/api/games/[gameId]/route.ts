import { NextRequest, NextResponse } from "next/server";
import { getGame, beginPlay } from "@/lib/gameStore";
import { getQuizById, registerQuiz } from "@/lib/quizRegistry";
import { buildQuizForRound } from "@/lib/prepareGame";
import type { Difficulty, QuestionCount, TimerSeconds } from "@/lib/roundSettings";
import { QUESTION_COUNT_OPTIONS, DIFFICULTIES, TIMER_OPTIONS } from "@/lib/roundSettings";

type RouteContext = { params: Promise<{ gameId: string }> };

export const maxDuration = 60;

export async function GET(_request: NextRequest, context: RouteContext) {
  const { gameId } = await context.params;
  const session = getGame(gameId);

  if (!session) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const quiz = getQuizById(session.quizId);
  return NextResponse.json({ session, quiz });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { gameId } = await context.params;
  const body = await request.json();
  const { action } = body;

  if (action === "prepare") {
    const session = getGame(gameId);
    if (!session) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const template = getQuizById(session.quizId);
    if (!template) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const settings = body.settings ?? {};
    const count = QUESTION_COUNT_OPTIONS.includes(settings.count)
      ? (settings.count as QuestionCount)
      : 10;
    const difficulty = DIFFICULTIES.includes(settings.difficulty)
      ? (settings.difficulty as Difficulty)
      : "Medium";
    const timerSeconds = TIMER_OPTIONS.includes(settings.timerSeconds)
      ? (settings.timerSeconds as TimerSeconds)
      : 20;

    try {
      session.phase = "lobby";

      const quiz = await buildQuizForRound(template, {
        count,
        difficulty,
        timerSeconds,
      });

      if (!quiz.questions.length) {
        return NextResponse.json(
          { error: "No questions could be generated. Try fewer questions or Easy mode." },
          { status: 503 }
        );
      }

      registerQuiz(quiz);
      session.quizId = quiz.id;
      beginPlay(gameId, "Player");
      return NextResponse.json({ quiz, session });
    } catch (err) {
      console.error("[games/prepare]", err);
      const message =
        err instanceof Error ? err.message : "Could not prepare quiz. Try again.";
      return NextResponse.json({ error: message }, { status: 503 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
