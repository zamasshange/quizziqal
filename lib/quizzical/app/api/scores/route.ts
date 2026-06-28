import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export type ScorePayload = {
  gameKey: string;
  gameType: "text" | "image";
  quizId: string;
  title: string;
  score: number;
  correct: number;
  total: number;
};

/** Submit a completed game score (signed-in users; Supabase when configured). */
export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to save scores." }, { status: 401 });
  }

  let body: ScorePayload;
  try {
    body = (await req.json()) as ScorePayload;
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const meta = sessionClaims?.publicMetadata as
    | { username?: string; avatarId?: string }
    | undefined;
  const username =
    typeof meta?.username === "string" && meta.username
      ? meta.username
      : "Player";
  const avatarId =
    typeof meta?.avatarId === "string" ? meta.avatarId : null;

  const supabase = getSupabaseAdmin();
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const { error } = await supabase.from("quiz_scores").insert({
    user_id: userId,
    username,
    avatar_id: avatarId,
    game_key: body.gameKey,
    game_type: body.gameType,
    quiz_id: body.quizId,
    title: body.title,
    score: body.score,
    correct: body.correct,
    total: body.total,
  });

  if (error) {
    return NextResponse.json({ error: "Could not save score." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true });
}

/** Fetch leaderboard — global or per gameKey. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gameKey = searchParams.get("gameKey");
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

  const supabase = getSupabaseAdmin();
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ entries: [], source: "none" });
  }

  let query = supabase
    .from("quiz_scores")
    .select("username, avatar_id, game_key, title, score, correct, total, created_at")
    .order("score", { ascending: false })
    .limit(limit);

  if (gameKey) {
    query = query.eq("game_key", gameKey);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ entries: [], source: "error" });
  }

  return NextResponse.json({
    entries: data ?? [],
    source: "supabase",
  });
}
