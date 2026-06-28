import { NextResponse } from "next/server";
import {
  createImageQuestion,
  listImageQuestions,
} from "@/lib/imageQuestionsStore";
import {
  validateImageQuestionPayload,
  type NewImageQuestion,
} from "@/lib/imageQuestions";

// Admin endpoints — protected by Clerk via proxy.ts (/api/admin/*).
export const dynamic = "force-dynamic";

export async function GET() {
  const questions = await listImageQuestions();
  return NextResponse.json({ questions });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const error = validateImageQuestionPayload(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const payload: NewImageQuestion = {
    category: b.category as NewImageQuestion["category"],
    image_url: b.image_url as string,
    question:
      typeof b.question === "string" && b.question.trim()
        ? (b.question as string)
        : "Who is this?",
    correct_answer: b.correct_answer as string,
    wrong_answers: b.wrong_answers as string[],
    difficulty: b.difficulty as NewImageQuestion["difficulty"],
  };

  try {
    const created = await createImageQuestion(payload);
    return NextResponse.json({ question: created }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Create failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
