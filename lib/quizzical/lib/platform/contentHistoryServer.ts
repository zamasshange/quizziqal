import { getSupabaseAdmin } from "@/lib/supabase";
import {
  CONTENT_HISTORY_DAYS,
  normalizeContentId,
  type ContentExclusions,
  type ContentHistoryRow,
  type ContentType,
} from "./contentHistory";

const cutoffSql = () => {
  const d = new Date();
  d.setDate(d.getDate() - CONTENT_HISTORY_DAYS);
  return d.toISOString();
};

export async function fetchUserContentHistory(
  userId: string,
  opts?: { contentType?: string; category?: string; limit?: number },
): Promise<ContentHistoryRow[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  let q = sb
    .from("user_content_history")
    .select("content_id, content_type, category, played_at")
    .eq("user_id", userId)
    .gte("played_at", cutoffSql())
    .order("played_at", { ascending: false })
    .limit(opts?.limit ?? 500);

  if (opts?.contentType) q = q.eq("content_type", opts.contentType);
  if (opts?.category) q = q.eq("category", opts.category);

  const { data } = await q;
  return (data ?? []) as ContentHistoryRow[];
}

export async function buildContentExclusions(
  userId: string,
  contentType?: string,
): Promise<ContentExclusions> {
  const rows = await fetchUserContentHistory(userId, { contentType });
  const contentIds = rows.map((r) => normalizeContentId(r.content_id));
  return {
    contentIds: [...new Set(contentIds)],
    answers: [...new Set(contentIds)],
    images: [],
  };
}

export async function recordContentPlays(
  userId: string,
  items: {
    contentId: string;
    contentType: ContentType | string;
    category?: string;
  }[],
): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb || items.length === 0) return;

  const rows = items
    .map((i) => ({
      user_id: userId,
      content_id: normalizeContentId(i.contentId),
      content_type: i.contentType,
      category: i.category ?? null,
      played_at: new Date().toISOString(),
    }))
    .filter((r) => r.content_id.length > 0);

  if (rows.length === 0) return;

  await sb.from("user_content_history").upsert(rows, {
    onConflict: "user_id,content_id,content_type",
  });
}

export function recentIdSet(rows: ContentHistoryRow[]): Set<string> {
  return new Set(rows.map((r) => normalizeContentId(r.content_id)));
}
