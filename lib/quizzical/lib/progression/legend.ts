import { isAtlasComplete, type AtlasSummary } from "./atlas";

export type LegendRequirements = {
  level: { current: number; required: number; met: boolean };
  discoveries: { current: number; required: number; met: boolean };
  categoriesMastered: { current: number; required: number; met: boolean };
  atlasComplete: { current: number; required: number; met: boolean };
  streak: { current: number; required: number; met: boolean };
  achievementScore: { current: number; required: number; met: boolean };
};

export type LegendStatus = {
  isLegend: boolean;
  legendNumber?: number;
  crownedAt?: string;
  eligible: boolean;
  progressPct: number;
  requirements: LegendRequirements;
  benefits: string[];
};

export const LEGEND_REQUIREMENTS = {
  level: 100,
  discoveries: 10000,
  categoriesMastered: 10,
  atlasPct: 95,
  streak: 100,
  achievementScore: 500,
} as const;

export const LEGEND_BENEFITS = [
  "👑 Unique Knowledge Legend badge",
  "🖼️ Exclusive gold profile frame",
  "🏛️ Permanent Hall of Fame entry",
  "✨ Exclusive profile theme",
  "⭐ Special leaderboard highlight",
];

export function evaluateLegendStatus(input: {
  level: number;
  discoveryCount: number;
  categoriesMastered: number;
  atlas: AtlasSummary;
  longestStreak: number;
  achievementScore: number;
  isLegend?: boolean;
  legendNumber?: number;
  crownedAt?: string;
}): LegendStatus {
  const requirements: LegendRequirements = {
    level: {
      current: input.level,
      required: LEGEND_REQUIREMENTS.level,
      met: input.level >= LEGEND_REQUIREMENTS.level,
    },
    discoveries: {
      current: input.discoveryCount,
      required: LEGEND_REQUIREMENTS.discoveries,
      met: input.discoveryCount >= LEGEND_REQUIREMENTS.discoveries,
    },
    categoriesMastered: {
      current: input.categoriesMastered,
      required: LEGEND_REQUIREMENTS.categoriesMastered,
      met: input.categoriesMastered >= LEGEND_REQUIREMENTS.categoriesMastered,
    },
    atlasComplete: {
      current: input.atlas.overallPct,
      required: LEGEND_REQUIREMENTS.atlasPct,
      met: isAtlasComplete(input.atlas, LEGEND_REQUIREMENTS.atlasPct),
    },
    streak: {
      current: input.longestStreak,
      required: LEGEND_REQUIREMENTS.streak,
      met: input.longestStreak >= LEGEND_REQUIREMENTS.streak,
    },
    achievementScore: {
      current: input.achievementScore,
      required: LEGEND_REQUIREMENTS.achievementScore,
      met: input.achievementScore >= LEGEND_REQUIREMENTS.achievementScore,
    },
  };

  const metCount = Object.values(requirements).filter((r) => r.met).length;
  const progressPct = Math.round((metCount / 6) * 100);
  const eligible = metCount === 6;

  return {
    isLegend: input.isLegend ?? false,
    legendNumber: input.legendNumber,
    crownedAt: input.crownedAt,
    eligible,
    progressPct,
    requirements,
    benefits: LEGEND_BENEFITS,
  };
}

export function countMasteredCategories(
  mastery: { slug: string; masteryPct: number }[],
  threshold = 80,
): number {
  return mastery.filter((m) => m.masteryPct >= threshold).length;
}

export function computeAchievementScore(
  unlockedAchievements: string[],
  unlockedBadges: string[],
  perfectQuizzes: number,
): number {
  return (
    unlockedAchievements.length * 25 +
    unlockedBadges.length * 15 +
    perfectQuizzes * 5
  );
}
