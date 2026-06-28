/** XP rewards and level curve for Knowledge Explorers. */

export type GameDifficulty = "Easy" | "Medium" | "Hard";

export const XP = {
  correctAnswer: 5,
  quizComplete: 10,
  perfectQuiz: 25,
  dailyChallenge: 50,
  firstQuizOfDay: 20,
  newDiscovery: 10,
  missionComplete: 30,
} as const;

export const COINS = {
  correctAnswer: 1,
  quizComplete: 3,
  perfectQuiz: 10,
  newDiscovery: 2,
  streakDay: 5,
  missionComplete: 8,
} as const;

/** Reward multipliers per difficulty — Easy earns less, Hard earns more. */
export const DIFFICULTY_REWARD_SCALE: Record<
  GameDifficulty,
  { xp: number; coins: number }
> = {
  Easy: { xp: 0.65, coins: 0.65 },
  Medium: { xp: 1, coins: 1 },
  Hard: { xp: 1.75, coins: 1.75 },
};

export function normalizeDifficulty(raw?: string): GameDifficulty {
  if (!raw) return "Medium";
  const d = raw.trim().toLowerCase();
  if (d === "easy") return "Easy";
  if (d === "hard") return "Hard";
  return "Medium";
}

export function difficultyRewardScale(difficulty?: string): {
  xp: number;
  coins: number;
} {
  return DIFFICULTY_REWARD_SCALE[normalizeDifficulty(difficulty)];
}

export function scaledXp(base: number, difficulty?: string): number {
  if (base <= 0) return 0;
  const { xp } = difficultyRewardScale(difficulty);
  return Math.max(1, Math.round(base * xp));
}

export function scaledCoins(base: number, difficulty?: string): number {
  if (base <= 0) return 0;
  const { coins } = difficultyRewardScale(difficulty);
  return Math.max(1, Math.round(base * coins));
}

/** Shown on difficulty pickers — per-correct and round-complete payouts. */
export function gameplayRewardsPreview(difficulty?: string) {
  return {
    perCorrect: {
      xp: scaledXp(XP.correctAnswer, difficulty),
      coins: scaledCoins(COINS.correctAnswer, difficulty),
    },
    quizComplete: {
      xp: scaledXp(XP.quizComplete, difficulty),
      coins: scaledCoins(COINS.quizComplete, difficulty),
    },
    perfectQuiz: {
      xp: scaledXp(XP.perfectQuiz, difficulty),
      coins: scaledCoins(COINS.perfectQuiz, difficulty),
    },
  };
}

/** Total XP required to reach a given level (level 1 = 0). */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.65));
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (level < 100 && xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function xpToNextLevel(xp: number): {
  level: number;
  current: number;
  needed: number;
  progress: number;
} {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceiling = level >= 100 ? floor : xpForLevel(level + 1);
  const current = xp - floor;
  const needed = Math.max(1, ceiling - floor);
  return {
    level,
    current,
    needed,
    progress: Math.min(1, current / needed),
  };
}

const GLOBAL_TITLES: [number, string][] = [
  [100, "Grandmaster"],
  [75, "Legend"],
  [50, "Master"],
  [35, "Expert"],
  [20, "Scholar"],
  [10, "Learner"],
  [5, "Explorer"],
  [1, "Beginner"],
];

export function globalTitle(level: number): string {
  for (const [min, title] of GLOBAL_TITLES) {
    if (level >= min) return title;
  }
  return "Beginner";
}

export function categoryTitle(slug: string, masteryPct: number): string {
  const base =
    {
      sports: "Sports Expert",
      entertainment: "Movie Master",
      history: "History Scholar",
      "science-and-nature": "Science Genius",
      geography: "World Traveler",
      "art-and-literature": "Culture Scholar",
      music: "Music Master",
      trivia: "Trivia Master",
      languages: "Polyglot",
    }[slug] ?? "Category Explorer";

  if (masteryPct >= 80) return base;
  if (masteryPct >= 40) return `Rising ${base.split(" ").pop() ?? "Star"}`;
  return "Knowledge Explorer";
}

export function streakBonusXp(streak: number): number {
  if (streak <= 1) return 0;
  return Math.min(streak * 2, 50);
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
