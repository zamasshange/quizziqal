import { NextResponse } from "next/server";
import {
  generateImageQuizBatch,
  isImageCategory,
  normalizeDifficulty,
} from "@/lib/quizGenerator";

// Auto-generated image quiz feed for the games.
// GET /api/image-quiz?category=Celebrity&count=10&difficulty=Medium
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "";
  const count = Math.min(
    Math.max(parseInt(searchParams.get("count") ?? "10", 10) || 10, 1),
    12,
  );
  const difficulty = normalizeDifficulty(searchParams.get("difficulty"));
  const excludeAnswers = searchParams.getAll("excludeAnswer");
  const excludeImages = searchParams.getAll("excludeImage");

  if (!isImageCategory(category)) {
    return NextResponse.json(
      { error: "Unknown category." },
      { status: 400 },
    );
  }

  const questions = await generateImageQuizBatch(category, count, difficulty, {
    answers: excludeAnswers,
    images: excludeImages,
  });
  return NextResponse.json({ questions });
}
