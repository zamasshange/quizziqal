/** Category-specific visual + audio themes for immersive game atmosphere. */

export type CategoryTheme = {
  slug: string;
  emojis: string[];
  orbColors: string[];
  particleColor: string;
  ambientFreq: number;
  ambientMod: number;
};

const DEFAULT: CategoryTheme = {
  slug: "default",
  emojis: ["🎯", "🧠", "✨", "🏆"],
  orbColors: ["#5b19df", "#ffc83a", "#3a0ca3"],
  particleColor: "#ffc83a",
  ambientFreq: 220,
  ambientMod: 0.35,
};

const THEMES: Record<string, CategoryTheme> = {
  geography: {
    slug: "geography",
    emojis: ["🌍", "🗺️", "🏙️", "🧭", "🏔️"],
    orbColors: ["#4d8dff", "#00a76d", "#ffc83a"],
    particleColor: "#4d8dff",
    ambientFreq: 196,
    ambientMod: 0.3,
  },
  sports: {
    slug: "sports",
    emojis: ["⚽", "🏀", "🏆", "🥇", "🏟️"],
    orbColors: ["#ff9f43", "#ff6b6b", "#ffc83a"],
    particleColor: "#ff9f43",
    ambientFreq: 246.94,
    ambientMod: 0.38,
  },
  entertainment: {
    slug: "entertainment",
    emojis: ["🎬", "🎭", "🎤", "⭐", "🍿"],
    orbColors: ["#b15bff", "#ff6b6b", "#ffc83a"],
    particleColor: "#b15bff",
    ambientFreq: 261.63,
    ambientMod: 0.32,
  },
  history: {
    slug: "history",
    emojis: ["📜", "🏛️", "⚔️", "👑", "🕰️"],
    orbColors: ["#c98a3a", "#8b4513", "#ffc83a"],
    particleColor: "#c98a3a",
    ambientFreq: 174.61,
    ambientMod: 0.28,
  },
  "science-and-nature": {
    slug: "science-and-nature",
    emojis: ["🔬", "🚀", "🧬", "🌿", "⚛️"],
    orbColors: ["#1fb6a6", "#4d8dff", "#00a76d"],
    particleColor: "#1fb6a6",
    ambientFreq: 233.08,
    ambientMod: 0.33,
  },
  "art-and-literature": {
    slug: "art-and-literature",
    emojis: ["🎨", "📚", "✍️", "🖼️", "🎭"],
    orbColors: ["#ff6b6b", "#b15bff", "#ffc83a"],
    particleColor: "#ff6b6b",
    ambientFreq: 207.65,
    ambientMod: 0.3,
  },
  languages: {
    slug: "languages",
    emojis: ["💬", "🗣️", "🌐", "📝", "🔤"],
    orbColors: ["#00a76d", "#4d8dff", "#ffc83a"],
    particleColor: "#00a76d",
    ambientFreq: 220,
    ambientMod: 0.3,
  },
  trivia: {
    slug: "trivia",
    emojis: ["🧠", "💡", "❓", "🎲", "✨"],
    orbColors: ["#ffc24b", "#5b19df", "#ff6b6b"],
    particleColor: "#ffc24b",
    ambientFreq: 246.94,
    ambientMod: 0.34,
  },
};

export function getCategoryTheme(slug?: string): CategoryTheme {
  if (!slug) return DEFAULT;
  if (slug === "home") return HOME_THEME;
  return THEMES[slug] ?? DEFAULT;
}

export const HOME_THEME: CategoryTheme = {
  slug: "home",
  emojis: ["🎯", "🧠", "🏆", "✨", "🔥", "📚"],
  orbColors: ["#3a0ca3", "#5b19df", "#ffc83a"],
  particleColor: "#ffc83a",
  ambientFreq: 220,
  ambientMod: 0.25,
};
