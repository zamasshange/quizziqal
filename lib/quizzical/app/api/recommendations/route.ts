import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { toProgressionState } from "@/lib/progression/engine";
import { loadUserProgress } from "@/lib/progression/server";
import { fetchUserContentHistory } from "@/lib/platform/contentHistoryServer";
import { buildRecommendations } from "@/lib/platform/recommendations";

/** GET /api/recommendations */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ recommendations: [] });
  }

  const raw = await loadUserProgress(userId);
  const state = toProgressionState(raw);
  const history = await fetchUserContentHistory(userId);
  const recommendations = buildRecommendations(state, history);

  return NextResponse.json({ recommendations });
}
