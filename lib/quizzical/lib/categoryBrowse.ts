import { IMAGE_GAME_MODES } from "./imageQuestions";
import { getCategoryQuizCounts } from "./quizzes";

/** Text quiz count + picture games listed on each category page. */
export function getCategoryBrowseCounts(): Record<string, number> {
  const counts = { ...getCategoryQuizCounts() };
  for (const mode of IMAGE_GAME_MODES) {
    counts[mode.quizCategorySlug] = (counts[mode.quizCategorySlug] ?? 0) + 1;
  }
  return counts;
}
