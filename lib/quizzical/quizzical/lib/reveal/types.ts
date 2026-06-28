// Shared types for the provider-based educational reveal system.
//
// Every quiz answer is "revealed" with rich, real data from the most relevant
// provider. Wikipedia is the universal fallback so EVERY category always has
// something educational to show.

export type RevealProvider = "wikipedia" | "thesportsdb" | "tmdb";

export type RevealKind = "fact" | "player" | "team" | "movie" | "country";

/** Wikipedia "Did you know?" blurb — the universal fallback. */
export type FactReveal = {
  kind: "fact";
  provider: "wikipedia";
  title: string;
  description: string;
  extract: string;
  image_url: string | null;
  url: string;
};

/** Athlete / player profile from TheSportsDB. */
export type PlayerReveal = {
  kind: "player";
  provider: "thesportsdb";
  name: string;
  sport: string | null;
  image_url: string | null;
  team: string | null;
  team_badge: string | null;
  nationality: string | null;
  /** Flag emoji derived from nationality, when known. */
  flag: string | null;
  position: string | null;
  date_of_birth: string | null;
  former_teams: string[];
  honours: string[];
  biography: string | null;
  url: string | null;
};

/** Sports team / club profile from TheSportsDB. */
export type TeamReveal = {
  kind: "team";
  provider: "thesportsdb";
  name: string;
  badge: string | null;
  stadium: string | null;
  country: string | null;
  league: string | null;
  founded: string | null;
  description: string | null;
  url: string | null;
};

/** Movie / TV facts from TMDB. */
export type MovieReveal = {
  kind: "movie";
  provider: "tmdb";
  title: string;
  poster_url: string | null;
  year: string | null;
  genres: string[];
  rating: number | null;
  overview: string | null;
};

/** Country profile — bundled facts (flag/capital/population) + Wikipedia blurb. */
export type CountryReveal = {
  kind: "country";
  provider: "wikipedia";
  name: string;
  flag_url: string | null;
  capital: string | null;
  population: number | null;
  region: string | null;
  image_url: string | null;
  extract: string;
  url: string | null;
};

export type RevealData =
  | FactReveal
  | PlayerReveal
  | TeamReveal
  | MovieReveal
  | CountryReveal;
