import { NextResponse } from "next/server";
import { listImageQuestions } from "@/lib/imageQuestionsStore";

// Admin read endpoint for the dashboard list view.
// GET /api/image-questions?category=Celebrity&difficulty=Easy&search=...
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const difficulty = searchParams.get("difficulty") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const questions = await listImageQuestions({ category, difficulty, search });
  return NextResponse.json({ questions });
}
