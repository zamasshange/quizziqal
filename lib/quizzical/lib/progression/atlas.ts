import { COUNTRY_COUNT } from "@/lib/allCountries";
import type { UserDiscovery } from "./types";

/** Atlas track — Quizzical's knowledge Pokédex. */
export type AtlasTrack = {
  id: string;
  label: string;
  emoji: string;
  discoveryTypes: string[];
  total: number;
};

export const ATLAS_TRACKS: AtlasTrack[] = [
  { id: "countries", label: "Countries", emoji: "🌍", discoveryTypes: ["country"], total: COUNTRY_COUNT },
  { id: "capitals", label: "Capitals", emoji: "🏛️", discoveryTypes: ["country"], total: 195 },
  { id: "landmarks", label: "Landmarks", emoji: "🗽", discoveryTypes: ["landmark"], total: 1200 },
  { id: "athletes", label: "Athletes", emoji: "🏅", discoveryTypes: ["athlete"], total: 2500 },
  { id: "celebrities", label: "Celebrities", emoji: "🎭", discoveryTypes: ["general"], total: 3000 },
  { id: "movies", label: "Movies", emoji: "🎬", discoveryTypes: ["movie"], total: 5000 },
  { id: "music", label: "Music Artists", emoji: "🎵", discoveryTypes: ["artist"], total: 2000 },
  { id: "animals", label: "Animals", emoji: "🦁", discoveryTypes: ["animal"], total: 1800 },
  { id: "foods", label: "Foods", emoji: "🍕", discoveryTypes: ["general"], total: 800 },
  { id: "history", label: "Historical Figures", emoji: "📜", discoveryTypes: ["historical_figure"], total: 2000 },
  { id: "events", label: "Historical Events", emoji: "⚔️", discoveryTypes: ["historical_figure"], total: 1500 },
  { id: "science", label: "Science Concepts", emoji: "🔬", discoveryTypes: ["science"], total: 1500 },
  { id: "planets", label: "Planets & Space", emoji: "🪐", discoveryTypes: ["science"], total: 400 },
  { id: "inventions", label: "Inventions", emoji: "💡", discoveryTypes: ["science"], total: 600 },
  { id: "languages", label: "Languages", emoji: "💬", discoveryTypes: ["general"], total: 500 },
];

export type AtlasTrackProgress = {
  id: string;
  label: string;
  emoji: string;
  learned: number;
  total: number;
  pct: number;
};

export type AtlasSummary = {
  tracks: AtlasTrackProgress[];
  overallLearned: number;
  overallTotal: number;
  overallPct: number;
  countriesVisited: string[];
};

function uniqueTerms(discoveries: UserDiscovery[], types: string[]): Set<string> {
  const out = new Set<string>();
  for (const d of discoveries) {
    if (!types.includes(d.discoveryType)) continue;
    out.add(d.term.trim().toLowerCase());
  }
  return out;
}

export function computeAtlasProgress(discoveries: UserDiscovery[]): AtlasSummary {
  const tracks: AtlasTrackProgress[] = ATLAS_TRACKS.map((track) => {
    const learned = uniqueTerms(discoveries, track.discoveryTypes).size;
    const capped = Math.min(learned, track.total);
    const pct = track.total > 0 ? Math.min(100, Math.round((capped / track.total) * 100)) : 0;
    return {
      id: track.id,
      label: track.label,
      emoji: track.emoji,
      learned: capped,
      total: track.total,
      pct,
    };
  });

  const overallLearned = tracks.reduce((s, t) => s + t.learned, 0);
  const overallTotal = tracks.reduce((s, t) => s + t.total, 0);
  const overallPct =
    overallTotal > 0 ? Math.min(100, Math.round((overallLearned / overallTotal) * 100)) : 0;

  const countriesVisited = discoveries
    .filter((d) => d.discoveryType === "country")
    .map((d) => d.term)
    .filter((v, i, a) => a.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i)
    .slice(0, 200);

  return { tracks, overallLearned, overallTotal, overallPct, countriesVisited };
}

export function isAtlasComplete(summary: AtlasSummary, thresholdPct = 95): boolean {
  return summary.overallPct >= thresholdPct;
}
