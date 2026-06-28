import { NextRequest, NextResponse } from "next/server";
import {
  generateImageQuizBatch,
  isImageCategory,
  normalizeDifficulty,
} from "@/lib/quizzical/quizGenerator";
import { generateFlagQuestions, isFlagsQuiz } from "@/lib/quizzical/flagQuiz";
import { generateAiQuiz } from "@/lib/quizzical/aiQuiz";
import {
  fromGeneratedQuestions,
  fromQuizzicalQuiz,
  fromAiQuiz,
} from "@/lib/engine/adapter";
import { getPictureGameModes, registerQuiz } from "@/lib/quizRegistry";
import { createGame } from "@/lib/gameStore";
import { getQuizzicalQuizRaw } from "@/lib/quizRegistry";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.ai) {
    const { topic, count = 5, difficulty = "Medium" } = body.ai;
    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    const result = await generateAiQuiz(topic.trim(), count, difficulty);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    const quiz = fromAiQuiz(result.quiz);
    registerQuiz(quiz);
    const session = createGame(quiz.id);
    if (!session) {
      return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
    }
    return NextResponse.json({ gameId: session.id, session, quiz });
  }

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

  const rawId = quizId.startsWith("qc-") ? quizId.slice(3) : quizId;
  if (isFlagsQuiz(rawId)) {
    const raw = getQuizzicalQuizRaw(quizId);
    if (!raw) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    const quiz = fromQuizzicalQuiz({
      ...raw,
      id: `flags-${Date.now()}`,
      questions: generateFlagQuestions(10),
    });
    registerQuiz(quiz);
    const session = createGame(quiz.id);
    if (!session) {
      return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
    }
    return NextResponse.json({ gameId: session.id, session, quiz });
  }

  const session = createGame(quizId);
  if (!session) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  return NextResponse.json({ gameId: session.id, session });
}
