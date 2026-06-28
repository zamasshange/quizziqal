import { getSupabaseAdmin } from "@/lib/supabase";
import { createEmptyRaw } from "./defaults";
import { DEFAULT_COUNTRY } from "./countries";
import { levelFromXp } from "./xp";
import { weekStartKey } from "./weekly";

/** Create or refresh a user_progress row for a Clerk user. */
export async function ensureUserProfile(
  clerkUserId: string,
  username: string,
  avatarId: string | null = null,
  countryCode = DEFAULT_COUNTRY,
): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) return;

  const { data: existing } = await sb
    .from("user_progress")
    .select("user_id")
    .eq("user_id", clerkUserId)
    .maybeSingle();

  if (existing) return;

  const raw = createEmptyRaw(countryCode);
  await sb.from("user_progress").insert({
    user_id: clerkUserId,
    username,
    avatar_id: avatarId,
    xp: raw.xp,
    coins: raw.coins,
    level: levelFromXp(raw.xp),
    weekly_xp: 0,
    week_started_at: weekStartKey(),
    current_streak: raw.currentStreak,
    longest_streak: raw.longestStreak,
    country_code: raw.countryCode,
    achievements_count: 0,
    discoveries_count: 0,
    mastery: raw.mastery,
    unlocked_achievements: raw.unlockedAchievements,
    unlocked_badges: raw.unlockedBadges,
    missions: raw.missions,
    mission_date: raw.missionDate,
    stats: raw.stats,
    first_quiz_today: raw.firstQuizToday,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}
