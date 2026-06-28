import { quizzes as legacyQuizzes } from "./quizzes";
import { quizzes as quizzicalQuizzes, categories } from "./quizzical/quizzicalCatalog";
import { fromQuizzicalQuiz } from "./quizzical/adapter";

export { IMAGE_GAME_MODES } from "./quizzical/imageQuestions";
export type { GameMode } from "./quizzical/imageQuestions";

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
