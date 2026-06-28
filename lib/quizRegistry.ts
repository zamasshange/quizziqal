import type { Quiz } from "./types";
import { quizzes as legacyQuizzes } from "./quizzes";
import {
  quizzes as quizzicalQuizzes,
  getQuiz as getQuizzicalQuiz,
} from "@/lib/engine/quizzicalCatalog";
import { fromQuizzicalQuiz } from "@/lib/engine/adapter";
import { IMAGE_GAME_MODES, type GameMode } from "@/lib/quizzical/imageQuestions";

const catalogQuizzes: Quiz[] = quizzicalQuizzes.map(fromQuizzicalQuiz);
const dynamicQuizzes = new Map<string, Quiz>();

const catalogById = new Map(catalogQuizzes.map((q) => [q.id, q]));
const legacyById = new Map(legacyQuizzes.map((q) => [q.id, q]));

export function getQuizById(id: string): Quiz | undefined {
  return (
    dynamicQuizzes.get(id) ??
    catalogById.get(id) ??
    legacyById.get(id)
  );
}

export function registerQuiz(quiz: Quiz): void {
  dynamicQuizzes.set(quiz.id, quiz);
}

export function getDiscoverQuizzes(): Quiz[] {
  return [...catalogQuizzes, ...legacyQuizzes];
}

export function getPictureGameModes(): GameMode[] {
  return IMAGE_GAME_MODES;
}

export function getQuizzicalQuizRaw(id: string) {
  const rawId = id.startsWith("qc-") ? id.slice(3) : id;
  return getQuizzicalQuiz(rawId);
}
