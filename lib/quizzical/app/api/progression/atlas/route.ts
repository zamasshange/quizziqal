import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { loadUserProgress } from "@/lib/progression/server";
import { buildFullProgressionState } from "@/lib/progression/buildState";
import { getDefaultProgressionState } from "@/lib/progression/engine";
import { loadRawState } from "@/lib/progression/engine";

/** GET /api/progression/atlas — full atlas progress */
export async function GET() {
  const { userId } = await auth();

  const state = userId
    ? buildFullProgressionState(await loadUserProgress(userId))
    : buildFullProgressionState(loadRawState());

  if (!userId) {
    const guest = getDefaultProgressionState();
    return NextResponse.json({
      atlas: guest.atlas,
      legend: guest.legend,
      unlocks: guest.unlocks?.filter((u) => u.kind === "discovery") ?? [],
    });
  }

  return NextResponse.json({
    atlas: state.atlas,
    legend: state.legend,
    unlocks: state.unlocks?.filter((u) => u.kind === "discovery") ?? [],
    discoveryMilestones: state.discoveryMilestones,
  });
}
