import type { Question, Quiz } from "./types";
import {
  generateImageQuizBatch,
  isImageCategory,
  normalizeDifficulty,
  type GeneratedQuestion,
} from "@/lib/quizzical/quizGenerator";
import { generateFlagQuestions, isFlagsQuiz } from "@/lib/quizzical/flagQuiz";
import { fromGeneratedQuestions, fromQuizzicalQuiz } from "./engine/adapter";
import { getPictureGameModes, getQuizzicalQuizRaw } from "./quizRegistry";
import type { Difficulty, QuestionCount, TimerSeconds } from "./roundSettings";

export type RoundSettings = {
  count: QuestionCount;
  difficulty: Difficulty;
  timerSeconds: TimerSeconds;
};

const PREPARE_TIMEOUT_MS = 50_000;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function withTimeLimit(questions: Question[], timerSeconds: number): Question[] {
  return questions.map((q) => ({ ...q, timeLimit: timerSeconds }));
}

function isPictureQuiz(template: Quiz): boolean {
  return (
    template.tags.includes("intent") ||
    template.tags.includes("generated") ||
    template.tags.includes("picture")
  );
}

/** Resolve Wikipedia/TMDB image category from quiz metadata. */
function resolveImageCategory(template: Quiz): string | null {
  const fromTag = template.tags.find((t) => isImageCategory(t));
  if (fromTag) return fromTag;

  if (template.revealCategory && isImageCategory(template.revealCategory)) {
    return template.revealCategory;
  }

  for (const tag of template.tags) {
    const mode = getPictureGameModes().find((m) => m.slug === tag);
    if (mode) return mode.category;
  }

  return null;
}

async function generatePictureQuestions(
  category: string,
  count: number,
  difficulty: Difficulty
): Promise<GeneratedQuestion[]> {
  const normalized = normalizeDifficulty(difficulty);

  let rows: GeneratedQuestion[] = [];
  try {
    rows = await Promise.race([
      generateImageQuizBatch(category, count, normalized, {}, { fastStart: true }),
      new Promise<GeneratedQuestion[]>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), PREPARE_TIMEOUT_MS)
      ),
    ]);
  } catch {
    rows = [];
  }

  if (rows.length === 0) {
    rows = await generateImageQuizBatch(
      category,
      Math.min(count, 12),
      normalized,
      {},
      { bootstrapOnly: true }
    );
  }

  if (rows.length === 0) {
    throw new Error(
      "Could not load picture questions. Try again or pick Easy difficulty."
    );
  }

  return rows.slice(0, count);
}

export async function buildQuizForRound(
  template: Quiz,
  settings: RoundSettings
): Promise<Quiz> {
  const { count, difficulty, timerSeconds } = settings;
  const quizzicalId = template.quizzicalId ?? template.id.replace(/^qc-/, "");

  if (isPictureQuiz(template)) {
    const category = resolveImageCategory(template);
    if (category) {
      const rows = await generatePictureQuestions(category, count, difficulty);
      const mode = getPictureGameModes().find((m) => m.category === category);
      const quiz = fromGeneratedQuestions(
        mode?.title ?? template.title,
        mode?.emoji ?? template.coverIcon,
        mode?.color ?? "#46178f",
        category,
        rows
      );
      quiz.questions = withTimeLimit(quiz.questions, timerSeconds);
      return quiz;
    }
  }

  if (isFlagsQuiz(quizzicalId)) {
    const raw = getQuizzicalQuizRaw(template.id);
    if (!raw) throw new Error("Flags quiz not found");
    const quiz = fromQuizzicalQuiz({
      ...raw,
      id: `flags-${Date.now()}`,
      questions: generateFlagQuestions(count),
    });
    quiz.questions = withTimeLimit(quiz.questions, timerSeconds);
    return quiz;
  }

  const pool = shuffle(template.questions);
  const picked = pool.slice(0, Math.min(count, pool.length));
  if (picked.length === 0) {
    throw new Error("This quiz has no questions available.");
  }

  return {
    ...template,
    id: `${template.id}-round-${Date.now()}`,
    questionCount: picked.length,
    questions: withTimeLimit(picked, timerSeconds),
  };
}
