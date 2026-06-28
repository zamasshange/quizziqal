import type { Question } from "./quizzes";
import { ALL_COUNTRIES } from "./allCountries";
import { DEFAULT_QUESTION_COUNT } from "./quizRoundSettings";

export const FLAGS_QUIZ_ID = "flags-of-the-world";

/** @deprecated Use DEFAULT_QUESTION_COUNT — kept for static metadata fallbacks. */
export const FLAGS_PER_ROUND = DEFAULT_QUESTION_COUNT;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Random round of flag questions — no duplicate countries within a game. */
export function generateFlagQuestions(count = FLAGS_PER_ROUND): Question[] {
  const picked = shuffle(ALL_COUNTRIES).slice(0, Math.min(count, ALL_COUNTRIES.length));

  return picked.map((country, i) => {
    const wrong = shuffle(
      ALL_COUNTRIES.filter((c) => c.iso2 !== country.iso2),
    )
      .slice(0, 3)
      .map((c) => c.name);
    const answers = shuffle([country.name, ...wrong]);
    return {
      id: `flag-${country.iso2}-${i}`,
      text: "Which country is this?",
      answers,
      correct: answers.indexOf(country.name),
      imageQuery: `Flag of ${country.name}`,
    };
  });
}

export function isFlagsQuiz(quizId: string): boolean {
  return quizId === FLAGS_QUIZ_ID;
}
