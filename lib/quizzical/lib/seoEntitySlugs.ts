/** Slug helpers for programmatic SEO entity pages. */

export function slugifyEntity(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type SeoEntityType =
  | "country"
  | "player"
  | "celebrity"
  | "movie"
  | "landmark"
  | "figure";

export type SeoEntity = {
  slug: string;
  name: string;
  type: SeoEntityType;
  /** Wikipedia / reveal lookup term */
  wikiTerm: string;
  intro?: string;
  relatedQuizIds: string[];
  relatedCategory: string;
  iso2?: string;
};

export const ENTITY_TYPE_LABELS: Record<SeoEntityType, string> = {
  country: "Country",
  player: "Athlete",
  celebrity: "Celebrity",
  movie: "Movie",
  landmark: "Landmark",
  figure: "Historical Figure",
};

export const ENTITY_TYPE_PATH: Record<SeoEntityType, string> = {
  country: "country",
  player: "player",
  celebrity: "celebrity",
  movie: "movie",
  landmark: "landmark",
  figure: "figure",
};

export function entityPath(type: SeoEntityType, slug: string): string {
  return `/${ENTITY_TYPE_PATH[type]}/${slug}`;
}
