import { NextRequest, NextResponse } from "next/server";
import { resolveQuizTemplate } from "@/lib/resolveQuiz";

type RouteContext = { params: Promise<{ quizId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { quizId } = await context.params;
  const quiz = resolveQuizTemplate(quizId);

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  return NextResponse.json({ quiz });
}
