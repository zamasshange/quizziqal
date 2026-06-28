import type { Question, Quiz } from "./types";
import {
  generateImageQuizBatch,
  isImageCategory,
  normalizeDifficulty,
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

export async function buildQuizForRound(
  template: Quiz,
  settings: RoundSettings
): Promise<Quiz> {
  const { count, difficulty, timerSeconds } = settings;
  const quizzicalId = template.quizzicalId ?? template.id.replace(/^qc-/, "");

  if (template.tags.includes("intent") || template.tags.includes("generated")) {
    const category =
      template.tags.find((t) => isImageCategory(t)) ??
      template.revealCategory ??
      template.tags.find(
        (t) => t !== "picture" && t !== "intent" && t !== "generated"
      );

    if (category && isImageCategory(category)) {
      const rows = await generateImageQuizBatch(
        category,
        count,
        normalizeDifficulty(difficulty),
        {},
        { fastStart: true }
      );
      if (rows.length === 0) {
        throw new Error("Could not generate questions");
      }
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
  return {
    ...template,
    id: `${template.id}-round-${Date.now()}`,
    questionCount: picked.length,
    questions: withTimeLimit(picked, timerSeconds),
  };
}
