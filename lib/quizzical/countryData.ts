// Static country facts for reveal cards. Bundled (not fetched) because the free
// country APIs are unreliable/deprecated — this is instant and always available.
// Population figures are approximate (rounded) and fine for a quiz context.
// Flags are self-hosted PNGs in /public/flags (see lib/flagUrl.ts).

import { ALL_COUNTRIES } from "./allCountries";
import { flagUrlFromIso2 } from "./flagUrl";

export type CountryRecord = {
  capital: string;
  population: number;
  region: string;
  iso2: string;
};

export const COUNTRIES: Record<string, CountryRecord> = {
  france: { capital: "Paris", population: 67500000, region: "Europe", iso2: "fr" },
  germany: { capital: "Berlin", population: 83200000, region: "Europe", iso2: "de" },
  italy: { capital: "Rome", population: 58900000, region: "Europe", iso2: "it" },
  spain: { capital: "Madrid", population: 47400000, region: "Europe", iso2: "es" },
  portugal: { capital: "Lisbon", population: 10300000, region: "Europe", iso2: "pt" },
  "united kingdom": { capital: "London", population: 67000000, region: "Europe", iso2: "gb" },
  ireland: { capital: "Dublin", population: 5000000, region: "Europe", iso2: "ie" },
  netherlands: { capital: "Amsterdam", population: 17500000, region: "Europe", iso2: "nl" },
  belgium: { capital: "Brussels", population: 11600000, region: "Europe", iso2: "be" },
  switzerland: { capital: "Bern", population: 8700000, region: "Europe", iso2: "ch" },
  austria: { capital: "Vienna", population: 9000000, region: "Europe", iso2: "at" },
  sweden: { capital: "Stockholm", population: 10400000, region: "Europe", iso2: "se" },
  norway: { capital: "Oslo", population: 5400000, region: "Europe", iso2: "no" },
  denmark: { capital: "Copenhagen", population: 5800000, region: "Europe", iso2: "dk" },
  finland: { capital: "Helsinki", population: 5500000, region: "Europe", iso2: "fi" },
  poland: { capital: "Warsaw", population: 37700000, region: "Europe", iso2: "pl" },
  russia: { capital: "Moscow", population: 144000000, region: "Europe", iso2: "ru" },
  ukraine: { capital: "Kyiv", population: 41000000, region: "Europe", iso2: "ua" },
  greece: { capital: "Athens", population: 10400000, region: "Europe", iso2: "gr" },
  turkey: { capital: "Ankara", population: 85000000, region: "Asia", iso2: "tr" },
  "czech republic": { capital: "Prague", population: 10500000, region: "Europe", iso2: "cz" },
  hungary: { capital: "Budapest", population: 9700000, region: "Europe", iso2: "hu" },
  romania: { capital: "Bucharest", population: 19000000, region: "Europe", iso2: "ro" },
  croatia: { capital: "Zagreb", population: 3900000, region: "Europe", iso2: "hr" },
  serbia: { capital: "Belgrade", population: 6900000, region: "Europe", iso2: "rs" },
  iceland: { capital: "Reykjavik", population: 370000, region: "Europe", iso2: "is" },
  "united states": { capital: "Washington, D.C.", population: 331000000, region: "Americas", iso2: "us" },
  canada: { capital: "Ottawa", population: 38000000, region: "Americas", iso2: "ca" },
  mexico: { capital: "Mexico City", population: 126000000, region: "Americas", iso2: "mx" },
  brazil: { capital: "Brasília", population: 213000000, region: "Americas", iso2: "br" },
  argentina: { capital: "Buenos Aires", population: 45000000, region: "Americas", iso2: "ar" },
  chile: { capital: "Santiago", population: 19000000, region: "Americas", iso2: "cl" },
  peru: { capital: "Lima", population: 33000000, region: "Americas", iso2: "pe" },
  colombia: { capital: "Bogotá", population: 51000000, region: "Americas", iso2: "co" },
  venezuela: { capital: "Caracas", population: 28000000, region: "Americas", iso2: "ve" },
  cuba: { capital: "Havana", population: 11000000, region: "Americas", iso2: "cu" },
  jamaica: { capital: "Kingston", population: 2900000, region: "Americas", iso2: "jm" },
  china: { capital: "Beijing", population: 1412000000, region: "Asia", iso2: "cn" },
  japan: { capital: "Tokyo", population: 125000000, region: "Asia", iso2: "jp" },
  "south korea": { capital: "Seoul", population: 51700000, region: "Asia", iso2: "kr" },
  "north korea": { capital: "Pyongyang", population: 25000000, region: "Asia", iso2: "kp" },
  india: { capital: "New Delhi", population: 1400000000, region: "Asia", iso2: "in" },
  pakistan: { capital: "Islamabad", population: 231000000, region: "Asia", iso2: "pk" },
  bangladesh: { capital: "Dhaka", population: 169000000, region: "Asia", iso2: "bd" },
  indonesia: { capital: "Jakarta", population: 273000000, region: "Asia", iso2: "id" },
  thailand: { capital: "Bangkok", population: 70000000, region: "Asia", iso2: "th" },
  vietnam: { capital: "Hanoi", population: 97000000, region: "Asia", iso2: "vn" },
  philippines: { capital: "Manila", population: 113000000, region: "Asia", iso2: "ph" },
  malaysia: { capital: "Kuala Lumpur", population: 32000000, region: "Asia", iso2: "my" },
  singapore: { capital: "Singapore", population: 5700000, region: "Asia", iso2: "sg" },
  "saudi arabia": { capital: "Riyadh", population: 35000000, region: "Asia", iso2: "sa" },
  iran: { capital: "Tehran", population: 85000000, region: "Asia", iso2: "ir" },
  iraq: { capital: "Baghdad", population: 40000000, region: "Asia", iso2: "iq" },
  israel: { capital: "Jerusalem", population: 9300000, region: "Asia", iso2: "il" },
  "united arab emirates": { capital: "Abu Dhabi", population: 9900000, region: "Asia", iso2: "ae" },
  egypt: { capital: "Cairo", population: 104000000, region: "Africa", iso2: "eg" },
  nigeria: { capital: "Abuja", population: 211000000, region: "Africa", iso2: "ng" },
  "south africa": { capital: "Pretoria", population: 60000000, region: "Africa", iso2: "za" },
  kenya: { capital: "Nairobi", population: 54000000, region: "Africa", iso2: "ke" },
  ethiopia: { capital: "Addis Ababa", population: 118000000, region: "Africa", iso2: "et" },
  ghana: { capital: "Accra", population: 31000000, region: "Africa", iso2: "gh" },
  morocco: { capital: "Rabat", population: 37000000, region: "Africa", iso2: "ma" },
  algeria: { capital: "Algiers", population: 44000000, region: "Africa", iso2: "dz" },
  tunisia: { capital: "Tunis", population: 12000000, region: "Africa", iso2: "tn" },
  tanzania: { capital: "Dodoma", population: 61000000, region: "Africa", iso2: "tz" },
  australia: { capital: "Canberra", population: 26000000, region: "Oceania", iso2: "au" },
  "new zealand": { capital: "Wellington", population: 5100000, region: "Oceania", iso2: "nz" },
  lebanon: { capital: "Beirut", population: 5500000, region: "Asia", iso2: "lb" },
};

