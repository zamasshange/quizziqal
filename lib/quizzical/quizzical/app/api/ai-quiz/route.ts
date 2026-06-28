import { NextResponse } from "next/server";
import { generateAiQuiz } from "@/lib/aiQuiz";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { topic?: unknown; count?: unknown; difficulty?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  if (!topic) {
    return NextResponse.json({ error: "Please enter a topic." }, { status: 400 });
  }
  if (topic.length > 120) {
    return NextResponse.json({ error: "That topic is too long." }, { status: 400 });
  }

  const count =
    typeof body.count === "number" && Number.isFinite(body.count)
      ? body.count
      : 5;
  const difficulty =
    typeof body.difficulty === "string" &&
    ["Easy", "Medium", "Hard"].includes(body.difficulty)
      ? body.difficulty
      : "Medium";

  const result = await generateAiQuiz(topic, count, difficulty);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ quiz: result.quiz });
}
