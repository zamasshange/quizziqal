/** Central unlock registry — every gate, world, boss, and rare quiz. */

export type UnlockKind =
  | "world"
  | "quiz"
  | "picture_game"
  | "boss"
  | "rare"
  | "legendary"
  | "mastery"
  | "discovery"
  | "cosmetic";

export type UnlockRequirement =
  | { type: "level"; value: number }
  | { type: "discoveries"; value: number }
  | { type: "mastery"; category: string; pct: number }
  | { type: "discoveries_type"; discoveryType: string; value: number }
  | { type: "atlas_pct"; value: number }
  | { type: "achievement"; id: string }
  | { type: "streak"; value: number }
  | { type: "rank"; rankId: string };

export type UnlockDef = {
  id: string;
  kind: UnlockKind;
  title: string;
  description: string;
  emoji: string;
  href?: string;
  previewImage?: string;
  requirements: UnlockRequirement[];
  rewardXp?: number;
  rewardCoins?: number;
  sortOrder: number;
};

/** Level-gated worlds (category hubs). */
export const WORLD_UNLOCKS: UnlockDef[] = [
  {
    id: "world-geography",
    kind: "world",
    title: "Geography World",
    description: "Explore countries, capitals, landmarks, and flags.",
    emoji: "🌍",
    href: "/geography",
    requirements: [{ type: "level", value: 1 }],
    sortOrder: 1,
  },
  {
    id: "world-entertainment",
    kind: "world",
    title: "Entertainment Studio",
    description: "Movies, TV, music, and pop culture quizzes.",
    emoji: "🎬",
    href: "/entertainment",
    requirements: [{ type: "level", value: 3 }],
    sortOrder: 2,
  },
  {
    id: "world-sports",
    kind: "world",
    title: "Sports Arena",
    description: "Football, basketball, cricket, and sports legends.",
    emoji: "⚽",
    href: "/sports",
    requirements: [{ type: "level", value: 5 }],
    sortOrder: 3,
  },
  {
    id: "world-history",
    kind: "world",
    title: "History Archives",
    description: "Ancient civilizations, wars, and world leaders.",
    emoji: "📜",
    href: "/history",
    requirements: [{ type: "level", value: 8 }],
    sortOrder: 4,
  },
  {
    id: "world-science",
    kind: "world",
    title: "Science Laboratory",
    description: "Space, nature, chemistry, and the human body.",
    emoji: "🔬",
    href: "/science-and-nature",
    requirements: [{ type: "level", value: 10 }],
    sortOrder: 5,
  },
  {
    id: "world-culture",
    kind: "world",
    title: "Culture Quarter",
    description: "Art, literature, poetry, and mythology.",
    emoji: "🎨",
    href: "/art-and-literature",
    requirements: [{ type: "level", value: 12 }],
    sortOrder: 6,
  },
  {
    id: "world-languages",
    kind: "world",
    title: "Language Lounge",
    description: "Phrases, word origins, and language families.",
    emoji: "💬",
    href: "/languages",
    requirements: [{ type: "level", value: 15 }],
    sortOrder: 7,
  },
  {
    id: "world-boss-colosseum",
    kind: "world",
    title: "Boss Colosseum",
    description: "Ultimate challenges for elite explorers.",
    emoji: "👹",
    href: "/achievements",
    requirements: [{ type: "level", value: 25 }],
    sortOrder: 8,
  },
  {
    id: "world-legendary-vault",
    kind: "world",
    title: "Legendary Vault",
    description: "The rarest quizzes in Quizzical history.",
    emoji: "👑",
    href: "/knowledge-atlas",
    requirements: [{ type: "level", value: 50 }],
    sortOrder: 9,
  },
];

