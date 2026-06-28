import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { KINGDOMS } from "@/lib/progression/kingdoms";
import {
  loadUserProgress,
  persistProgress,
} from "@/lib/progression/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/** GET /api/progression/kingdoms */
export async function GET() {
  return NextResponse.json({ kingdoms: KINGDOMS });
}

/** POST /api/progression/kingdoms — join a kingdom */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await req.json()) as { kingdomId?: string };
  const kingdom = KINGDOMS.find((k) => k.id === body.kingdomId);
  if (!kingdom) {
    return NextResponse.json({ error: "Unknown kingdom." }, { status: 400 });
  }

  const raw = await loadUserProgress(userId);
  raw.kingdomId = kingdom.id;

  const sb = getSupabaseAdmin();
  if (sb) {
    await sb.from("kingdom_members").upsert(
      { user_id: userId, kingdom_id: kingdom.id },
      { onConflict: "user_id" },
    );
  }

  await persistProgress(userId, "Player", null, raw, 0, "kingdom_join");

  return NextResponse.json({ kingdom });
}
