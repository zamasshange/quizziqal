import { getSupabaseAdmin } from "@/lib/supabase";

export type ActivityEvent = {
  id: number;
  userId: string;
  username: string;
  avatarId: string | null;
  countryCode: string;
  eventKind: string;
  message: string;
  emoji: string | null;
  category: string | null;
  createdAt: string;
};

export async function emitActivityEvent(input: {
  userId: string;
  username: string;
  avatarId?: string | null;
  countryCode?: string;
  eventKind: string;
  message: string;
  emoji?: string;
  category?: string;
}): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) return;

  await sb.from("activity_events").insert({
    user_id: input.userId,
    username: input.username,
    avatar_id: input.avatarId ?? null,
    country_code: input.countryCode ?? "ZA",
    event_kind: input.eventKind,
    message: input.message,
    emoji: input.emoji ?? null,
    category: input.category ?? null,
  });
}

export async function fetchActivityFeed(limit = 20): Promise<ActivityEvent[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const { data } = await sb
    .from("activity_events")
    .select(
      "id, user_id, username, avatar_id, country_code, event_kind, message, emoji, category, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id as number,
    userId: row.user_id as string,
    username: row.username as string,
    avatarId: (row.avatar_id as string) ?? null,
    countryCode: (row.country_code as string) ?? "ZA",
    eventKind: row.event_kind as string,
    message: row.message as string,
    emoji: (row.emoji as string) ?? null,
    category: (row.category as string) ?? null,
    createdAt: row.created_at as string,
  }));
}

export function activityFromProgression(input: {
  username: string;
  type: string;
  term?: string;
  quizCategory?: string;
  leveledUp?: boolean;
  newLevel?: number;
  newRank?: string;
  badgesUnlocked?: string[];
  unlocksEarned?: string[];
  missionsCompleted?: { label: string; emoji: string }[];
  discovery?: { term: string; isNew: boolean };
  becameLegend?: boolean;
  legendNumber?: number;
}): { message: string; emoji: string; eventKind: string } | null {
  if (input.becameLegend) {
    return {
      eventKind: "knowledge_legend",
      emoji: "👑",
      message: `${input.username} became Knowledge Legend #${input.legendNumber ?? "?"}`,
    };
  }
  if (input.leveledUp && input.newLevel) {
    return {
      eventKind: "level_up",
      emoji: "🔥",
      message: `${input.username} reached Level ${input.newLevel}`,
    };
  }
  if (input.discovery?.isNew && input.discovery.term) {
    return {
      eventKind: "discovery",
      emoji: "🔍",
      message: `${input.username} discovered ${input.discovery.term}`,
    };
  }
  if (input.missionsCompleted?.length) {
    const m = input.missionsCompleted[0];
    return {
      eventKind: "mission",
      emoji: m.emoji || "🎯",
      message: `${input.username} completed ${m.label}`,
    };
  }
  if (input.badgesUnlocked?.length) {
    return {
      eventKind: "badge",
      emoji: "🏅",
      message: `${input.username} earned a new badge`,
    };
  }
  if (input.type === "quiz_complete" && input.quizCategory) {
    const cat = input.quizCategory.replace(/-/g, " ");
    return {
      eventKind: "quiz_complete",
      emoji: "✅",
      message: `${input.username} finished a ${cat} quiz`,
    };
  }
  return null;
}
