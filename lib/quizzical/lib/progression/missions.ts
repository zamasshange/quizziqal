import type { DailyMission, DiscoveryType } from "./types";
import { todayKey } from "./xp";

const MISSION_POOL: Omit<DailyMission, "progress" | "completed" | "claimed">[] = [
  {
    id: "answer-10",
    label: "Answer 10 questions",
    emoji: "✅",
    target: 10,
    rewardXp: 30,
    rewardCoins: 5,
  },
  {
    id: "learn-5",
    label: "Learn 5 new discoveries",
    emoji: "🔍",
    target: 5,
    rewardXp: 40,
    rewardCoins: 8,
  },
  {
    id: "sports-3",
    label: "Play 3 sports quizzes",
    emoji: "⚽",
    target: 3,
    rewardXp: 35,
    rewardCoins: 6,
  },
  {
    id: "correct-10",
    label: "Get 10 correct answers",
    emoji: "🎯",
    target: 10,
    rewardXp: 35,
    rewardCoins: 6,
  },
  {
    id: "complete-3",
    label: "Complete 3 quizzes",
    emoji: "🏁",
    target: 3,
    rewardXp: 45,
    rewardCoins: 10,
  },
  {
    id: "daily-challenge",
    label: "Complete the daily challenge",
    emoji: "📅",
    target: 1,
    rewardXp: 50,
    rewardCoins: 12,
  },
];

function hashDate(date: string): number {
  let h = 0;
  for (let i = 0; i < date.length; i++) h = (h * 31 + date.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function generateDailyMissions(
  date = todayKey(),
  existing?: DailyMission[],
): DailyMission[] {
  if (existing?.length && existing[0]?.id) {
    const first = existing[0] as DailyMission & { date?: string };
    if ((first as { missionDate?: string }).missionDate === date) return existing;
  }

  const h = hashDate(date);
  const picked = new Set<number>();
  const missions: DailyMission[] = [];

  while (missions.length < 3 && picked.size < MISSION_POOL.length) {
    const idx = (h + picked.size * 7) % MISSION_POOL.length;
    if (picked.has(idx)) continue;
    picked.add(idx);
    const m = MISSION_POOL[idx];
    missions.push({
      ...m,
      progress: 0,
      completed: false,
      claimed: false,
    });
  }

  return missions;
}

export function classifyDiscovery(
  category: string,
  quizCategory?: string,
): DiscoveryType {
  const c = (quizCategory ?? category).toLowerCase();
  if (c.includes("sport") || c.includes("football") || c.includes("athlete"))
    return "athlete";
  if (c.includes("movie") || c.includes("entertainment")) return "movie";
  if (c.includes("music") || c.includes("artist")) return "artist";
  if (c.includes("history") || c.includes("president")) return "historical_figure";
  if (c.includes("geograph") || c.includes("capital") || c.includes("flag") || c.includes("country"))
    return "country";
  if (c.includes("animal") || c.includes("nature")) return "animal";
  if (c.includes("science") || c.includes("space") || c.includes("element"))
    return "science";
  if (c.includes("landmark") || c.includes("monument")) return "landmark";
  return "general";
}

export function discoveryTypeLabel(type: DiscoveryType): string {
  const map: Record<DiscoveryType, string> = {
    country: "Countries & Places",
    athlete: "Athletes",
    movie: "Movies",
    artist: "Artists",
    historical_figure: "Historical Figures",
    landmark: "Landmarks",
    animal: "Animals",
    science: "Science Concepts",
    general: "General Knowledge",
  };
  return map[type];
}
