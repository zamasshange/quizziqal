import { quizzes as legacyQuizzes } from "./quizzes";
import { quizzes as quizzicalQuizzes, categories } from "@/lib/engine/quizzicalCatalog";
import { fromQuizzicalQuiz } from "@/lib/engine/adapter";

export { IMAGE_GAME_MODES } from "@/lib/quizzical/imageQuestions";
export type { GameMode } from "@/lib/quizzical/imageQuestions";

export const discoverQuizzes = [
  ...quizzicalQuizzes.map(fromQuizzicalQuiz),
  ...legacyQuizzes,
];

export const DISCOVER_CATEGORIES = [
  "All",
  "Featured",
  "Picture",
  ...categories.map((c) => c.name),
] as const;
