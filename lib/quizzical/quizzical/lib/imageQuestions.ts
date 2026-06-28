// Client-safe types, constants and validation for image-based quiz questions.
//
// Admin CRUD lives in the server-only module `lib/imageQuestionsStore.ts`.
// Player-facing image games use lib/quizGenerator.ts (real Wikipedia/TMDB).

export type ImageCategory = "Celebrity" | "Athlete" | "Movie" | "Music";
export type Difficulty = "Easy" | "Medium" | "Hard";

export type ImageQuestion = {
  id: string;
  category: ImageCategory;
  type: "image-guess";
  image_url: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[]; // exactly 3
  difficulty: Difficulty;
  created_at: string;
};

export type NewImageQuestion = Omit<
  ImageQuestion,
  "id" | "type" | "created_at"
>;

export type ListFilters = {
  category?: string;
  difficulty?: string;
  search?: string;
};

export const IMAGE_CATEGORIES: ImageCategory[] = [
  "Celebrity",
  "Athlete",
  "Movie",
  "Music",
];

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

/** Maps a play-route slug to its category + display metadata. */
export type GameMode = {
  slug: "celebrity" | "athlete" | "movie" | "music";
  category: ImageCategory;
  title: string;
  emoji: string;
  color: string;
  defaultQuestion: string;
};

export const IMAGE_GAME_MODES: GameMode[] = [
  {
    slug: "celebrity",
    category: "Celebrity",
    title: "Guess the Celebrity",
    emoji: "🎭",
    color: "#b15bff",
    defaultQuestion: "Who is this?",
  },
  {
    slug: "athlete",
    category: "Athlete",
    title: "Guess the Athlete",
    emoji: "🏅",
    color: "#ff9f43",
    defaultQuestion: "Who is this?",
  },
  {
    slug: "movie",
    category: "Movie",
    title: "Guess the Movie",
    emoji: "🎬",
    color: "#4d8dff",
    defaultQuestion: "Which movie is this?",
  },
  {
    slug: "music",
    category: "Music",
    title: "Guess the Music Artist",
    emoji: "🎵",
    color: "#ff6b6b",
    defaultQuestion: "Who is this artist?",
  },
];

export function getGameModeBySlug(slug: string): GameMode | undefined {
  return IMAGE_GAME_MODES.find((m) => m.slug === slug);
}

function isPlaceholderImageUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes("picsum.photos") ||
    u.includes("placeholder.com") ||
    u.includes("via.placeholder") ||
    u.includes("placehold.co")
  );
}

/** Validates an incoming payload for create/update. Returns an error string or null. */
export function validateImageQuestionPayload(
  body: unknown,
  { partial = false }: { partial?: boolean } = {},
): string | null {
  if (typeof body !== "object" || body === null) return "Invalid body.";
  const b = body as Record<string, unknown>;

  const has = (name: string) => name in b && b[name] !== undefined;

  if (has("category") && !IMAGE_CATEGORIES.includes(b.category as ImageCategory))
    return "Invalid category.";
  if (has("difficulty") && !DIFFICULTIES.includes(b.difficulty as Difficulty))
    return "Invalid difficulty.";
  if (has("image_url") && typeof b.image_url !== "string")
    return "image_url must be a string.";
  if (
    has("image_url") &&
    typeof b.image_url === "string" &&
    isPlaceholderImageUrl(b.image_url)
  )
    return "image_url must be a real image URL (no placeholders).";
  if (has("correct_answer") && typeof b.correct_answer !== "string")
    return "correct_answer must be a string.";
  if (
    has("wrong_answers") &&
    (!Array.isArray(b.wrong_answers) ||
      b.wrong_answers.length !== 3 ||
      b.wrong_answers.some((x) => typeof x !== "string"))
  )
    return "wrong_answers must be an array of exactly 3 strings.";

  if (!partial) {
    for (const field of [
      "category",
      "image_url",
      "correct_answer",
      "wrong_answers",
      "difficulty",
    ]) {
      if (!(field in b)) return `Missing field: ${field}.`;
    }
  }
  return null;
}
