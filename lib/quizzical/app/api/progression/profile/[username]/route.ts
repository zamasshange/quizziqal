import { NextResponse } from "next/server";
import { getCountry } from "@/lib/progression/countries";
import { levelFromXp, globalTitle } from "@/lib/progression/xp";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

type RouteParams = { params: Promise<{ username: string }> };

/** GET /api/progression/profile/[username] — public profile by username */
export async function GET(_req: Request, { params }: RouteParams) {
  const { username } = await params;
  const normalized = username.trim().toLowerCase();
  if (!normalized) {
    return NextResponse.json({ error: "Invalid username." }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  if (!isSupabaseConfigured() || !sb) {
    return NextResponse.json({ error: "Unavailable." }, { status: 503 });
  }

  const { data: row, error } = await sb
    .from("user_progress")
    .select(
      "username, avatar_id, xp, coins, level, country_code, current_streak, achievements_count, discoveries_count, unlocked_achievements, unlocked_badges",
    )
    .ilike("username", normalized)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: "Player not found." }, { status: 404 });
  }

  const xp = row.xp as number;
  const level = (row.level as number) ?? levelFromXp(xp);
  const countryCode = row.country_code as string;

  return NextResponse.json({
    username: row.username as string,
    avatarId: (row.avatar_id as string) ?? null,
    xp,
    coins: row.coins as number,
    level,
    title: globalTitle(level),
    countryCode,
    countryName: getCountry(countryCode)?.name ?? countryCode,
    streak: row.current_streak as number,
    achievementsCount: row.achievements_count as number,
    discoveriesCount: row.discoveries_count as number,
    unlockedAchievements: (row.unlocked_achievements as string[]) ?? [],
    unlockedBadges: (row.unlocked_badges as string[]) ?? [],
  });
}
