import { NextRequest, NextResponse } from "next/server";
import { buildQuizForRound } from "@/lib/prepareGame";
import { resolveQuizTemplate } from "@/lib/resolveQuiz";
import { registerQuiz } from "@/lib/quizRegistry";
import type { Quiz } from "@/lib/types";
import type { Difficulty, QuestionCount, TimerSeconds } from "@/lib/roundSettings";
import { QUESTION_COUNT_OPTIONS, DIFFICULTIES, TIMER_OPTIONS } from "@/lib/roundSettings";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const body = await request.json();
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

  let template: Quiz | null = null;

  if (body.template?.id && body.template?.title) {
    template = body.template as Quiz;
  } else if (body.quizId) {
    template = resolveQuizTemplate(body.quizId);
  }

  if (!template) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  try {
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
    return NextResponse.json({ quiz });
  } catch (err) {
    console.error("[quiz/prepare]", err);
    const message =
      err instanceof Error ? err.message : "Could not prepare quiz. Try again.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