/** Picture guessing games — level gates. */
export const PICTURE_GAME_UNLOCKS: UnlockDef[] = [
  { id: "pic-celebrity", kind: "picture_game", title: "Guess the Celebrity", description: "Hollywood & pop culture icons", emoji: "🎭", href: "/play/celebrity", requirements: [{ type: "level", value: 1 }], sortOrder: 1 },
  { id: "pic-football", kind: "picture_game", title: "Guess the Footballer", description: "Soccer stars worldwide", emoji: "⚽", href: "/play/football", requirements: [{ type: "level", value: 3 }], sortOrder: 2 },
  { id: "pic-movie", kind: "picture_game", title: "Guess the Movie", description: "Iconic film scenes & posters", emoji: "🎬", href: "/play/movie", requirements: [{ type: "level", value: 5 }], sortOrder: 3 },
  { id: "pic-music", kind: "picture_game", title: "Guess the Music Artist", description: "Global music superstars", emoji: "🎵", href: "/play/music", requirements: [{ type: "level", value: 6 }], sortOrder: 4 },
  { id: "pic-basketball", kind: "picture_game", title: "Guess the Basketball Player", description: "NBA & world basketball", emoji: "🏀", href: "/play/basketball", requirements: [{ type: "level", value: 8 }], sortOrder: 5 },
  { id: "pic-athlete", kind: "picture_game", title: "Guess the Athlete", description: "Tennis, F1, swimming & more", emoji: "🏅", href: "/play/athlete", requirements: [{ type: "level", value: 10 }], sortOrder: 6 },
  { id: "pic-cricket", kind: "picture_game", title: "Guess the Cricketer", description: "International cricket legends", emoji: "🏏", href: "/play/cricket", requirements: [{ type: "level", value: 12 }], sortOrder: 7 },
];

/** Level-gated quizzes. */
export const QUIZ_UNLOCKS: UnlockDef[] = [
  { id: "quiz-sports-legends", kind: "quiz", title: "Sports Legends", description: "Elite athletes across every sport", emoji: "🏆", href: "/quiz/sports-legends", requirements: [{ type: "level", value: 5 }], sortOrder: 10 },
  { id: "quiz-famous-landmarks", kind: "quiz", title: "Famous Landmarks", description: "Iconic places around the world", emoji: "🗽", href: "/quiz/famous-landmarks", requirements: [{ type: "level", value: 5 }], sortOrder: 11 },
  { id: "quiz-flags", kind: "quiz", title: "Flags of the World", description: "195 countries — master every flag", emoji: "🏳️", href: "/quiz/flags-of-the-world", requirements: [{ type: "level", value: 8 }], sortOrder: 12 },
  { id: "quiz-world-war-two", kind: "quiz", title: "World War II", description: "The defining conflict of the 20th century", emoji: "⚔️", href: "/quiz/world-war-two", requirements: [{ type: "level", value: 15 }], sortOrder: 13 },
  { id: "quiz-ancient-history", kind: "quiz", title: "Ancient History", description: "Egypt, Greece, Rome, and beyond", emoji: "🏛️", href: "/quiz/ancient-history", requirements: [{ type: "level", value: 18 }], sortOrder: 14 },
  { id: "quiz-medieval-europe", kind: "quiz", title: "Medieval Europe", description: "Knights, kings, and castles", emoji: "🏰", href: "/quiz/medieval-europe", requirements: [{ type: "level", value: 22 }], sortOrder: 15 },
];

/** Boss challenges — high difficulty, high reward. */
export const BOSS_UNLOCKS: UnlockDef[] = [
  { id: "boss-ww2", kind: "boss", title: "WWII Boss Challenge", description: "Perfect score on World War II", emoji: "👹", href: "/quiz/world-war-two", requirements: [{ type: "level", value: 25 }, { type: "mastery", category: "history", pct: 40 }], rewardXp: 200, sortOrder: 20 },
  { id: "boss-flags", kind: "boss", title: "Flag Master Boss", description: "30 flags in one perfect round", emoji: "🏳️", href: "/quiz/flags-of-the-world", requirements: [{ type: "level", value: 20 }, { type: "discoveries_type", discoveryType: "country", value: 50 }], rewardXp: 150, sortOrder: 21 },
  { id: "boss-sports", kind: "boss", title: "Sports Colossus", description: "100 correct sports answers", emoji: "⚽", href: "/quiz/sports-legends", requirements: [{ type: "level", value: 30 }, { type: "mastery", category: "sports", pct: 60 }], rewardXp: 250, sortOrder: 22 },
];

/** Rare quizzes — special unlock conditions. */
export const RARE_UNLOCKS: UnlockDef[] = [
  { id: "rare-space", kind: "rare", title: "Space Explorers", description: "Rare cosmic knowledge challenge", emoji: "🚀", href: "/quiz/space-explorers", requirements: [{ type: "level", value: 12 }, { type: "discoveries", value: 100 }], sortOrder: 30 },
  { id: "rare-mythology", kind: "rare", title: "World Mythology", description: "Gods, heroes, and ancient tales", emoji: "⚡", href: "/quiz/world-mythology", requirements: [{ type: "level", value: 15 }, { type: "mastery", category: "history", pct: 30 }], sortOrder: 31 },
  { id: "rare-animation", kind: "rare", title: "Animation Classics", description: "Beloved animated films & shows", emoji: "🎞️", href: "/quiz/animation-classics", requirements: [{ type: "level", value: 18 }, { type: "discoveries_type", discoveryType: "movie", value: 25 }], sortOrder: 32 },
];