// Common aliases people / quizzes use.
const ALIASES: Record<string, string> = {
  usa: "united states",
  "u.s.": "united states",
  "u.s.a.": "united states",
  america: "united states",
  "united states of america": "united states",
  uk: "united kingdom",
  "u.k.": "united kingdom",
  england: "united kingdom",
  britain: "united kingdom",
  "great britain": "united kingdom",
  uae: "united arab emirates",
  holland: "netherlands",
  czechia: "czech republic",
};

export function lookupCountry(name: string): CountryRecord | null {
  const k = name.trim().toLowerCase();
  const key = ALIASES[k] ?? k;
  if (COUNTRIES[key]) return COUNTRIES[key];
  const ref = ALL_COUNTRIES.find((c) => c.name.toLowerCase() === k);
  if (!ref) return null;
  return {
    capital: "",
    population: 0,
    region: "",
    iso2: ref.iso2,
  };
}

/** Resolve a country display name to its ISO2 code (full ~197-country pool). */
export function lookupCountryIso(name: string): string | null {
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  const alias = ALIASES[lower];
  if (alias && COUNTRIES[alias]) return COUNTRIES[alias].iso2;
  if (COUNTRIES[lower]) return COUNTRIES[lower].iso2;
  const ref = ALL_COUNTRIES.find(
    (c) => c.name.toLowerCase() === lower || c.name.toLowerCase() === alias,
  );
  return ref?.iso2 ?? null;
}

/** Parse "Flag of France" / "Flag of the United Kingdom" → country name. */
export function parseFlagQuery(query: string): string | null {
  const m = query.trim().match(/^Flag of (?:the )?(.+)$/i);
  return m ? m[1].trim() : null;
}

/** Self-hosted flag PNG in /public/flags (small UI badges). */
export function flagImageFromQuery(query: string, _width = 640): string | null {
  const country = parseFlagQuery(query);
  if (!country) return null;
  const iso2 = lookupCountryIso(country);
  if (!iso2) return null;
  return flagUrlFromIso2(iso2);
}

/** High-resolution flag for quiz stage (Flags of the World). */
export function flagQuizImageFromQuery(query: string, width = 1280): string | null {
  const country = parseFlagQuery(query);
  if (!country) return null;
  const iso2 = lookupCountryIso(country);
  if (!iso2) return null;
  return `https://flagcdn.com/w${width}/${iso2}.png`;
}

export function isFlagImageQuery(query?: string): boolean {
  return !!parseFlagQuery(query ?? "");
}
