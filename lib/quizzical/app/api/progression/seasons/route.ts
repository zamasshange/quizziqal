import { NextResponse } from "next/server";
import { DEFAULT_SEASON } from "@/lib/progression/seasons";
import { getSupabaseAdmin } from "@/lib/supabase";

/** GET /api/progression/seasons */
export async function GET() {
  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json({ season: DEFAULT_SEASON, champions: [] });
  }

  const { data: season } = await sb
    .from("knowledge_seasons")
    .select("*")
    .eq("is_active", true)
    .order("season_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: champions } = await sb
    .from("championship_results")
    .select("*")
    .order("crowned_at", { ascending: false })
    .limit(10);

  if (!season) {
    return NextResponse.json({ season: DEFAULT_SEASON, champions: champions ?? [] });
  }

  const endsAt = new Date(season.ends_at as string);
  const daysRemaining = Math.max(
    0,
    Math.ceil((endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  return NextResponse.json({
    season: {
      seasonNumber: season.season_number,
      title: season.title,
      daysRemaining,
      isActive: season.is_active,
      endsAt: season.ends_at,
    },
    champions: champions ?? [],
  });
}
