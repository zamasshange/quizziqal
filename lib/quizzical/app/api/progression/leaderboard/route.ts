import { NextResponse } from "next/server";
import { CLERK_USER_ID_FILTER } from "@/lib/progression/clerkUserId";
import { DEFAULT_COUNTRY } from "@/lib/progression/countries";
import {
  rowToLeaderboardEntry,
  type LeaderboardScope,
} from "@/lib/progression/leaderboard";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

/** GET /api/progression/leaderboard?scope=global|country|weekly|monthly|category&country=ZA&category=geography */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = (searchParams.get("scope") ?? "global") as LeaderboardScope;
  const country = searchParams.get("country");
  const category = searchParams.get("category");
  const limit = Math.min(Number(searchParams.get("limit") ?? 25), 50);

  const sb = getSupabaseAdmin();
  if (!isSupabaseConfigured() || !sb) {
    return NextResponse.json({ entries: [], source: "none" });
  }

  if (scope === "weekly") {
    const { data, error } = await sb
      .from("user_progress")
      .select("username, avatar_id, xp, country_code, weekly_xp")
      .like("user_id", CLERK_USER_ID_FILTER)
      .gt("weekly_xp", 0)
      .order("weekly_xp", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[leaderboard] weekly query failed:", error.message);
      return NextResponse.json({ entries: [], source: "error" });
    }

    const entries = (data ?? []).map((row, i) =>
      rowToLeaderboardEntry(
        {
          username: row.username as string,
          avatar_id: (row.avatar_id as string) ?? null,
          xp: row.xp as number,
          country_code: row.country_code as string,
        },
        i + 1,
        row.weekly_xp as number,
      ),
    );

    return NextResponse.json({ entries, source: "supabase", scope });
  }

  if (scope === "monthly" || scope === "category") {
    const days = 30;

    let eventsQuery = sb
      .from("user_xp_events")
      .select("user_id, xp_amount, category")
      .like("user_id", CLERK_USER_ID_FILTER)
      .gte(
        "created_at",
        new Date(Date.now() - days * 86400000).toISOString(),
      );

    if (scope === "category" && category) {
      eventsQuery = eventsQuery.eq("category", category);
    }

    const { data: events } = await eventsQuery;

    const totals = new Map<string, number>();
    for (const e of events ?? []) {
      totals.set(e.user_id, (totals.get(e.user_id) ?? 0) + e.xp_amount);
    }

    const sorted = [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const userIds = sorted.map(([id]) => id);
    const { data: users } = await sb
      .from("user_progress")
      .select("user_id, username, avatar_id, country_code, xp")
      .like("user_id", CLERK_USER_ID_FILTER)
      .in("user_id", userIds.length ? userIds : ["__none__"]);

    const userMap = new Map((users ?? []).map((u) => [u.user_id, u]));

    const entries = sorted.map(([userId, xpSum], i) => {
      const u = userMap.get(userId);
      return rowToLeaderboardEntry(
        {
          username: u?.username ?? "Explorer",
          avatar_id: (u?.avatar_id as string) ?? null,
          xp: (u?.xp as number) ?? 0,
          country_code: (u?.country_code as string) ?? DEFAULT_COUNTRY,
        },
        i + 1,
        xpSum,
      );
    });

    return NextResponse.json({ entries, source: "supabase", scope });
  }

  let query = sb
    .from("user_progress")
    .select("username, avatar_id, xp, country_code")
    .like("user_id", CLERK_USER_ID_FILTER)
    .order("xp", { ascending: false })
    .limit(limit);

  if (scope === "country" && country) {
    query = query.eq("country_code", country);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[leaderboard] global query failed:", error.message);
    return NextResponse.json({ entries: [], source: "error" });
  }

  const entries = (data ?? []).map((row, i) =>
    rowToLeaderboardEntry(
      {
        username: row.username as string,
        avatar_id: (row.avatar_id as string) ?? null,
        xp: row.xp as number,
        country_code: row.country_code as string,
      },
      i + 1,
    ),
  );

  return NextResponse.json({ entries, source: "supabase", scope });
}
