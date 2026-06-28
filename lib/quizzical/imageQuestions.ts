// Client-safe types, constants and validation for image-based quiz questions.

export type ImageCategory =
  | "Celebrity"
  | "Athlete"
  | "Football"
  | "Basketball"
  | "Cricket"
  | "Movie"
  | "Music";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type ImageQuestion = {
  id: string;
  category: ImageCategory;
  type: "image-guess";
  image_url: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
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
  "Football",
  "Basketball",
  "Cricket",
  "Athlete",
  "Movie",
  "Music",
];

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export type GameModeSlug =
  | "celebrity"
  | "football"
  | "basketball"
  | "cricket"
  | "athlete"
  | "movie"
  | "music";

/** Maps a play-route slug to its category + display metadata. */
export type GameMode = {
  slug: GameModeSlug;
  category: ImageCategory;
  /** Text quiz category page where this picture game is listed. */
  quizCategorySlug: "entertainment" | "sports";
  title: string;
  emoji: string;
  color: string;
  defaultQuestion: string;
  subtitle?: string;
  /** Wikipedia/TMDB search terms for homepage preview photos. */
  previewTerms: string[];
};

export const IMAGE_GAME_MODES: GameMode[] = [
  {
    slug: "celebrity",
    category: "Celebrity",
    quizCategorySlug: "entertainment",
    title: "Guess the Celebrity",
    emoji: "🎭",
    color: "#b15bff",
    defaultQuestion: "Who is this?",
    subtitle: "Hollywood, music & pop culture icons",
    previewTerms: ["Zendaya", "Leonardo DiCaprio", "Denzel Washington"],
  },
  {
    slug: "football",
    category: "Football",
    quizCategorySlug: "sports",
    title: "Guess the Footballer",
    emoji: "⚽",
    color: "#00a76d",
    defaultQuestion: "Who is this footballer?",
    subtitle: "Soccer stars worldwide",
    previewTerms: ["Lionel Messi", "Cristiano Ronaldo"],
  },
  {
    slug: "basketball",
    category: "Basketball",
    quizCategorySlug: "sports",
    title: "Guess the Basketball Player",
    emoji: "🏀",
    color: "#ff6b35",
    defaultQuestion: "Who is this player?",
    subtitle: "NBA & world basketball",
    previewTerms: ["LeBron James", "Stephen Curry"],
  },
  {
    slug: "cricket",
    category: "Cricket",
    quizCategorySlug: "sports",
    title: "Guess the Cricketer",
    emoji: "🏏",
    color: "#2ecc71",
    defaultQuestion: "Who is this cricketer?",
    subtitle: "International cricket legends",
    previewTerms: ["Virat Kohli", "MS Dhoni"],
  },
  {
    slug: "athlete",
    category: "Athlete",
    quizCategorySlug: "sports",
    title: "Guess the Athlete",
    emoji: "🏅",
    color: "#ff9f43",
    defaultQuestion: "Who is this athlete?",
    subtitle: "Tennis, F1, swimming & more",
    previewTerms: ["Simone Biles", "Usain Bolt"],
  },
  {
    slug: "movie",
    category: "Movie",
    quizCategorySlug: "entertainment",
    title: "Guess the Movie",
    emoji: "🎬",
    color: "#4d8dff",
    defaultQuestion: "Which movie is this?",
    subtitle: "Posters, stills & iconic scenes",
    previewTerms: ["The Dark Knight", "Black Panther", "Inception"],
  },
  {
    slug: "music",
    category: "Music",
    quizCategorySlug: "entertainment",
    title: "Guess the Music Artist",
    emoji: "🎵",
    color: "#ff6b6b",
    defaultQuestion: "Who is this artist?",
    subtitle: "Pop, hip-hop, rock & global stars",
    previewTerms: ["Beyoncé", "Taylor Swift", "Drake"],
  },
];

export function getGameModeBySlug(slug: string): GameMode | undefined {
  return IMAGE_GAME_MODES.find((m) => m.slug === slug);
}

export function getPictureGamesByQuizCategory(
  categorySlug: string,
): GameMode[] {
  return IMAGE_GAME_MODES.filter((m) => m.quizCategorySlug === categorySlug);
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
