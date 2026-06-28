import { GameSession, Player } from "./types";
import { getQuizById, registerQuiz } from "./quizRegistry";

const games = new Map<string, GameSession>();

export function createGame(quizId: string): GameSession | null {
  const quiz = getQuizById(quizId);
  if (!quiz) return null;

  const id = crypto.randomUUID();
  const session: GameSession = {
    id,
    quizId,
    phase: "lobby",
    players: [],
    currentQuestion: 0,
    answers: {},
    createdAt: Date.now(),
  };
  games.set(id, session);

  const started = beginPlay(id, "Player");
  return started?.session ?? session;
}

export function getGame(gameId: string): GameSession | undefined {
  return games.get(gameId);
}

export function beginPlay(
  gameId: string,
  nickname: string
): { player: Player; session: GameSession } | null {
  const session = games.get(gameId);
  if (!session || session.phase !== "lobby") return null;

  const trimmed = nickname.trim().slice(0, 15);
  if (!trimmed) return null;

  const player: Player = {
    id: crypto.randomUUID(),
    nickname: trimmed,
    score: 0,
    streak: 0,
  };
  session.players.push(player);
  session.phase = "question";
  session.currentQuestion = 0;
  session.questionStartedAt = Date.now();
  session.answers = {};

  return { player, session };
}

function calculateScore(
  timeMs: number,
  timeLimit: number,
  streak: number
): number {
  const base = 1000;
  const timeBonus = Math.max(
    0,
    Math.floor((1 - timeMs / (timeLimit * 1000)) * 500)
  );
  const streakBonus = Math.min(streak, 3) * 100;
  return base + timeBonus + streakBonus;
}

export function submitAnswer(
  gameId: string,
  playerId: string,
  answerIndex: number
): GameSession | null {
  const session = games.get(gameId);
  if (!session || session.phase !== "question") return null;
  if (session.answers[playerId]) return session;

  const quiz = getQuizById(session.quizId);
  if (!quiz) return null;

  const question = quiz.questions[session.currentQuestion];
  if (!question) return null;

  const timeMs = Date.now() - (session.questionStartedAt ?? Date.now());
  session.answers[playerId] = { answerIndex, timeMs };

  const player = session.players.find((p) => p.id === playerId);
  if (player) {
    const correct = question.answers[answerIndex]?.correct ?? false;
    player.lastAnswer = answerIndex;
    player.lastCorrect = correct;
    if (correct) {
      player.streak += 1;
      player.score += calculateScore(timeMs, question.timeLimit, player.streak);
    } else {
      player.streak = 0;
    }
  }

  return session;
}

export function advanceGame(gameId: string): GameSession | null {
  const session = games.get(gameId);
  if (!session) return null;

  const quiz = getQuizById(session.quizId);
  if (!quiz) return null;

  if (session.phase === "question") {
    session.phase = "reveal";
    return session;
  }

  if (session.phase === "reveal") {
    session.phase = "leaderboard";
    return session;
  }

  if (session.phase === "leaderboard") {
    const next = session.currentQuestion + 1;
    if (next >= quiz.questions.length) {
      session.phase = "podium";
    } else {
      session.currentQuestion = next;
      session.phase = "question";
      session.questionStartedAt = Date.now();
      session.answers = {};
      session.players.forEach((p) => {
        p.lastAnswer = undefined;
        p.lastCorrect = undefined;
      });
    }
    return session;
  }

  return session;
}

export function deleteGame(gameId: string): void {
  games.delete(gameId);
}
