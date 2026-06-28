export type AnswerColor = "red" | "blue" | "yellow" | "green";

export interface Question {
  id: string;
  text: string;
  answers: { text: string; color: AnswerColor; correct: boolean }[];
  timeLimit: number;
  image?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  creator: string;
  creatorAvatar?: string;
  questionCount: number;
  plays: number;
  category: string;
  tags: string[];
  coverGradient: string;
  coverIcon: string;
  isFree: boolean;
  questions: Question[];
}

export interface Player {
  id: string;
  nickname: string;
  score: number;
  streak: number;
  lastAnswer?: number;
  lastCorrect?: boolean;
}

export type GamePhase =
  | "lobby"
  | "question"
  | "reveal"
  | "leaderboard"
  | "podium";

export interface GameSession {
  id: string;
  quizId: string;
  phase: GamePhase;
  players: Player[];
  currentQuestion: number;
  questionStartedAt?: number;
  answers: Record<string, { answerIndex: number; timeMs: number }>;
  createdAt: number;
}
