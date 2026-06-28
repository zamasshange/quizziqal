/** User-selectable round length for picture quizzes and flags. */

export const QUESTION_COUNT_OPTIONS = [10, 15, 20, 25, 30] as const;

export type QuestionCount = (typeof QUESTION_COUNT_OPTIONS)[number];

export const DEFAULT_QUESTION_COUNT: QuestionCount = 10;

export const QUESTION_COUNT_RANGE_LABEL = "10–30";
