export type SeasonInfo = {
  seasonNumber: number;
  title: string;
  daysRemaining: number;
  isActive: boolean;
  userSeasonXp: number;
  userSeasonDiscoveries: number;
  userSeasonRank?: number;
};

export const SEASON_DURATION_DAYS = 30;

export function computeSeasonInfo(input: {
  seasonNumber: number;
  title: string;
  endsAt: Date;
  isActive: boolean;
  userSeasonXp: number;
  userSeasonDiscoveries: number;
  userSeasonRank?: number;
}): SeasonInfo {
  const now = Date.now();
  const daysRemaining = Math.max(
    0,
    Math.ceil((input.endsAt.getTime() - now) / (1000 * 60 * 60 * 24)),
  );
  return {
    seasonNumber: input.seasonNumber,
    title: input.title,
    daysRemaining,
    isActive: input.isActive,
    userSeasonXp: input.userSeasonXp,
    userSeasonDiscoveries: input.userSeasonDiscoveries,
    userSeasonRank: input.userSeasonRank,
  };
}

export const DEFAULT_SEASON: SeasonInfo = {
  seasonNumber: 1,
  title: "Season 1 — Rise of Explorers",
  daysRemaining: 30,
  isActive: true,
  userSeasonXp: 0,
  userSeasonDiscoveries: 0,
};
