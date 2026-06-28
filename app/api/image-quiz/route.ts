import { NextResponse } from "next/server";
import {
  generateImageQuizBatch,
  isImageCategory,
  normalizeDifficulty,
} from "@/lib/quizzical/quizGenerator";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "";
  const count = Math.min(
    Math.max(parseInt(searchParams.get("count") ?? "10", 10) || 10, 1),
    30
  );
  const difficulty = normalizeDifficulty(searchParams.get("difficulty"));
  const fast = searchParams.get("fast") === "1";

  if (!isImageCategory(category)) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }

  const questions = await generateImageQuizBatch(
    category,
    count,
    difficulty,
    {},
    { fastStart: fast }
  );

  return NextResponse.json({ questions });
}