/** Legendary quizzes — endgame content. */
export const LEGENDARY_UNLOCKS: UnlockDef[] = [
  { id: "legendary-atlas", kind: "legendary", title: "Atlas Completion Run", description: "The ultimate knowledge marathon", emoji: "🗺️", href: "/knowledge-atlas", requirements: [{ type: "level", value: 50 }, { type: "atlas_pct", value: 50 }], sortOrder: 40 },
  { id: "legendary-blockbuster", kind: "legendary", title: "Blockbuster Franchises", description: "Cinematic universes & mega-hits", emoji: "🎬", href: "/quiz/blockbuster-franchises", requirements: [{ type: "level", value: 40 }, { type: "discoveries_type", discoveryType: "movie", value: 100 }], sortOrder: 41 },
  { id: "legendary-championship", kind: "legendary", title: "Knowledge Championship", description: "Compete for seasonal glory", emoji: "🏆", href: "/hall-of-fame", requirements: [{ type: "level", value: 35 }, { type: "streak", value: 14 }], sortOrder: 42 },
];

/** Category mastery unlocks. */
export const MASTERY_UNLOCKS: UnlockDef[] = [
  { id: "mastery-sports-expert", kind: "mastery", title: "Sports Expert Title", description: "80% mastery in Sports", emoji: "⚽", requirements: [{ type: "mastery", category: "sports", pct: 80 }], rewardXp: 100, sortOrder: 50 },
  { id: "mastery-history-scholar", kind: "mastery", title: "History Scholar Title", description: "80% mastery in History", emoji: "📜", requirements: [{ type: "mastery", category: "history", pct: 80 }], rewardXp: 100, sortOrder: 51 },
  { id: "mastery-science-genius", kind: "mastery", title: "Science Genius Title", description: "80% mastery in Science", emoji: "🔬", requirements: [{ type: "mastery", category: "science-and-nature", pct: 80 }], rewardXp: 100, sortOrder: 52 },
  { id: "mastery-geography-traveler", kind: "mastery", title: "World Traveler Title", description: "80% mastery in Geography", emoji: "🌍", requirements: [{ type: "mastery", category: "geography", pct: 80 }], rewardXp: 100, sortOrder: 53 },
];

/** Discovery-based unlocks. */
export const DISCOVERY_UNLOCKS: UnlockDef[] = [
  { id: "disc-50-countries", kind: "discovery", title: "Globe Trotter", description: "Discover 50 countries", emoji: "🌐", requirements: [{ type: "discoveries_type", discoveryType: "country", value: 50 }], rewardXp: 75, sortOrder: 60 },
  { id: "disc-100-facts", kind: "discovery", title: "Fact Collector", description: "100 total discoveries", emoji: "📚", requirements: [{ type: "discoveries", value: 100 }], rewardXp: 50, sortOrder: 61 },
  { id: "disc-500-facts", kind: "discovery", title: "Knowledge Vault", description: "500 total discoveries", emoji: "🏛️", requirements: [{ type: "discoveries", value: 500 }], rewardXp: 200, sortOrder: 62 },
];

export const ALL_UNLOCKS: UnlockDef[] = [
  ...WORLD_UNLOCKS,
  ...PICTURE_GAME_UNLOCKS,
  ...QUIZ_UNLOCKS,
  ...BOSS_UNLOCKS,
  ...RARE_UNLOCKS,
  ...LEGENDARY_UNLOCKS,
  ...MASTERY_UNLOCKS,
  ...DISCOVERY_UNLOCKS,
];

export function getUnlockById(id: string): UnlockDef | undefined {
  return ALL_UNLOCKS.find((u) => u.id === id);
}

export function getUnlockForQuiz(quizId: string): UnlockDef | undefined {
  return ALL_UNLOCKS.find((u) => u.href === `/quiz/${quizId}`);
}

export function getUnlockForPictureGame(slug: string): UnlockDef | undefined {
  return PICTURE_GAME_UNLOCKS.find((u) => u.href === `/play/${slug}`);
}

export function getUnlockForWorld(categorySlug: string): UnlockDef | undefined {
  return WORLD_UNLOCKS.find((u) => u.href === `/${categorySlug}`);
}
