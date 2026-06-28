import type { Quiz, Question, AnswerColor } from "@/lib/types";
import type { Quiz as QuizzicalQuiz, Question as QuizzicalQuestion } from "./quizzicalCatalog";
import { proxiedQuizImageUrl } from "./quizImageUrl";

export type GeneratedQuestion = {
  id: string;
  question: string;
  image_url: string;
  correct_answer: string;
  options: string[];
};

const COLORS: AnswerColor[] = ["red", "blue", "yellow", "green"];

function toAnswers(texts: string[], correctIndex: number) {
  return texts.map((text, i) => ({
    text,
    color: COLORS[i % 4],
    correct: i === correctIndex,
  }));
}

function shuffleOptions(options: string[], correct: string): Question["answers"] {
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  return shuffled.map((text, i) => ({
    text,
    color: COLORS[i % 4],
    correct: text === correct,
  }));
}

export function fromQuizzicalQuestion(q: QuizzicalQuestion): Question {
  return {
    id: q.id,
    text: q.text,
    timeLimit: 20,
    imageQuery: q.imageQuery,
    answers: toAnswers(q.answers, q.correct),
  };
}

export function fromQuizzicalQuiz(q: QuizzicalQuiz): Quiz {
  return {
    id: `qc-${q.id}`,
    title: q.title,
    description: q.description,
    creator: q.author,
    questionCount: q.questions.length,
    plays: q.plays,
    category: q.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    tags: [q.category, q.badge?.toLowerCase() ?? "trivia"].filter(Boolean) as string[],
    coverGradient: `linear-gradient(135deg, ${q.color} 0%, ${adjustColor(q.color)} 100%)`,
    coverIcon: q.emoji,
    isFree: true,
    questions: q.questions.map(fromQuizzicalQuestion),
  };
}

export function fromGeneratedQuestions(
  title: string,
  emoji: string,
  color: string,
  category: string,
  rows: GeneratedQuestion[]
): Quiz {
  const id = `gen-${category.toLowerCase()}-${Date.now()}`;
  return {
    id,
    title,
    description: `Wikipedia-powered picture quiz — ${rows.length} questions`,
    creator: "Quizziqal",
    questionCount: rows.length,
    plays: Math.floor(Math.random() * 50000) + 10000,
    category,
    tags: ["picture", category.toLowerCase(), "wikipedia"],
    coverGradient: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color)} 100%)`,
    coverIcon: emoji,
    isFree: true,
    questions: rows.map((row) => ({
      id: row.id,
      text: row.question,
      timeLimit: 25,
      image: proxiedQuizImageUrl(row.image_url),
      answers: shuffleOptions(row.options, row.correct_answer),
    })),
  };
}

function adjustColor(hex: string): string {
  return hex.length === 7 ? `${hex}cc` : hex;
}
