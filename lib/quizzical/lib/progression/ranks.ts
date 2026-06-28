/** Ultimate Knowledge Rank ladder — displayed across profiles, leaderboards, and Hall of Fame. */

export type KnowledgeRankId =
  | "beginner"
  | "explorer"
  | "learner"
  | "scholar"
  | "expert"
  | "master"
  | "legend"
  | "grandmaster"
  | "knowledge-titan"
  | "knowledge-legend";

export type KnowledgeRank = {
  id: KnowledgeRankId;
  title: string;
  emoji: string;
  minLevel: number;
  minDiscoveries: number;
  tier: number;
};

export const KNOWLEDGE_RANKS: KnowledgeRank[] = [
  { id: "beginner", title: "Beginner", emoji: "🌱", minLevel: 1, minDiscoveries: 0, tier: 1 },
  { id: "explorer", title: "Explorer", emoji: "🧭", minLevel: 5, minDiscoveries: 25, tier: 2 },
  { id: "learner", title: "Learner", emoji: "📖", minLevel: 10, minDiscoveries: 75, tier: 3 },
  { id: "scholar", title: "Scholar", emoji: "🎓", minLevel: 20, minDiscoveries: 200, tier: 4 },
  { id: "expert", title: "Expert", emoji: "⭐", minLevel: 35, minDiscoveries: 500, tier: 5 },
  { id: "master", title: "Master", emoji: "🏅", minLevel: 50, minDiscoveries: 1000, tier: 6 },
  { id: "legend", title: "Legend", emoji: "🌟", minLevel: 65, minDiscoveries: 2500, tier: 7 },
  { id: "grandmaster", title: "Grandmaster", emoji: "♛", minLevel: 80, minDiscoveries: 5000, tier: 8 },
  { id: "knowledge-titan", title: "Knowledge Titan", emoji: "⚡", minLevel: 95, minDiscoveries: 8000, tier: 9 },
  { id: "knowledge-legend", title: "Knowledge Legend", emoji: "👑", minLevel: 100, minDiscoveries: 10000, tier: 10 },
];

export function computeKnowledgeRank(
  level: number,
  discoveryCount: number,
  isLegend = false,
): KnowledgeRank {
  if (isLegend) return KNOWLEDGE_RANKS[KNOWLEDGE_RANKS.length - 1]!;
  let current = KNOWLEDGE_RANKS[0]!;
  for (const rank of KNOWLEDGE_RANKS) {
    if (level >= rank.minLevel && discoveryCount >= rank.minDiscoveries) {
      current = rank;
    }
  }
  return current;
}

export function nextKnowledgeRank(current: KnowledgeRank): KnowledgeRank | null {
  const idx = KNOWLEDGE_RANKS.findIndex((r) => r.id === current.id);
  if (idx < 0 || idx >= KNOWLEDGE_RANKS.length - 1) return null;
  return KNOWLEDGE_RANKS[idx + 1] ?? null;
}
