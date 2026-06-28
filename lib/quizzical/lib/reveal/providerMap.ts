// Category → data-provider routing for the reveal engine.
//
// The reveal system automatically picks the correct provider based on the quiz
// category. Anything not listed (or whose primary provider returns nothing)
// falls back to Wikipedia so every answer is still educational.

import type { RevealProvider, RevealKind } from "./types";

/**
 * Canonical map exactly as specified by the product brief. Keys are normalized
 * (lowercase, spaces/underscores → hyphens) before lookup so it tolerates the
 * many category spellings used across the app (slugs, image categories, etc.).
 */
export const PROVIDER_MAP: Record<string, RevealProvider> = {
  // Wikipedia — geography, science, history, general knowledge, people, music
  geography: "wikipedia",
  countries: "wikipedia",
  capitals: "wikipedia",
  landmarks: "wikipedia",
  science: "wikipedia",
  "science-and-nature": "wikipedia",
  history: "wikipedia",
  trivia: "wikipedia",
  "general-knowledge": "wikipedia",
  "art-and-literature": "wikipedia",
  languages: "wikipedia",
  entertainment: "wikipedia",
  celebrity: "wikipedia",
  celebrities: "wikipedia",
  music: "wikipedia",
  "music-artists": "wikipedia",

  // TheSportsDB — sports people and teams
  sports: "thesportsdb",
  athlete: "thesportsdb",
  athletes: "thesportsdb",
  "sports-legends": "thesportsdb",
  football: "thesportsdb",
  soccer: "thesportsdb",
  basketball: "thesportsdb",
  tennis: "thesportsdb",
  baseball: "thesportsdb",
  "formula-1": "thesportsdb",
  f1: "thesportsdb",
  "motorsport": "thesportsdb",

  // TMDB — film and television
  movie: "tmdb",
  movies: "tmdb",
  tv: "tmdb",
  "tv-shows": "tmdb",
  television: "tmdb",
};

export function normalizeCategory(category?: string | null): string {
  return (category ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

/** Resolve the primary provider for a category (defaults to Wikipedia). */
export function resolveProvider(category?: string | null): RevealProvider {
  return PROVIDER_MAP[normalizeCategory(category)] ?? "wikipedia";
}

/**
 * Optional hint about what kind of sports entity to expect. Most quizzes mix
 * players and teams, so the default is "player" and the client/server will fall
 * back to a team lookup automatically. A category containing "team"/"club"
 * flips the preference.
 */
export function sportsKindHint(category?: string | null): RevealKind {
  const c = normalizeCategory(category);
  if (c.includes("team") || c.includes("club")) return "team";
  return "player";
}
