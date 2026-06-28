import { NextRequest, NextResponse } from "next/server";
import { createGame } from "@/lib/gameStore";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { quizId } = body;

  if (!quizId) {
    return NextResponse.json({ error: "Missing quizId" }, { status: 400 });
  }

  const session = createGame(quizId);
  if (!session) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  return NextResponse.json({ gameId: session.id, session });
}
