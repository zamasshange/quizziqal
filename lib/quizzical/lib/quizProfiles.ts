import type { Quiz } from "./quizzes";
import { isFlagsQuiz } from "./flagQuiz";
import { QUESTION_COUNT_RANGE_LABEL } from "./quizRoundSettings";
import { COUNTRY_COUNT } from "./allCountries";

export type QuizProfile = {
  thumbnailTerm: string;
  previewTitle: string;
  previewDetail: string;
  previewFact: string;
  difficulty: "Easy" | "Medium" | "Hard";
  /** Override category sent to the reveal engine */
  revealCategory?: string;
  questionLabel: string;
};

const THUMBNAILS: Record<string, Partial<QuizProfile>> = {
  "world-capitals": {
    thumbnailTerm: "Tokyo skyline",
    previewTitle: "Sample: Tokyo",
    previewDetail: "Capital of Japan",
    previewFact: "Capital cities worldwide — new mix every round",
  },
  "famous-landmarks": {
    thumbnailTerm: "Eiffel Tower",
    previewTitle: "Landmark quiz",
    previewDetail: "Guess the country from photos",
    previewFact: "Real Wikipedia images on every question",
  },
  "flags-of-the-world": {
    thumbnailTerm: "Flag of Japan",
    previewTitle: "197 countries",
    previewDetail: "Random flags each game",
    previewFact: "No repeats within a single round",
  },
  "sports-legends": {
    thumbnailTerm: "Lionel Messi",
    previewTitle: "Sports trivia",
    previewDetail: "Legends across every sport",
    previewFact: "Rich athlete reveals after each answer",
    revealCategory: "sports",
  },
  "football-world": {
    thumbnailTerm: "Cristiano Ronaldo",
    revealCategory: "football",
  },
  "basketball-nba": {
    thumbnailTerm: "LeBron James",
    revealCategory: "basketball",
  },
  "tennis-champions": {
    thumbnailTerm: "Roger Federer",
    revealCategory: "tennis",
  },
  "the-olympics": {
    thumbnailTerm: "Olympic rings",
    revealCategory: "sports",
  },
  "movie-mania": {
    thumbnailTerm: "Titanic film",
    previewTitle: "Blockbuster films",
    previewDetail: "Guess from scenes & trivia",
    previewFact: "TMDB-powered movie reveals",
    revealCategory: "movie",
  },
  "blockbuster-franchises": {
    thumbnailTerm: "Marvel Avengers",
    revealCategory: "movie",
  },
  "animation-classics": {
    thumbnailTerm: "Finding Nemo",
    revealCategory: "movie",
  },
  "tv-shows": {
    thumbnailTerm: "Game of Thrones",
    revealCategory: "tv",
  },
  "music-legends": {
    thumbnailTerm: "Michael Jackson",
    previewFact: "Artist bios & facts after every answer",
    revealCategory: "music",
  },
  "animal-kingdom": {
    thumbnailTerm: "African elephant",
    previewFact: "Real animal photos from Wikipedia",
  },
  "food-and-drink": {
    thumbnailTerm: "Sushi",
    previewFact: "Cuisine facts from around the world",
  },
  "human-body": {
    thumbnailTerm: "Human heart anatomy",
  },
  "space-explorers": {
    thumbnailTerm: "Planet Jupiter",
  },
  "world-war-two": {
    thumbnailTerm: "World War II",
  },
  "ancient-history": {
    thumbnailTerm: "Great Pyramid of Giza",
  },
  "famous-painters": {
    thumbnailTerm: "Mona Lisa",
  },
  "classic-novels": {
    thumbnailTerm: "William Shakespeare",
  },
  "african-geography": {
    thumbnailTerm: "Mount Kilimanjaro",
  },
  "european-cities": {
    thumbnailTerm: "Paris Eiffel Tower",
  },
  "plant-life": {
    thumbnailTerm: "Sunflower plant",
  },
  "chemistry-basics": {
    thumbnailTerm: "Periodic table",
  },
};

function difficultyFromQuiz(quiz: Quiz): QuizProfile["difficulty"] {
  if (quiz.badge === "HARD") return "Hard";
  if (quiz.badge === "EASY") return "Easy";
  if (quiz.rating >= 4.3) return "Medium";
  return "Medium";
}

export function getQuizProfile(quiz: Quiz): QuizProfile {
  const extra = THUMBNAILS[quiz.id] ?? {};
  const questionCount = isFlagsQuiz(quiz.id)
    ? QUESTION_COUNT_RANGE_LABEL
    : quiz.questions.length;

  const questionLabel = isFlagsQuiz(quiz.id)
    ? `${COUNTRY_COUNT} flags · choose ${QUESTION_COUNT_RANGE_LABEL} per round`
    : `${questionCount} questions`;

  return {
    thumbnailTerm: extra.thumbnailTerm ?? quiz.title,
    previewTitle: extra.previewTitle ?? quiz.title,
    previewDetail: extra.previewDetail ?? quiz.description,
    previewFact:
      extra.previewFact ??
      `${questionLabel} · ${quiz.plays.toLocaleString()} plays · learn after every answer`,
    difficulty: extra.difficulty ?? difficultyFromQuiz(quiz),
    revealCategory: extra.revealCategory,
    questionLabel,
  };
}

/** Category passed to /api/reveal for richer educational cards. */
export function getRevealCategory(quiz: Quiz): string {
  const profile = getQuizProfile(quiz);
  return profile.revealCategory ?? quiz.category;
}
