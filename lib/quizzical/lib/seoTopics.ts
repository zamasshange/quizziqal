import {
  BASE_KEYWORDS,
  BRAND_KEYWORDS,
  CATEGORY_KEYWORDS,
  IMAGE_GAME_KEYWORDS,
  PAGE_KEYWORDS,
  QUIZ_LONGTAIL_KEYWORDS,
  SEARCH_TOPIC_KEYWORDS,
} from "./seoKeywords";

export type SeoTopic = {
  slug: string;
  keyword: string;
  related: string[];
};

/** Google / legacy URLs that should resolve to a canonical topic slug. */
const SLUG_ALIASES: Record<string, string> = {
  "music-quiz-online": "music-quiz",
  "football-quiz-online": "football-quiz",
  "soccer-quiz-online": "soccer-quiz",
  "movie-quiz-online": "movie-quiz",
  "celebrity-quiz-online": "celebrity-quiz",
  "geography-quiz-online": "geography-quiz",
  "history-quiz-online": "history-quiz",
  "science-quiz-online": "science-quiz",
  "sports-quiz-online": "sports-trivia",
  "trivia-quiz-online": "trivia-games",
  "free-quiz-games": "free-quiz-games",
  "online-quiz-games": "online-quiz-games",
  "pub-quiz-online": "pub-quiz-online",
  "box-office-quiz": "movie-quiz",
  "premier-league-quiz": "football-quiz",
  "picture-quiz-online": "picture-quiz",
  "flag-quiz-online": "flag-quiz",
  "beginner-trivia": "beginner-quiz",
  "poetry-trivia": "poetry-quiz",
  "rugby-trivia": "rugby-quiz",
  "visual-trivia": "visual-quiz",
  "science-trivia-online": "science-trivia-online",
  "geography-trivia": "geography-quiz-online",
  "history-trivia": "history-quiz-online",
  "movie-trivia": "film-trivia",
};

export function keywordToSlug(keyword: string): string {
  return keyword
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function collectAllKeywords(): string[] {
  return [
    ...new Set(
      [
        ...BASE_KEYWORDS,
        ...Object.values(PAGE_KEYWORDS).flat(),
        ...Object.values(CATEGORY_KEYWORDS).flat(),
        ...Object.values(IMAGE_GAME_KEYWORDS).flat(),
        ...QUIZ_LONGTAIL_KEYWORDS,
        ...SEARCH_TOPIC_KEYWORDS,
      ]
        .map((k) => k.trim())
        .filter(Boolean),
    ),
  ];
}

function relatedKeywords(keyword: string, all: string[], limit = 10): string[] {
  const words = keyword.toLowerCase().split(/\s+/);
  const scored = all
    .filter((k) => k !== keyword)
    .map((k) => {
      const lower = k.toLowerCase();
      const score = words.reduce(
        (n, w) => (w.length > 2 && lower.includes(w) ? n + 1 : n),
        0,
      );
      return { k, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  const picked = scored.slice(0, limit).map(({ k }) => k);
  if (picked.length >= limit) return picked;

  const rest = all.filter((k) => k !== keyword && !picked.includes(k));
  return [...picked, ...rest.slice(0, limit - picked.length)];
}

let cachedTopics: SeoTopic[] | null = null;

/** Every unique SEO keyword as an indexable topic with a URL slug. */
export function getAllSeoTopics(): SeoTopic[] {
  if (cachedTopics) return cachedTopics;

  const keywords = collectAllKeywords();
  const bySlug = new Map<string, SeoTopic>();

  for (const keyword of keywords) {
    const slug = keywordToSlug(keyword);
    if (!slug || bySlug.has(slug)) continue;
    bySlug.set(slug, {
      slug,
      keyword,
      related: relatedKeywords(keyword, keywords),
    });
  }

  cachedTopics = Array.from(bySlug.values()).sort((a, b) =>
    a.keyword.localeCompare(b.keyword),
  );
  return cachedTopics;
}

/** Resolve a topic by slug — exact match or alias only (no invented pages). */
export function getSeoTopicBySlug(slug: string): SeoTopic | undefined {
  const normalized = slug.toLowerCase().trim();
  const exact = getAllSeoTopics().find((t) => t.slug === normalized);
  if (exact) return exact;

  const alias = SLUG_ALIASES[normalized];
  if (alias) {
    const target = getAllSeoTopics().find((t) => t.slug === alias);
    if (target) return target;
  }

  return undefined;
}

export function isValidTopicSlug(slug: string): boolean {
  return getSeoTopicBySlug(slug) !== undefined;
}

/** Short label for topic hub pages — not stuffed into every meta description. */
export const TOPIC_BRAND_LINE = "Quizzical";
export function topicCount(): number {
  return getAllSeoTopics().length;
}
