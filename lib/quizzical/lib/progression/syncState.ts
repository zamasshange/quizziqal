import type { ProgressionState } from "./types";
import type { RawState } from "./engine";
import { buildFullProgressionState } from "./buildState";

function mergeMastery(
  local: RawState["mastery"],
  remote: RawState["mastery"],
): RawState["mastery"] {
  const keys = new Set([...Object.keys(local), ...Object.keys(remote)]);
  const out: RawState["mastery"] = {};
  for (const slug of keys) {
    const l = local[slug] ?? { answered: 0, correct: 0 };
    const r = remote[slug] ?? { answered: 0, correct: 0 };
    out[slug] = {
      answered: Math.max(l.answered, r.answered),
      correct: Math.max(l.correct, r.correct),
    };
  }
  return out;
}

/** Keep the most advanced copy when local and server diverge (e.g. mid-session sync). */
export function mergeRawStates(local: RawState, remote: RawState): RawState {
  const discoveries =
    remote.discoveries.length > local.discoveries.length
      ? remote.discoveries
      : local.discoveries;

  const unlockedItems = [
    ...new Set([...(local.unlockedItems ?? []), ...(remote.unlockedItems ?? [])]),
  ];

  const unlockedAchievements =
    remote.unlockedAchievements.length >= local.unlockedAchievements.length
      ? remote.unlockedAchievements
      : local.unlockedAchievements;

  const unlockedBadges =
    remote.unlockedBadges.length >= local.unlockedBadges.length
      ? remote.unlockedBadges
      : local.unlockedBadges;

  const stats =
    remote.stats.totalAnswered >= local.stats.totalAnswered
      ? remote.stats
      : local.stats;

  return {
    ...local,
    ...remote,
    xp: Math.max(local.xp, remote.xp),
    coins: Math.max(local.coins, remote.coins),
    currentStreak: Math.max(local.currentStreak, remote.currentStreak),
    longestStreak: Math.max(local.longestStreak, remote.longestStreak),
    discoveries,
    mastery: mergeMastery(local.mastery, remote.mastery),
    stats,
    unlockedItems,
    unlockedAchievements,
    unlockedBadges,
    seasonXp: Math.max(local.seasonXp ?? 0, remote.seasonXp ?? 0),
    seasonDiscoveries: Math.max(
      local.seasonDiscoveries ?? 0,
      remote.seasonDiscoveries ?? 0,
    ),
    isLegend: local.isLegend || remote.isLegend,
    legendNumber: local.legendNumber ?? remote.legendNumber,
    crownedAt: local.crownedAt ?? remote.crownedAt,
    missionDate: local.missionDate,
    firstQuizToday: local.firstQuizToday,
    lastLoginDate: local.lastLoginDate,
    dailyRewardClaimedDate: local.dailyRewardClaimedDate,
    claimedDiscoveryMilestones: local.claimedDiscoveryMilestones ?? [],
  };
}

function progressionStateToRaw(
  api: ProgressionState,
  local: RawState,
): RawState {
  return {
    ...local,
    xp: api.xp,
    coins: api.coins,
    currentStreak: api.currentStreak,
    longestStreak: api.longestStreak,
    countryCode: api.countryCode,
    discoveries: api.discoveries,
    mastery: Object.fromEntries(
      api.mastery.map((m) => [m.slug, { answered: m.answered, correct: m.correct }]),
    ),
    unlockedAchievements: api.achievements
      .filter((a) => a.unlocked)
      .map((a) => a.id),
    unlockedBadges: api.badges.map((b) => b.id),
    missions: api.missions,
    stats: api.stats,
    unlockedItems: api.unlockedItemIds ?? local.unlockedItems ?? [],
    kingdomId: api.kingdom?.id ?? local.kingdomId,
    loginStreak: api.loginStreak ?? local.loginStreak,
    isLegend: api.legend?.isLegend ?? local.isLegend,
    legendNumber: api.legend?.legendNumber ?? local.legendNumber,
    crownedAt: api.legend?.crownedAt ?? local.crownedAt,
    seasonXp: api.season?.userSeasonXp ?? local.seasonXp ?? 0,
    seasonDiscoveries: api.season?.userSeasonDiscoveries ?? local.seasonDiscoveries ?? 0,
    season: api.season ?? local.season,
  };
}

/** Rebuild full progression (incl. unlocks) from API state + persist raw for consistency. */
export function syncProgressionState(
  api: ProgressionState,
  local: RawState,
): ProgressionState {
  const remote = progressionStateToRaw(api, local);
  return buildFullProgressionState(mergeRawStates(local, remote));
}

/** Ensure unlocks are always computed — never trust a partial API payload. */
export function ensureUnlocks(state: ProgressionState, raw: RawState): ProgressionState {
  const full = buildFullProgressionState(raw);
  return {
    ...state,
    xp: full.xp,
    level: full.level,
    coins: full.coins,
    unlocks: full.unlocks,
    nextUnlock: full.nextUnlock,
  };
}
