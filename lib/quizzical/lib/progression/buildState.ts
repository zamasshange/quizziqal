import { toProgressionState, type RawState } from "./engine";
import { computeAtlasProgress } from "./atlas";
import { buildDailyRewardStatus, processDailyLogin } from "./dailyRewards";
import {
  computeAchievementScore,
  countMasteredCategories,
  evaluateLegendStatus,
} from "./legend";
import { getKingdom } from "./kingdoms";
import { buildDiscoveryMilestones } from "./milestones";
import { computeKnowledgeRank } from "./ranks";
import { DEFAULT_SEASON } from "./seasons";
import { evaluateAllUnlocks, findNextUnlock } from "./unlockEngine";
import { levelFromXp } from "./xp";
import type { ProgressionState } from "./types";

/** Merge raw storage + computed unlock/atlas/legend state for API + client. */
export function buildFullProgressionState(raw: RawState): ProgressionState {
  const base = toProgressionState(raw);
  const atlas = computeAtlasProgress(raw.discoveries);
  const level = levelFromXp(raw.xp);
  const achievementScore = computeAchievementScore(
    raw.unlockedAchievements,
    raw.unlockedBadges,
    raw.stats.perfectQuizzes,
  );
  const categoriesMastered = countMasteredCategories(base.mastery);
  const knowledgeRank = computeKnowledgeRank(
    level,
    raw.discoveries.length,
    raw.isLegend,
  );
  const legend = evaluateLegendStatus({
    level,
    discoveryCount: raw.discoveries.length,
    categoriesMastered,
    atlas,
    longestStreak: raw.longestStreak,
    achievementScore,
    isLegend: raw.isLegend,
    legendNumber: raw.legendNumber,
    crownedAt: raw.crownedAt,
  });
  const login = processDailyLogin(
    raw.lastLoginDate,
    raw.loginStreak,
    raw.dailyRewardClaimedDate,
  );
  const dailyReward = buildDailyRewardStatus(
    login.loginStreak,
    raw.dailyRewardClaimedDate,
  );
  const kingdom = getKingdom(raw.kingdomId);

  return {
    ...base,
    knowledgeRank: knowledgeRank.title,
    knowledgeRankId: knowledgeRank.id,
    knowledgeRankTier: knowledgeRank.tier,
    knowledgeRankEmoji: knowledgeRank.emoji,
    achievementScore,
    atlas,
    legend,
    kingdom: kingdom
      ? { id: kingdom.id, name: kingdom.name, emoji: kingdom.emoji, color: kingdom.color }
      : null,
    season: raw.season ?? DEFAULT_SEASON,
    dailyReward,
    loginStreak: login.loginStreak,
    unlocks: evaluateAllUnlocks(raw),
    nextUnlock: findNextUnlock(raw),
    discoveryMilestones: buildDiscoveryMilestones(
      raw.discoveries.length,
      raw.claimedDiscoveryMilestones ?? [],
    ),
    unlockedItemIds: raw.unlockedItems ?? [],
  };
}
