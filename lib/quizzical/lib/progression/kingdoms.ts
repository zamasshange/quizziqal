export type Kingdom = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  quizCategories: string[];
};

export const KINGDOMS: Kingdom[] = [
  {
    id: "explorers",
    name: "Explorers Kingdom",
    emoji: "🌍",
    description: "Geography, travel, and world knowledge",
    color: "#4d8dff",
    quizCategories: ["geography", "trivia"],
  },
  {
    id: "sports",
    name: "Sports Kingdom",
    emoji: "⚽",
    description: "Athletes, football, basketball, cricket, and more",
    color: "#00a76d",
    quizCategories: ["sports"],
  },
  {
    id: "entertainment",
    name: "Entertainment Kingdom",
    emoji: "🎬",
    description: "Movies, TV, celebrities, and pop culture",
    color: "#b15bff",
    quizCategories: ["entertainment"],
  },
  {
    id: "history",
    name: "History Kingdom",
    emoji: "📜",
    description: "Ancient worlds, wars, and historical figures",
    color: "#c98a3a",
    quizCategories: ["history"],
  },
  {
    id: "science",
    name: "Science Kingdom",
    emoji: "🔬",
    description: "Nature, chemistry, space, and discovery",
    color: "#1fb6a6",
    quizCategories: ["science-and-nature"],
  },
  {
    id: "music",
    name: "Music Kingdom",
    emoji: "🎵",
    description: "Artists, genres, and music mastery",
    color: "#ff6b6b",
    quizCategories: ["entertainment"],
  },
];

export function getKingdom(id: string | null | undefined): Kingdom | undefined {
  if (!id) return undefined;
  return KINGDOMS.find((k) => k.id === id);
}

export type KingdomLeaderboardEntry = {
  kingdomId: string;
  totalXp: number;
  totalDiscoveries: number;
  memberCount: number;
};
