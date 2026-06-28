/** Content play history — avoid repeating entities for 30 days. */

export type ContentType =
  | "celebrity"
  | "athlete"
  | "football"
  | "basketball"
  | "cricket"
  | "movie"
  | "music"
  | "country"
  | "landmark"
  | "figure"
  | "question"
  | "general";

export type ContentHistoryRow = {
  content_id: string;
  content_type: ContentType | string;
  category?: string | null;
  played_at: string;
};

export type ContentExclusions = {
  contentIds: string[];
  answers: string[];
  images: string[];
};

export const CONTENT_HISTORY_DAYS = 30;

export function normalizeContentId(value: string): string {
  return value.trim().toLowerCase();
}

export function imageCategoryToContentType(category: string): ContentType {
  const map: Record<string, ContentType> = {
    Celebrity: "celebrity",
    Athlete: "athlete",
    Football: "football",
    Basketball: "basketball",
    Cricket: "cricket",
    Movie: "movie",
    Music: "music",
  };
  return map[category] ?? "general";
}

/** Score unseen pool entries higher (0–1). Lower score = prefer. */
export function diversityScore(
  contentId: string,
  recentIds: Set<string>,
  playedAt?: Date,
): number {
  const id = normalizeContentId(contentId);
  if (recentIds.has(id)) return 1;
  if (!playedAt) return 0;
  const ageDays =
    (Date.now() - playedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays < CONTENT_HISTORY_DAYS) return 0.85;
  if (ageDays < CONTENT_HISTORY_DAYS * 2) return 0.4;
  return 0.1;
}

export function pickMostDiverse<T extends { label: string }>(
  entries: T[],
  recentIds: Set<string>,
): T | null {
  if (entries.length === 0) return null;
  const scored = entries.map((e) => ({
    e,
    score: diversityScore(e.label, recentIds) + Math.random() * 0.15,
  }));
  scored.sort((a, b) => a.score - b.score);
  return scored[0]?.e ?? null;
}
