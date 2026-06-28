import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** GET /api/progression/hall-of-fame */
export async function GET() {
  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json({
      entries: [
        {
          id: 1,
          entryKind: "season_champion",
          title: "Season 1 Champion",
          username: "Coming soon",
          emoji: "🏆",
          detail: "Be the first champion!",
          inductedAt: new Date().toISOString(),
        },
      ],
    });
  }

  const { data } = await sb
    .from("hall_of_fame")
    .select("*")
    .order("inducted_at", { ascending: false })
    .limit(50);

  return NextResponse.json({
    entries: (data ?? []).map((row) => ({
      id: row.id,
      entryKind: row.entry_kind,
      title: row.title,
      username: row.username,
      userId: row.user_id,
      countryCode: row.country_code,
      seasonNumber: row.season_number,
      emoji: row.emoji,
      detail: row.detail,
      inductedAt: row.inducted_at,
    })),
  });
}
