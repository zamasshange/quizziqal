import type { Quiz, Question, AnswerColor } from "../types";
import type {
  QuizzicalQuiz,
  QuizzicalQuestion,
} from "./quizzicalCatalog";
import { getCategory } from "./quizzicalCatalog";
import type { GeneratedQuestion } from "../quizzical/lib/quizGenerator";

const REVEAL_OVERRIDES: Record<string, string> = {
  "sports-legends": "sports",
  "football-world": "football",
  "basketball-nba": "basketball",
  "tennis-champions": "tennis",
  "the-olympics": "sports",
  "movie-mania": "movies",
  "guess-the-movie": "movies",
  "flags-of-the-world": "geography",
};

function getRevealCategory(q: QuizzicalQuiz): string {
  return REVEAL_OVERRIDES[q.id] ?? q.category;
}

const ANSWER_COLORS: AnswerColor[] = ["red", "blue", "yellow", "green"];

export function fromQuizzicalQuestion(
  q: QuizzicalQuestion,
  timeLimit = 20
): Question {
  return {
    id: q.id,
    text: q.text,
    answers: q.answers.map((text, i) => ({
      text,
      color: ANSWER_COLORS[i % 4]!,
      correct: i === q.correct,
    })),
    timeLimit,
    imageQuery: q.imageQuery,
  };
}

export function fromQuizzicalQuiz(q: QuizzicalQuiz): Quiz {
  const cat = getCategory(q.category);
  const revealCategory = getRevealCategory(q);

  return {
    id: `qc-${q.id}`,
    title: q.title,
    description: q.description,
    creator: q.author,
    questionCount: q.questions.length > 0 ? q.questions.length : 10,
    plays: q.plays,
    category: cat?.name ?? q.category,
    tags: [
      q.category,
      ...(q.badge ? [q.badge.toLowerCase()] : []),
      ...(q.visualMode ? ["visual"] : []),
    ],
    coverGradient: `linear-gradient(135deg, ${q.color} 0%, ${q.color}99 100%)`,
    coverIcon: q.emoji,
    isFree: true,
    questions: q.questions.map((question) => fromQuizzicalQuestion(question)),
    revealCategory,
    quizzicalId: q.id,
    visualMode: q.visualMode,
  };
}

export function fromGeneratedQuestion(g: GeneratedQuestion, timeLimit = 25): Question {
  const correctIndex = g.options.indexOf(g.correct_answer);
  return {
    id: g.id,
    text: g.question,
    answers: g.options.map((text, i) => ({
      text,
      color: ANSWER_COLORS[i % 4]!,
      correct: i === (correctIndex >= 0 ? correctIndex : 0),
    })),
    timeLimit,
    image: g.image_url,
    imageQuery: g.correct_answer,
  };
}

export function fromGeneratedQuestions(
  title: string,
  emoji: string,
  color: string,
  category: string,
  questions: GeneratedQuestion[]
): Quiz {
  const id = `gen-${category}-${Date.now()}`;
  return {
    id,
    title,
    description: `Wikipedia-powered ${title}`,
    creator: "Quizziqal",
    questionCount: questions.length,
    plays: 0,
    category: "Picture",
    tags: ["picture", category, "wikipedia", "generated"],
    coverGradient: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
    coverIcon: emoji,
    isFree: true,
    questions: questions.map((q) => fromGeneratedQuestion(q)),
    revealCategory: category,
  };
}

export function fromAiQuiz(quiz: QuizzicalQuiz): Quiz {
  const adapted = fromQuizzicalQuiz({
    ...quiz,
    id: quiz.id || `ai-${Date.now()}`,
    author: "Quizziqal AI",
    category: "trivia",
  });
  return {
    ...adapted,
    id: `ai-${Date.now()}`,
    tags: [...adapted.tags, "ai"],
    creator: "Quizziqal AI",
  };
}
