/** Client-side game sessions, history, and local leaderboards. */

export type GameType = "text" | "image";

export type SavedGameSession = {
  gameKey: string;
  gameType: GameType;
  quizId: string;
  title: string;
  emoji: string;
  href: string;
  index: number;
  phase: "playing" | "reveal";
  score: number;
  correctCount: number;
  timeLeft: number;
  selected: number | null;
  /** Text quiz — question ids in play order */
  questionIds?: string[];
  /** Image quiz — full prepared round */
  imageQuestions?: unknown[];
  difficulty?: string;
  timerSeconds?: number;
  updatedAt: number;
};

export type GameHistoryEntry = {
  id: string;
  gameKey: string;
  gameType: GameType;
  quizId: string;
  title: string;
  emoji: string;
  href: string;
  score: number;
  correct: number;
  total: number;
  completedAt: number;
  inProgress?: boolean;
};

export type LocalLeaderboardEntry = {
  gameKey: string;
  title: string;
  emoji: string;
  score: number;
  correct: number;
  total: number;
  username: string;
  completedAt: number;
};

const SESSIONS_KEY = "quizzical-sessions";
const HISTORY_KEY = "quizzical-game-history";
const LEADERBOARD_KEY = "quizzical-leaderboard";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const MAX_HISTORY = 40;
const MAX_LEADERBOARD_PER_GAME = 25;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

export function gameKeyText(quizId: string): string {
  return `text:${quizId}`;
}

export function gameKeyImage(category: string, difficulty: string): string {
  return `image:${category}:${difficulty}`;
}

export function saveGameSession(session: SavedGameSession): void {
  const all = readJson<Record<string, SavedGameSession>>(SESSIONS_KEY, {});
  all[session.gameKey] = { ...session, updatedAt: Date.now() };
  writeJson(SESSIONS_KEY, all);
  upsertHistoryProgress(session);
}

export function getGameSession(gameKey: string): SavedGameSession | null {
  const all = readJson<Record<string, SavedGameSession>>(SESSIONS_KEY, {});
  const s = all[gameKey];
  if (!s) return null;
  if (Date.now() - s.updatedAt > SESSION_TTL_MS) {
    clearGameSession(gameKey);
    return null;
  }
  return s;
}

export function clearGameSession(gameKey: string): void {
  const all = readJson<Record<string, SavedGameSession>>(SESSIONS_KEY, {});
  delete all[gameKey];
  writeJson(SESSIONS_KEY, all);
  markHistoryComplete(gameKey);
}

export function getActiveSessions(): SavedGameSession[] {
  const all = readJson<Record<string, SavedGameSession>>(SESSIONS_KEY, {});
  const now = Date.now();
  return Object.values(all)
    .filter((s) => now - s.updatedAt <= SESSION_TTL_MS)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

function upsertHistoryProgress(session: SavedGameSession): void {
  const history = getGameHistory();
  const existing = history.find(
    (h) => h.gameKey === session.gameKey && h.inProgress,
  );
  const entry: GameHistoryEntry = {
    id: existing?.id ?? `${session.gameKey}-${session.updatedAt}`,
    gameKey: session.gameKey,
    gameType: session.gameType,
    quizId: session.quizId,
    title: session.title,
    emoji: session.emoji,
    href: session.href,
    score: session.score,
    correct: session.correctCount,
    total: session.questionIds?.length ?? session.imageQuestions?.length ?? 0,
    completedAt: session.updatedAt,
    inProgress: true,
  };
  const next = [
    entry,
    ...history.filter((h) => !(h.gameKey === session.gameKey && h.inProgress)),
  ].slice(0, MAX_HISTORY);
  writeJson(HISTORY_KEY, next);
}

function markHistoryComplete(gameKey: string): void {
  const history = getGameHistory().map((h) =>
    h.gameKey === gameKey && h.inProgress
      ? { ...h, inProgress: false }
      : h,
  );
  writeJson(HISTORY_KEY, history);
}

export function recordGameComplete(entry: Omit<GameHistoryEntry, "id" | "inProgress">): void {
  clearGameSession(entry.gameKey);
  const history = getGameHistory();
  const id = `${entry.gameKey}-${entry.completedAt}`;
  const next: GameHistoryEntry[] = [
    { ...entry, id, inProgress: false },
    ...history.filter((h) => h.gameKey !== entry.gameKey || !h.inProgress),
  ].slice(0, MAX_HISTORY);
  writeJson(HISTORY_KEY, next);
}

export function getGameHistory(): GameHistoryEntry[] {
  return readJson<GameHistoryEntry[]>(HISTORY_KEY, []);
}

export function getRecentCompleted(limit = 8): GameHistoryEntry[] {
  return getGameHistory()
    .filter((h) => !h.inProgress)
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, limit);
}

/** One entry per game — latest play only — so the home hub does not grow with replays. */
export function getRecentCompletedUnique(limit = 8): GameHistoryEntry[] {
  const seen = new Set<string>();
  const result: GameHistoryEntry[] = [];

  for (const entry of getGameHistory()
    .filter((h) => !h.inProgress)
    .sort((a, b) => b.completedAt - a.completedAt)) {
    if (seen.has(entry.gameKey)) continue;
    seen.add(entry.gameKey);
    result.push(entry);
    if (result.length >= limit) break;
  }

  return result;
}

export function addLocalLeaderboardScore(
  entry: LocalLeaderboardEntry,
): void {
  const all = readJson<Record<string, LocalLeaderboardEntry[]>>(LEADERBOARD_KEY, {});
  const list = [...(all[entry.gameKey] ?? []), entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_LEADERBOARD_PER_GAME);
  all[entry.gameKey] = list;
  writeJson(LEADERBOARD_KEY, all);
}

export function getLocalLeaderboard(gameKey: string): LocalLeaderboardEntry[] {
  const all = readJson<Record<string, LocalLeaderboardEntry[]>>(LEADERBOARD_KEY, {});
  return all[gameKey] ?? [];
}

export function getGlobalLocalLeaderboard(limit = 20): LocalLeaderboardEntry[] {
  const all = readJson<Record<string, LocalLeaderboardEntry[]>>(LEADERBOARD_KEY, {});
  return Object.values(all)
    .flat()
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
