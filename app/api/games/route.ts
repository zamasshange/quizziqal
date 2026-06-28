import { NextRequest, NextResponse } from "next/server";
import {
  generateImageQuizBatch,
  isImageCategory,
  normalizeDifficulty,
} from "@/lib/quizzical/quizGenerator";
import { fromGeneratedQuestions } from "@/lib/quizzical/adapter";
import { getPictureGameModes } from "@/lib/quizRegistry";
import { createGame } from "@/lib/gameStore";
import { registerQuiz } from "@/lib/quizRegistry";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.generate) {
    const { category, count = 10, difficulty = "Medium" } = body.generate;

    if (!isImageCategory(category)) {
      return NextResponse.json({ error: "Unknown category" }, { status: 400 });
    }

    const questions = await generateImageQuizBatch(
      category,
      Math.min(Math.max(count, 1), 15),
      normalizeDifficulty(difficulty),
      {},
      { fastStart: true }
    );

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "Could not generate quiz. Try again." },
        { status: 503 }
      );
    }

    const mode = getPictureGameModes().find((m) => m.category === category);
    const quiz = fromGeneratedQuestions(
      mode?.title ?? `Guess the ${category}`,
      mode?.emoji ?? "🎮",
      mode?.color ?? "#46178f",
      category,
      questions
    );

    registerQuiz(quiz);
    const session = createGame(quiz.id);
    if (!session) {
      return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
    }

    return NextResponse.json({ gameId: session.id, session, quiz });
  }

  const { quizId } = body;
  if (!quizId) {
    return NextResponse.json({ error: "Missing quizId or generate" }, { status: 400 });
  }

  const session = createGame(quizId);
  if (!session) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  return NextResponse.json({ gameId: session.id, session });
}
