import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  generateImageQuizBatch,
  isImageCategory,
  normalizeDifficulty,
} from "@/lib/quizGenerator";
import { buildContentExclusions } from "@/lib/platform/contentHistoryServer";
import { imageCategoryToContentType } from "@/lib/platform/contentHistory";

// Auto-generated image quiz feed for the games.
// GET /api/image-quiz?category=Celebrity&count=10&difficulty=Medium
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "";
  const count = Math.min(
    Math.max(parseInt(searchParams.get("count") ?? "10", 10) || 10, 1),
    30,
  );
  const difficulty = normalizeDifficulty(searchParams.get("difficulty"));
  const quick = searchParams.get("quick") === "1";
  const fast = searchParams.get("fast") === "1" || quick;
  const excludeAnswers = searchParams.getAll("excludeAnswer");
  const excludeImages = searchParams.getAll("excludeImage");

  if (!isImageCategory(category)) {
    return NextResponse.json(
      { error: "Unknown category." },
      { status: 400 },
    );
  }

  let serverAnswers: string[] = [];
  if (userId && !fast) {
    const contentType = imageCategoryToContentType(category);
    const exclusions = await buildContentExclusions(userId, contentType);
    serverAnswers = exclusions.answers;
  }

  const mergedAnswers = [
    ...new Set([
      ...excludeAnswers.map((a) => a.trim().toLowerCase()).filter(Boolean),
      ...serverAnswers,
    ]),
  ];

  const questions = await generateImageQuizBatch(category, count, difficulty, {
    answers: mergedAnswers,
    images: excludeImages,
  }, { cacheOnly: quick && !fast, fastStart: fast });
  return NextResponse.json({ questions });
}
