import { categories } from "@/lib/quizzes";
import { ACHIEVEMENTS, BADGES } from "./achievements";
import { classifyDiscovery, generateDailyMissions } from "./missions";
import { checkNewUnlocks } from "./unlockEngine";
import {
  PROGRESSION_MILESTONE_EVENTS,
  hydrateStarterUnlocks,
} from "./unlockCelebrations";
import { newlyUnlockedMilestones } from "./milestones";
import { buildFullProgressionState } from "./buildState";
import type {
  CategoryMastery,
  DailyMission,
  ProgressionEventPayload,
  ProgressionEventResult,
  ProgressionState,
  UserAchievement,
  UserDiscovery,
} from "./types";
import {
  COINS,
  XP,
  categoryTitle,
  globalTitle,
  levelFromXp,
  scaledCoins,
  scaledXp,
  streakBonusXp,
  todayKey,
  xpToNextLevel,
} from "./xp";
import { DEFAULT_COUNTRY } from "./countries";

const STORAGE_KEY = "quizzical-progression";

type RawState = {
  xp: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayDate: string | null;
  countryCode: string;
  discoveries: UserDiscovery[];
  mastery: Record<string, { answered: number; correct: number }>;
  unlockedAchievements: string[];
  unlockedBadges: string[];
  missions: ReturnType<typeof generateDailyMissions>;
  missionDate: string;
  stats: ProgressionState["stats"];
  firstQuizToday: boolean;
  unlockedItems: string[];
  kingdomId: string | null;
  loginStreak: number;
  lastLoginDate: string | null;
  dailyRewardClaimedDate: string | null;
  claimedDiscoveryMilestones: string[];
  isLegend: boolean;
  legendNumber?: number;
  crownedAt?: string;
  seasonXp: number;
  seasonDiscoveries: number;
  season?: import("./seasons").SeasonInfo;
};

function defaultRaw(countryCode = DEFAULT_COUNTRY): RawState {
  const today = todayKey();
  const raw: RawState = {
    xp: 0,
    coins: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPlayDate: null,
    countryCode,
    discoveries: [],
    mastery: {},
    unlockedAchievements: [],
    unlockedBadges: [],
    missions: generateDailyMissions(today),
    missionDate: today,
    stats: {
      totalCorrect: 0,
      totalAnswered: 0,
      quizzesCompleted: 0,
      perfectQuizzes: 0,
    },
    firstQuizToday: false,
    unlockedItems: [],
    kingdomId: null,
    loginStreak: 0,
    lastLoginDate: null,
    dailyRewardClaimedDate: null,
    claimedDiscoveryMilestones: [],
    isLegend: false,
    seasonXp: 0,
    seasonDiscoveries: 0,
  };
  hydrateStarterUnlocks(raw);
  return raw;
}

function buildMastery(raw: RawState): CategoryMastery[] {
  return categories.map((cat) => {
    const m = raw.mastery[cat.slug] ?? { answered: 0, correct: 0 };
    const masteryPct =
      m.answered > 0
        ? Math.min(100, Math.round((m.correct / Math.max(m.answered, 1)) * 100))
        : 0;
    return {
      slug: cat.slug,
      answered: m.answered,
      correct: m.correct,
      masteryPct,
      title: categoryTitle(cat.slug, masteryPct),
    };
  });
}

