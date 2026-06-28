/** Seasonal events framework — date-driven banners, themes, and copy. */

export type SeasonalEvent = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  accent: string;
  /** MMDD start (inclusive) */
  start: string;
  /** MMDD end (inclusive) */
  end: string;
  bonusLabel?: string;
};

const EVENTS: SeasonalEvent[] = [
  {
    id: "new-year",
    name: "New Year Knowledge Rush",
    emoji: "🎆",
    tagline: "Start the year strong — double XP on your first quiz each day!",
    accent: "#ffc83a",
    start: "0101",
    end: "0107",
    bonusLabel: "New Year bonus",
  },
  {
    id: "valentine",
    name: "Love of Learning",
    emoji: "💜",
    tagline: "Share trivia with friends and collect heart discoveries.",
    accent: "#b15bff",
    start: "0210",
    end: "0214",
  },
  {
    id: "spring",
    name: "Spring Explorer",
    emoji: "🌸",
    tagline: "Nature quizzes bloom with extra discovery rewards.",
    accent: "#1fb6a6",
    start: "0320",
    end: "0420",
  },
  {
    id: "world-cup",
    name: "World Cup Fever",
    emoji: "⚽",
    tagline: "Sports quizzes are hot — climb the leaderboard!",
    accent: "#ff9f43",
    start: "0610",
    end: "0715",
  },
  {
    id: "heritage-month",
    name: "Heritage Month",
    emoji: "🇿🇦",
    tagline: "Celebrate South African history, culture, and trivia.",
    accent: "#00a76d",
    start: "0901",
    end: "0930",
  },
  {
    id: "halloween",
    name: "Spooky Trivia Night",
    emoji: "🎃",
    tagline: "History and mystery quizzes with a frightful twist.",
    accent: "#ff6b6b",
    start: "1025",
    end: "1031",
  },
  {
    id: "festive",
    name: "Festive Quiz Marathon",
    emoji: "🎄",
    tagline: "Daily missions shine brighter — keep your streak alive!",
    accent: "#c0392b",
    start: "1215",
    end: "1231",
  },
];

function todayMmDd(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${m}${day}`;
}

function inRange(mmdd: string, start: string, end: string): boolean {
  if (start <= end) return mmdd >= start && mmdd <= end;
  return mmdd >= start || mmdd <= end;
}

export function getActiveSeasonalEvent(now = new Date()): SeasonalEvent | null {
  const mmdd = todayMmDd(now);
  return EVENTS.find((e) => inRange(mmdd, e.start, e.end)) ?? null;
}

export function getAllSeasonalEvents(): SeasonalEvent[] {
  return EVENTS;
}
