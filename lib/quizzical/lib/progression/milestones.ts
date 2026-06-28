/** Discovery milestone rewards — major long-term goals. */

export type DiscoveryMilestone = {
  id: string;
  label: string;
  emoji: string;
  target: number;
  rewardXp: number;
  rewardCoins: number;
  badgeId?: string;
};

export const DISCOVERY_MILESTONES: DiscoveryMilestone[] = [
  { id: "d100", label: "Curious Mind", emoji: "🔍", target: 100, rewardXp: 100, rewardCoins: 25 },
  { id: "d500", label: "Knowledge Seeker", emoji: "📚", target: 500, rewardXp: 300, rewardCoins: 75 },
  { id: "d1000", label: "Discovery Master", emoji: "🌟", target: 1000, rewardXp: 750, rewardCoins: 150 },
  { id: "d5000", label: "World Scholar", emoji: "🌍", target: 5000, rewardXp: 2000, rewardCoins: 400 },
  { id: "d10000", label: "Atlas Pioneer", emoji: "🗺️", target: 10000, rewardXp: 5000, rewardCoins: 1000, badgeId: "atlas-pioneer" },
];

export type MilestoneView = DiscoveryMilestone & {
  progress: number;
  unlocked: boolean;
  claimed: boolean;
};

export function buildDiscoveryMilestones(
  discoveryCount: number,
  claimed: string[],
): MilestoneView[] {
  return DISCOVERY_MILESTONES.map((m) => ({
    ...m,
    progress: Math.min(discoveryCount, m.target),
    unlocked: discoveryCount >= m.target,
    claimed: claimed.includes(m.id),
  }));
}

export function newlyUnlockedMilestones(
  discoveryCount: number,
  claimed: string[],
): DiscoveryMilestone[] {
  return DISCOVERY_MILESTONES.filter(
    (m) => discoveryCount >= m.target && !claimed.includes(m.id),
  );
}
