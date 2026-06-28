import { COUNTRY_COUNT } from "@/lib/allCountries";
import type { UserDiscovery } from "@/lib/progression/types";

export type DiscoveryTrack = {
  id: string;
  label: string;
  emoji: string;
  learned: number;
  total: number;
  pct: number;
};

/** Universe sizes — approximate pools for progress %. */
const UNIVERSE: Record<string, number> = {
  country: COUNTRY_COUNT,
  athlete: 120,
  football: 80,
  basketball: 60,
  cricket: 50,
  movie: 100,
  artist: 80,
  landmark: 40,
  historical_figure: 60,
  science: 80,
  animal: 70,
  general: 200,
};

const TRACKS: { id: string; label: string; emoji: string; types: string[] }[] = [
  { id: "countries", label: "Countries Learned", emoji: "🌍", types: ["country"] },
  { id: "athletes", label: "Athletes Learned", emoji: "🏅", types: ["athlete"] },
  { id: "movies", label: "Movies Learned", emoji: "🎬", types: ["movie"] },
  { id: "landmarks", label: "Landmarks Learned", emoji: "🗽", types: ["landmark"] },
  { id: "history", label: "History Learned", emoji: "📜", types: ["historical_figure"] },
  { id: "science", label: "Science Learned", emoji: "🔬", types: ["science", "animal"] },
];

export function computeDiscoveryProgress(
  discoveries: UserDiscovery[],
): DiscoveryTrack[] {
  const byType = new Map<string, Set<string>>();
  for (const d of discoveries) {
    const key = d.discoveryType;
    if (!byType.has(key)) byType.set(key, new Set());
    byType.get(key)!.add(d.term.trim().toLowerCase());
  }

  return TRACKS.map((track) => {
    const learnedSet = new Set<string>();
    for (const t of track.types) {
      const s = byType.get(t);
      if (s) s.forEach((v) => learnedSet.add(v));
    }
    const learned = learnedSet.size;
    const total = track.types.reduce((sum, t) => sum + (UNIVERSE[t] ?? 50), 0);
    const pct = total > 0 ? Math.min(100, Math.round((learned / total) * 100)) : 0;
    return {
      id: track.id,
      label: track.label,
      emoji: track.emoji,
      learned,
      total,
      pct,
    };
  });
}
