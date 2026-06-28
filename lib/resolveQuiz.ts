import type { Quiz } from "./types";
import { getQuizById } from "./quizRegistry";
import { getGameModeBySlug } from "@/lib/quizzical/imageQuestions";

export function buildPictureIntentQuiz(slug: string): Quiz | null {
  const mode = getGameModeBySlug(slug);
  if (!mode) return null;

  return {
    id: `pic-${mode.slug}`,
    title: mode.title,
    description: mode.subtitle ?? "Wikipedia-powered picture quiz",
    creator: "Quizziqal",
    questionCount: 10,
    plays: 0,
    category: "Picture",
    tags: ["picture", mode.category, "intent", mode.slug],
    coverGradient: `linear-gradient(135deg, ${mode.color} 0%, ${mode.color}99 100%)`,
    coverIcon: mode.emoji,
    isFree: true,
    questions: [],
    revealCategory: mode.category,
  };
}

/** Resolve a playable quiz template from a URL id (no server session required). */
export function resolveQuizTemplate(quizId: string): Quiz | null {
  const fromRegistry = getQuizById(quizId);
  if (fromRegistry) return fromRegistry;

  if (quizId.startsWith("pic-")) {
    return buildPictureIntentQuiz(quizId.slice(4));
  }

  return null;
}