function buildAchievements(raw: RawState): UserAchievement[] {
  const geoDiscoveries = raw.discoveries.filter(
    (d) => d.discoveryType === "country" || d.discoveryType === "landmark",
  ).length;
  const histDiscoveries = raw.discoveries.filter(
    (d) => d.discoveryType === "historical_figure",
  ).length;
  const sportsCorrect = raw.mastery.sports?.correct ?? 0;
  const entQuizzes = raw.stats.quizzesCompleted; // simplified
  const sciMastery =
    buildMastery(raw).find((m) => m.slug === "science-and-nature")?.masteryPct ?? 0;
  const level = levelFromXp(raw.xp);

  const metrics: Record<string, number> = {
    discoveries_geography: geoDiscoveries,
    correct_sports: sportsCorrect,
    quizzes_entertainment: entQuizzes,
    discoveries_history: histDiscoveries,
    "mastery_science-and-nature": sciMastery,
    longest_streak: raw.longestStreak,
    discovery_count: raw.discoveries.length,
    perfect_quizzes: raw.stats.perfectQuizzes,
    quizzes_completed: raw.stats.quizzesCompleted,
    level,
  };

  return ACHIEVEMENTS.map((a) => {
    const progress = metrics[a.metric] ?? 0;
    const unlocked = raw.unlockedAchievements.includes(a.id);
    return {
      ...a,
      progress,
      unlocked,
      unlockedAt: unlocked ? Date.now() : undefined,
    };
  });
}

function buildBadges(raw: RawState) {
  return BADGES.filter((b) => raw.unlockedBadges.includes(b.id)).map((b) => ({
    id: b.id,
    label: b.label,
    emoji: b.emoji,
  }));
}

export function toProgressionState(raw: RawState): ProgressionState {
  const level = levelFromXp(raw.xp);
  return {
    xp: raw.xp,
    level,
    title: globalTitle(level),
    coins: raw.coins,
    currentStreak: raw.currentStreak,
    longestStreak: raw.longestStreak,
    countryCode: raw.countryCode,
    discoveries: raw.discoveries,
    discoveryCount: raw.discoveries.length,
    mastery: buildMastery(raw),
    missions:
      raw.missionDate === todayKey()
        ? raw.missions
        : generateDailyMissions(todayKey()),
    achievements: buildAchievements(raw),
    badges: buildBadges(raw),
    stats: raw.stats,
  };
}

export function loadRawState(): RawState {
  if (typeof window === "undefined") return defaultRaw();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultRaw();
    const parsed = JSON.parse(raw) as RawState;
    if (parsed.missionDate !== todayKey()) {
      parsed.missions = generateDailyMissions(todayKey());
      parsed.missionDate = todayKey();
      parsed.firstQuizToday = false;
    }
    const merged = { ...defaultRaw(), ...parsed };
    hydrateStarterUnlocks(merged);
    return merged;
  } catch {
    return defaultRaw();
  }
}

export function saveRawState(raw: RawState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
  } catch {
    /* quota */
  }
}

const STREAK_MILESTONES = [3, 7, 14, 30, 100];

function updateStreak(raw: RawState): number | undefined {
  const today = todayKey();
  if (raw.lastPlayDate === today) return undefined;

  const prev = raw.currentStreak;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);

  if (raw.lastPlayDate === yKey) {
    raw.currentStreak += 1;
  } else if (raw.lastPlayDate !== today) {
    raw.currentStreak = 1;
  }

  raw.longestStreak = Math.max(raw.longestStreak, raw.currentStreak);
  raw.lastPlayDate = today;

  for (const m of STREAK_MILESTONES) {
    if (raw.currentStreak === m && prev < m) return m;
  }
  return undefined;
}

function bumpMission(
  raw: RawState,
  missionId: string,
  amount = 1,
): DailyMission | null {
  let justCompleted: DailyMission | null = null;
  raw.missions = raw.missions.map((m) => {
    if (m.id !== missionId) return m;
    const wasDone = m.completed;
    const progress = Math.min(m.target, m.progress + amount);
    const next = { ...m, progress, completed: progress >= m.target };
    if (next.completed && !wasDone) justCompleted = next;
    return next;
  });
  return justCompleted;
}

function checkAchievements(raw: RawState): string[] {
  const state = toProgressionState(raw);
  const newly: string[] = [];
  for (const a of state.achievements) {
    if (!a.unlocked && a.progress >= a.target) {
      raw.unlockedAchievements.push(a.id);
      newly.push(a.id);
    }
  }
  return newly;
}

