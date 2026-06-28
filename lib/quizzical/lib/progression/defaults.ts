import { DEFAULT_COUNTRY } from "./countries";
import { generateDailyMissions } from "./missions";
import { hydrateStarterUnlocks } from "./unlockCelebrations";
import { todayKey } from "./xp";
import type { RawState } from "./engine";

export function createEmptyRaw(countryCode = DEFAULT_COUNTRY): RawState {
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
