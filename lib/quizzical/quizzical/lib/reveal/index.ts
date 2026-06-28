// Reveal engine — provider-based educational reveal resolver.
//
//   resolveReveal(term, category)  ->  RevealData | null
//
// Picks the provider from the category (see providerMap), checks the Supabase
// cache, then fetches from the right source. Wikipedia is the universal
// fallback so EVERY category gets rich content after each answer.

import { fetchWikipediaFact } from "../wikipedia";
import { fetchMovieReveal } from "../tmdb";
import { fetchSportsEntity } from "../thesportsdb";
import { lookupCountry } from "../countryData";
import { getCachedReveal, setCachedReveal } from "./cache";
import {
  resolveProvider,
  sportsKindHint,
  normalizeCategory,
} from "./providerMap";
import type { CountryReveal, FactReveal, RevealData } from "./types";

// Geography categories where the answer is often a country we can enrich.
const GEO_CATEGORIES = new Set(["geography", "countries", "capitals"]);

async function fetchFactReveal(term: string): Promise<FactReveal | null> {
  const fact = await fetchWikipediaFact(term);
  if (!fact) return null;
  return {
    kind: "fact",
    provider: "wikipedia",
    title: fact.title,
    description: fact.description,
    extract: fact.extract,
    image_url: fact.image_url,
    url: fact.url,
  };
}

// Country reveal: bundled facts (flag/capital/population/continent) + a Wikipedia
// image and summary. Returns null when the term isn't a known country so the
// caller can fall back to a generic Wikipedia fact (e.g. cities, landmarks).
async function fetchCountryReveal(term: string): Promise<CountryReveal | null> {
  const rec = lookupCountry(term);
  if (!rec) return null;
  const wiki = await fetchWikipediaFact(term);
  return {
    kind: "country",
    provider: "wikipedia",
    name: wiki?.title ?? term,
    flag_url: `https://flagcdn.com/w320/${rec.iso2}.png`,
    capital: rec.capital,
    population: rec.population,
    region: rec.region,
    image_url: wiki?.image_url ?? null,
    extract: wiki?.extract ?? "",
    url: wiki?.url ?? null,
  };
}

function cacheKey(term: string, category?: string | null): string {
  const provider = resolveProvider(category);
  return `${provider}:${term.trim().toLowerCase()}`;
}

export async function resolveReveal(
  term: string,
  category?: string | null,
): Promise<RevealData | null> {
  const cleaned = term.trim();
  if (!cleaned) return null;

  const key = cacheKey(cleaned, category);

  // 1. Cache first — never re-hit external APIs for the same term.
  const cached = await getCachedReveal(key);
  if (cached !== undefined) return cached;

  const provider = resolveProvider(category);

  // 2. Try the category's primary provider.
  let data: RevealData | null = null;
  try {
    if (provider === "thesportsdb") {
      const prefer = sportsKindHint(category) === "team" ? "team" : "player";
      data = await fetchSportsEntity(cleaned, prefer);
    } else if (provider === "tmdb") {
      data = await fetchMovieReveal(cleaned);
    } else if (GEO_CATEGORIES.has(normalizeCategory(category))) {
      data = await fetchCountryReveal(cleaned);
    }
  } catch {
    data = null;
  }

  // 3. Universal Wikipedia fallback (also the primary for most categories).
  if (!data) {
    data = await fetchFactReveal(cleaned);
  }

  // 4. Persist the resolved result (or the lack of one) under the primary key.
  await setCachedReveal(key, data);
  return data;
}

export { resolveProvider, normalizeCategory };
export type { RevealData } from "./types";