function checkBadges(raw: RawState): string[] {
  const level = levelFromXp(raw.xp);
  const newly: string[] = [];
  const tryUnlock = (id: string, cond: boolean) => {
    if (cond && !raw.unlockedBadges.includes(id)) {
      raw.unlockedBadges.push(id);
      newly.push(id);
    }
  };

  tryUnlock("explorer", level >= 5);
  tryUnlock("genius", level >= 35);
  tryUnlock("champion", level >= 50);
  tryUnlock("streak-master", raw.longestStreak >= 30);
  tryUnlock("world-traveler", raw.unlockedAchievements.includes("world-traveler"));
  tryUnlock("movie-buff", raw.unlockedAchievements.includes("movie-buff"));
  tryUnlock("music-master", raw.unlockedAchievements.includes("music-master"));

  const sports = raw.mastery.sports;
  if (sports && sports.answered > 0) {
    const pct = (sports.correct / sports.answered) * 100;
    tryUnlock("sports-expert", pct >= 50 && sports.correct >= 50);
  }

  return newly;
}

export function applyProgressionEvent(
  raw: RawState,
  payload: ProgressionEventPayload,
  options?: { persistLocal?: boolean },
): ProgressionEventResult {
  const prevLevel = levelFromXp(raw.xp);
  let xpEarned = 0;
  let coinsEarned = 0;
  let streakBonus = 0;
  let discovery: (UserDiscovery & { isNew: boolean }) | undefined;
  const missionsCompleted: { id: string; label: string; emoji: string }[] = [];

  const streakMilestone = updateStreak(raw);

  function trackMission(missionId: string, amount = 1) {
    const done = bumpMission(raw, missionId, amount);
    if (done) {
      missionsCompleted.push({
        id: done.id,
        label: done.label,
        emoji: done.emoji,
      });
    }
  }

  if (payload.type === "correct_answer") {
    xpEarned += scaledXp(XP.correctAnswer, payload.difficulty);
    coinsEarned += scaledCoins(COINS.correctAnswer, payload.difficulty);
    raw.stats.totalCorrect += 1;
    raw.stats.totalAnswered += 1;

    if (payload.quizCategory) {
      const m = raw.mastery[payload.quizCategory] ?? { answered: 0, correct: 0 };
      m.answered += 1;
      m.correct += 1;
      raw.mastery[payload.quizCategory] = m;
    }

    trackMission("answer-10");
    trackMission("correct-10");

    if (payload.term) {
      const exists = raw.discoveries.some(
        (d) => d.term.toLowerCase() === payload.term!.toLowerCase(),
      );
      if (!exists) {
        const d: UserDiscovery = {
          term: payload.term,
          category: payload.category ?? payload.quizCategory ?? "general",
          discoveryType: classifyDiscovery(
            payload.category ?? "",
            payload.quizCategory,
          ),
          quizId: payload.quizId,
          discoveredAt: Date.now(),
        };
        raw.discoveries.unshift(d);
        if (raw.discoveries.length > 2000) raw.discoveries.length = 2000;
        xpEarned += scaledXp(XP.newDiscovery, payload.difficulty);
        coinsEarned += scaledCoins(COINS.newDiscovery, payload.difficulty);
        discovery = { ...d, isNew: true };
        trackMission("learn-5");
      }
    }
  }

  if (payload.type === "wrong_answer") {
    raw.stats.totalAnswered += 1;
    if (payload.quizCategory) {
      const m = raw.mastery[payload.quizCategory] ?? { answered: 0, correct: 0 };
      m.answered += 1;
      raw.mastery[payload.quizCategory] = m;
    }
    trackMission("answer-10");
  }

  if (payload.type === "quiz_complete") {
    xpEarned += scaledXp(XP.quizComplete, payload.difficulty);
    coinsEarned += scaledCoins(COINS.quizComplete, payload.difficulty);
    raw.stats.quizzesCompleted += 1;
    trackMission("complete-3");

    if (!raw.firstQuizToday) {
      xpEarned += XP.firstQuizOfDay;
      raw.firstQuizToday = true;
    }

    if (payload.quizCategory === "sports") trackMission("sports-3");

    if (payload.correct === payload.total && (payload.total ?? 0) > 0) {
      xpEarned += scaledXp(XP.perfectQuiz, payload.difficulty);
      coinsEarned += scaledCoins(COINS.perfectQuiz, payload.difficulty);
      raw.stats.perfectQuizzes += 1;
    }
  }

  if (payload.type === "daily_challenge") {
    xpEarned += XP.dailyChallenge;
    trackMission("daily-challenge", 1);
  }

  if (payload.type === "mission_complete" && payload.missionId) {
    const mission = raw.missions.find((m) => m.id === payload.missionId);
    if (mission?.completed && !mission.claimed) {
      xpEarned += mission.rewardXp;
      coinsEarned += mission.rewardCoins;
      mission.claimed = true;
    }
  }

  for (const done of missionsCompleted) {
    const mission = raw.missions.find((m) => m.id === done.id);
    if (mission?.completed && !mission.claimed) {
      xpEarned += mission.rewardXp;
      coinsEarned += mission.rewardCoins;
      mission.claimed = true;
    }
  }

  streakBonus = streakBonusXp(raw.currentStreak);
  xpEarned += streakBonus;
  if (raw.currentStreak > 1) coinsEarned += COINS.streakDay;

  raw.xp += xpEarned;
  raw.coins += coinsEarned;

  const achievementsUnlocked = checkAchievements(raw);
  const badgesUnlocked = checkBadges(raw);

  const milestonesReady = newlyUnlockedMilestones(
    raw.discoveries.length,
    raw.claimedDiscoveryMilestones ?? [],
  );
  const milestonesUnlocked = milestonesReady.map((m) => m.id);

  const isMilestone = PROGRESSION_MILESTONE_EVENTS.has(payload.type);
  const unlocksEarned = isMilestone ? checkNewUnlocks(raw).ids : [];

  if (xpEarned > 0) raw.seasonXp = (raw.seasonXp ?? 0) + xpEarned;
  if (discovery?.isNew) raw.seasonDiscoveries = (raw.seasonDiscoveries ?? 0) + 1;

  let becameLegend = false;
  let legendNumber: number | undefined;
  if (!raw.isLegend) {
    const full = buildFullProgressionState(raw);
    if (full.legend?.eligible) {
      raw.isLegend = true;
      raw.legendNumber = 1;
      raw.crownedAt = new Date().toISOString();
      becameLegend = true;
      legendNumber = 1;
    }
  }

  const newLevel = levelFromXp(raw.xp);
  const leveledUp = newLevel > prevLevel;

  if (options?.persistLocal !== false && typeof window !== "undefined") {
    saveRawState(raw);
  }

  return {
    eventType: payload.type,
    xpEarned,
    coinsEarned,
    leveledUp: isMilestone && leveledUp,
    newLevel: isMilestone && leveledUp ? newLevel : undefined,
    newTitle: isMilestone && leveledUp ? globalTitle(newLevel) : undefined,
    discovery,
    achievementsUnlocked: isMilestone ? achievementsUnlocked : [],
    badgesUnlocked: isMilestone ? badgesUnlocked : [],
    unlocksEarned,
    streakBonus,
    missionsCompleted,
    streakMilestone,
    milestonesUnlocked,
    becameLegend: becameLegend || undefined,
    legendNumber,
    state: buildFullProgressionState(raw),
  };
}

export function getDefaultProgressionState(countryCode?: string): ProgressionState {
  return buildFullProgressionState(defaultRaw(countryCode));
}

export { xpToNextLevel, STORAGE_KEY };
export type { RawState };
