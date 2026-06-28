import { NextRequest, NextResponse } from "next/server";
import { getGame, beginPlay, submitAnswer, advanceGame } from "@/lib/gameStore";
import { getQuizById } from "@/lib/quizRegistry";

type RouteContext = { params: Promise<{ gameId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { gameId } = await context.params;
  const session = getGame(gameId);

  if (!session) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const quiz = getQuizById(session.quizId);
  return NextResponse.json({ session, quiz });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { gameId } = await context.params;
  const body = await request.json();
  const { action } = body;

  switch (action) {
    case "begin": {
      const result = beginPlay(gameId, body.nickname);
      if (!result) {
        return NextResponse.json({ error: "Cannot start game" }, { status: 400 });
      }
      const quiz = getQuizById(result.session.quizId);
      return NextResponse.json({
        player: result.player,
        session: result.session,
        quiz,
      });
    }

    case "answer": {
      const session = submitAnswer(gameId, body.playerId, body.answerIndex);
      if (!session) {
        return NextResponse.json({ error: "Cannot submit answer" }, { status: 400 });
      }
      const quiz = getQuizById(session.quizId);
      return NextResponse.json({ session, quiz });
    }

    case "advance": {
      const session = advanceGame(gameId);
      if (!session) {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
      }
      const quiz = getQuizById(session.quizId);
      return NextResponse.json({ session, quiz });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
