export const QUESTION_COUNT_OPTIONS = [10, 15, 20, 25, 30] as const;
export type QuestionCount = (typeof QUESTION_COUNT_OPTIONS)[number];
export const DEFAULT_QUESTION_COUNT: QuestionCount = 10;

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];
export const DEFAULT_DIFFICULTY: Difficulty = "Medium";

export const TIMER_OPTIONS = [10, 15, 20, 30, 45] as const;
export type TimerSeconds = (typeof TIMER_OPTIONS)[number];
export const DEFAULT_TIMER: TimerSeconds = 20;

export const ANSWER_LABELS = ["A", "B", "C", "D"] as const;
