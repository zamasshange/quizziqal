import { categories, quizzes, type Quiz } from "@/lib/quizzes";
import { IMAGE_GAME_MODES } from "@/lib/imageQuestions";
import type { ProgressionState } from "@/lib/progression/types";
import type { ContentHistoryRow } from "./contentHistory";
import { normalizeContentId } from "./contentHistory";

export type Recommendation = {
  id: string;
  title: string;
  href: string;
  emoji: string;
  reason: string;
  kind: "quiz" | "image" | "category";
};

export function buildRecommendations(
  state: ProgressionState,
  history: ContentHistoryRow[] = [],
): Recommendation[] {
  const seenQuizIds = new Set(
    history
      .filter((h) => h.content_type === "question")
      .map((h) => normalizeContentId(h.content_id)),
  );
  const playedCategories = new Map<string, number>();
  for (const m of state.mastery) {
    playedCategories.set(m.slug, m.answered);
  }

  const weakest = [...state.mastery]
    .filter((m) => m.answered > 0)
    .sort((a, b) => a.masteryPct - b.masteryPct)[0];

  const strongest = [...state.mastery]
    .filter((m) => m.answered >= 5)
    .sort((a, b) => b.masteryPct - a.masteryPct)[0];

  const recs: Recommendation[] = [];

  const unseenQuizzes = quizzes.filter(
    (q) => !seenQuizIds.has(normalizeContentId(q.id)),
  );

  const pickQuiz = (pool: Quiz[], reason: string): void => {
    const q = pool[Math.floor(Math.random() * pool.length)];
    if (!q || recs.some((r) => r.id === q.id)) return;
    recs.push({
      id: q.id,
      title: q.title,
      href: `/quiz/${q.id}/play`,
      emoji: categories.find((c) => c.slug === q.category)?.emoji ?? "🎯",
      reason,
      kind: "quiz",
    });
  };

  if (weakest) {
    const pool = unseenQuizzes.filter((q) => q.category === weakest.slug);
    if (pool.length) pickQuiz(pool, `Boost your ${weakest.slug.replace(/-/g, " ")} mastery`);
  }

  if (strongest && recs.length < 3) {
    const pool = unseenQuizzes.filter((q) => q.category === strongest.slug);
    if (pool.length) pickQuiz(pool, `You're great at ${strongest.slug.replace(/-/g, " ")} — try this`);
  }

  if (recs.length < 3 && unseenQuizzes.length) {
    pickQuiz(unseenQuizzes, "New quiz you haven't played yet");
  }

  const imageModes = IMAGE_GAME_MODES.filter((m) => {
    const key = normalizeContentId(m.slug);
    return !history.some(
      (h) =>
        h.content_type === m.slug &&
        normalizeContentId(h.content_id) === key,
    );
  });

  if (imageModes.length && recs.length < 4) {
    const mode = imageModes[Math.floor(Math.random() * imageModes.length)];
    recs.push({
      id: mode.slug,
      title: mode.title,
      href: `/play/${mode.slug}`,
      emoji: mode.emoji,
      reason: "Fresh picture challenge",
      kind: "image",
    });
  }

  const lowPlayCat = categories.find(
    (c) => (playedCategories.get(c.slug) ?? 0) < 3,
  );
  if (lowPlayCat && recs.length < 5) {
    recs.push({
      id: lowPlayCat.slug,
      title: lowPlayCat.name,
      href: `/${lowPlayCat.slug}`,
      emoji: lowPlayCat.emoji,
      reason: "Explore a category you haven't tried much",
      kind: "category",
    });
  }

  return recs.slice(0, 5);
}
