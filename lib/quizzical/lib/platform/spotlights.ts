import { getSupabaseAdmin } from "@/lib/supabase";
import { CLERK_USER_ID_FILTER } from "@/lib/progression/clerkUserId";
import { levelFromXp } from "@/lib/progression/xp";

export type Spotlight = {
  id: string;
  title: string;
  username: string;
  avatarId: string | null;
  countryCode: string;
  detail: string;
  emoji: string;
};

export async function computeSpotlights(): Promise<Spotlight[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const sinceDay = new Date();
  sinceDay.setHours(0, 0, 0, 0);

  const sinceWeek = new Date();
  sinceWeek.setDate(sinceWeek.getDate() - 7);

  const [topXp, weekEvents, todayEvents] = await Promise.all([
    sb
      .from("user_progress")
      .select("username, avatar_id, country_code, xp")
      .like("user_id", CLERK_USER_ID_FILTER)
      .gt("xp", 0)
      .order("xp", { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb
      .from("user_xp_events")
      .select("user_id, xp_amount, category, created_at")
      .like("user_id", CLERK_USER_ID_FILTER)
      .gte("created_at", sinceWeek.toISOString()),
    sb
      .from("user_xp_events")
      .select("user_id, xp_amount")
      .like("user_id", CLERK_USER_ID_FILTER)
      .gte("created_at", sinceDay.toISOString()),
  ]);

  const dayTotals = new Map<string, number>();
  for (const e of todayEvents.data ?? []) {
    const uid = e.user_id as string;
    dayTotals.set(uid, (dayTotals.get(uid) ?? 0) + (e.xp_amount as number));
  }
  let playerOfDayId: string | null = null;
  let playerOfDayXp = 0;
  for (const [uid, xp] of dayTotals) {
    if (xp > playerOfDayXp) {
      playerOfDayXp = xp;
      playerOfDayId = uid;
    }
  }

  const weekTotals = new Map<string, { xp: number; categories: Map<string, number> }>();
  for (const e of weekEvents.data ?? []) {
    const uid = e.user_id as string;
    const cur = weekTotals.get(uid) ?? { xp: 0, categories: new Map() };
    cur.xp += e.xp_amount as number;
    const cat = (e.category as string) ?? "general";
    cur.categories.set(cat, (cur.categories.get(cat) ?? 0) + (e.xp_amount as number));
    weekTotals.set(uid, cur);
  }

  let fastestRiserId: string | null = null;
  let fastestRiserXp = 0;
  for (const [uid, v] of weekTotals) {
    if (v.xp > fastestRiserXp) {
      fastestRiserXp = v.xp;
      fastestRiserId = uid;
    }
  }

  let sportsExpertId: string | null = null;
  let sportsXp = 0;
  let geoExpertId: string | null = null;
  let geoXp = 0;
  let movieExpertId: string | null = null;
  let movieXp = 0;

  for (const [uid, v] of weekTotals) {
    const s =
      (v.categories.get("sports") ?? 0) +
      (v.categories.get("entertainment") ?? 0);
    const g = v.categories.get("geography") ?? 0;
    const m =
      (v.categories.get("entertainment") ?? 0) +
      (v.categories.get("movies") ?? 0);
    if (s > sportsXp) {
      sportsXp = s;
      sportsExpertId = uid;
    }
    if (g > geoXp) {
      geoXp = g;
      geoExpertId = uid;
    }
    if (m > movieXp) {
      movieXp = m;
      movieExpertId = uid;
    }
  }

  const ids = [
    fastestRiserId,
    sportsExpertId,
    geoExpertId,
    movieExpertId,
    playerOfDayId,
  ].filter(Boolean) as string[];

  const userIds = [...new Set(ids)];
  const { data: users } = await sb
    .from("user_progress")
    .select("user_id, username, avatar_id, country_code, xp")
    .like("user_id", CLERK_USER_ID_FILTER)
    .in("user_id", userIds.length ? userIds : ["__none__"]);

  const userMap = new Map((users ?? []).map((u) => [u.user_id, u]));

  const spotlights: Spotlight[] = [];

  if (topXp.data) {
    const xp = topXp.data.xp as number;
    spotlights.push({
      id: "top-explorer",
      title: "Top Explorer",
      username: topXp.data.username as string,
      avatarId: (topXp.data.avatar_id as string) ?? null,
      countryCode: (topXp.data.country_code as string) ?? "ZA",
      detail: `${xp.toLocaleString()} XP · Lv.${levelFromXp(xp)}`,
      emoji: "🧭",
    });
  }

  if (fastestRiserId && userMap.get(fastestRiserId)) {
    const u = userMap.get(fastestRiserId)!;
    spotlights.push({
      id: "rising",
      title: "Fastest Rising",
      username: u.username as string,
      avatarId: (u.avatar_id as string) ?? null,
      countryCode: (u.country_code as string) ?? "ZA",
      detail: `+${fastestRiserXp.toLocaleString()} XP this week`,
      emoji: "📈",
    });
  }

  if (playerOfDayId && userMap.get(playerOfDayId)) {
    const u = userMap.get(playerOfDayId)!;
    spotlights.unshift({
      id: "player-of-day",
      title: "Player of the Day",
      username: u.username as string,
      avatarId: (u.avatar_id as string) ?? null,
      countryCode: (u.country_code as string) ?? "ZA",
      detail: `+${playerOfDayXp.toLocaleString()} XP today`,
      emoji: "⭐",
    });
  }

  const addExpert = (
    id: string,
    title: string,
    emoji: string,
    uid: string | null,
    xpVal: number,
  ) => {
    if (!uid || xpVal < 50) return;
    const u = userMap.get(uid);
    if (!u) return;
    spotlights.push({
      id,
      title,
      username: u.username as string,
      avatarId: (u.avatar_id as string) ?? null,
      countryCode: (u.country_code as string) ?? "ZA",
      detail: `+${xpVal.toLocaleString()} XP this week`,
      emoji,
    });
  };

  addExpert("sports-expert", "Top Sports Expert", "⚽", sportsExpertId, sportsXp);
  addExpert("geo-expert", "Top Geography Expert", "🌍", geoExpertId, geoXp);
  addExpert("movie-expert", "Top Movie Expert", "🎬", movieExpertId, movieXp);

  if (topXp.data) {
    const xp = topXp.data.xp as number;
    if (xp >= 5000) {
      spotlights.push({
        id: "legend",
        title: "Knowledge Legend",
        username: topXp.data.username as string,
        avatarId: (topXp.data.avatar_id as string) ?? null,
        countryCode: (topXp.data.country_code as string) ?? "ZA",
        detail: "Elite global explorer",
        emoji: "👑",
      });
    }
  }

  return spotlights.slice(0, 6);
}
