/** Lightweight category slugs for edge middleware (avoid importing full quiz catalog). */
export const CATEGORY_SLUGS = [
  "art-and-literature",
  "entertainment",
  "geography",
  "history",
  "languages",
  "science-and-nature",
  "sports",
  "trivia",
] as const;

export const CATEGORY_PATHS = CATEGORY_SLUGS.map((slug) => `/${slug}`);
