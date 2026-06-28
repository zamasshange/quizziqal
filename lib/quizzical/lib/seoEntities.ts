import { ALL_COUNTRIES } from "./allCountries";
import {
  slugifyEntity,
  type SeoEntity,
  type SeoEntityType,
} from "./seoEntitySlugs";

const CURATED: Omit<SeoEntity, "slug">[] = [
  // Athletes
  {
    name: "Lionel Messi",
    type: "player",
    wikiTerm: "Lionel Messi",
    intro: "Test your sports knowledge with football quizzes inspired by legends like Messi.",
    relatedQuizIds: ["football-world", "sports-legends"],
    relatedCategory: "sports",
  },
  {
    name: "Cristiano Ronaldo",
    type: "player",
    wikiTerm: "Cristiano Ronaldo",
    relatedQuizIds: ["sports-legends"],
    relatedCategory: "sports",
  },
  {
    name: "LeBron James",
    type: "player",
    wikiTerm: "LeBron James",
    relatedQuizIds: ["sports-legends"],
    relatedCategory: "sports",
  },
  {
    name: "Virat Kohli",
    type: "player",
    wikiTerm: "Virat Kohli",
    relatedQuizIds: ["sports-legends"],
    relatedCategory: "sports",
  },
  {
    name: "Serena Williams",
    type: "player",
    wikiTerm: "Serena Williams",
    relatedQuizIds: ["sports-legends"],
    relatedCategory: "sports",
  },
  // Celebrities
  {
    name: "Beyoncé",
    type: "celebrity",
    wikiTerm: "Beyoncé",
    relatedQuizIds: ["music-legends", "movie-mania"],
    relatedCategory: "entertainment",
  },
  {
    name: "Taylor Swift",
    type: "celebrity",
    wikiTerm: "Taylor Swift",
    relatedQuizIds: ["music-legends"],
    relatedCategory: "entertainment",
  },
  {
    name: "Dwayne Johnson",
    type: "celebrity",
    wikiTerm: "Dwayne Johnson",
    relatedQuizIds: ["movie-mania", "blockbuster-franchises"],
    relatedCategory: "entertainment",
  },
  // Movies (Wikipedia film titles)
  {
    name: "The Dark Knight",
    type: "movie",
    wikiTerm: "The Dark Knight (film)",
    relatedQuizIds: ["movie-mania", "blockbuster-franchises"],
    relatedCategory: "entertainment",
  },
  {
    name: "Titanic",
    type: "movie",
    wikiTerm: "Titanic (1997 film)",
    relatedQuizIds: ["movie-mania"],
    relatedCategory: "entertainment",
  },
  {
    name: "Black Panther",
    type: "movie",
    wikiTerm: "Black Panther (film)",
    relatedQuizIds: ["blockbuster-franchises"],
    relatedCategory: "entertainment",
  },
  // Landmarks
  {
    name: "Eiffel Tower",
    type: "landmark",
    wikiTerm: "Eiffel Tower",
    intro: "Discover famous landmarks through geography and trivia quizzes on Quizzical.",
    relatedQuizIds: ["famous-landmarks", "world-capitals"],
    relatedCategory: "geography",
  },
  {
    name: "Statue of Liberty",
    type: "landmark",
    wikiTerm: "Statue of Liberty",
    relatedQuizIds: ["world-capitals"],
    relatedCategory: "geography",
  },
  {
    name: "Great Wall of China",
    type: "landmark",
    wikiTerm: "Great Wall of China",
    relatedQuizIds: ["world-capitals"],
    relatedCategory: "geography",
  },
  {
    name: "Table Mountain",
    type: "landmark",
    wikiTerm: "Table Mountain",
    intro: "Explore South African landmarks and geography on Quizzical.",
    relatedQuizIds: ["famous-landmarks", "world-capitals"],
    relatedCategory: "geography",
  },
  // Historical figures
  {
    name: "Nelson Mandela",
    type: "figure",
    wikiTerm: "Nelson Mandela",
    intro: "Learn about Nelson Mandela and test your history knowledge on Quizzical.",
    relatedQuizIds: ["world-war-two", "us-presidents"],
    relatedCategory: "history",
  },
  {
    name: "Cleopatra",
    type: "figure",
    wikiTerm: "Cleopatra",
    relatedQuizIds: ["ancient-rome", "ancient-history"],
    relatedCategory: "history",
  },
  {
    name: "Albert Einstein",
    type: "figure",
    wikiTerm: "Albert Einstein",
    relatedQuizIds: ["space-explorers", "chemistry-basics"],
    relatedCategory: "science-and-nature",
  },
  {
    name: "Leonardo da Vinci",
    type: "figure",
    wikiTerm: "Leonardo da Vinci",
    relatedQuizIds: ["famous-painters", "classic-novels"],
    relatedCategory: "art-and-literature",
  },
];

function withSlug(partial: Omit<SeoEntity, "slug">): SeoEntity {
  return { ...partial, slug: slugifyEntity(partial.name) };
}

/** Pre-render high-traffic countries at build; others via on-demand ISR. */
export const PRIORITY_COUNTRY_SLUGS = new Set([
  "south-africa",
  "zimbabwe",
  "nigeria",
  "kenya",
  "ghana",
  "united-states",
  "united-kingdom",
  "france",
  "germany",
  "india",
  "australia",
  "canada",
  "brazil",
  "japan",
  "mexico",
  "italy",
  "spain",
  "portugal",
  "netherlands",
  "china",
  "argentina",
  "egypt",
  "morocco",
  "israel",
  "turkey",
  "russia",
  "ukraine",
  "poland",
  "sweden",
  "norway",
  "new-zealand",
  "ireland",
  "belgium",
  "switzerland",
  "austria",
  "greece",
  "thailand",
  "vietnam",
  "indonesia",
  "philippines",
  "south-korea",
  "saudi-arabia",
  "united-arab-emirates",
  "qatar",
  "colombia",
  "chile",
  "peru",
  "cuba",
  "jamaica",
]);

const COUNTRY_ENTITIES: SeoEntity[] = ALL_COUNTRIES.map((c) =>
  withSlug({
    name: c.name,
    type: "country",
    wikiTerm: c.name,
    iso2: c.iso2,
    relatedQuizIds: ["flags-of-the-world", "world-capitals"],
    relatedCategory: "geography",
  }),
);

const CURATED_ENTITIES: SeoEntity[] = CURATED.map(withSlug);

const ALL_ENTITIES: SeoEntity[] = [...COUNTRY_ENTITIES, ...CURATED_ENTITIES];

const byTypeSlug = new Map<string, SeoEntity>();

for (const e of ALL_ENTITIES) {
  byTypeSlug.set(`${e.type}:${e.slug}`, e);
}

export function getEntitiesByType(type: SeoEntityType): SeoEntity[] {
  return ALL_ENTITIES.filter((e) => e.type === type);
}

export function getStaticEntityParams(type: SeoEntityType): { slug: string }[] {
  const all = getEntitiesByType(type);
  if (type === "country") {
    return all
      .filter((e) => PRIORITY_COUNTRY_SLUGS.has(e.slug))
      .map((e) => ({ slug: e.slug }));
  }
  return all.map((e) => ({ slug: e.slug }));
}

export function getEntity(type: SeoEntityType, slug: string): SeoEntity | undefined {
  return byTypeSlug.get(`${type}:${slug}`);
}

export function getRelatedEntities(entity: SeoEntity, limit = 6): SeoEntity[] {
  return ALL_ENTITIES.filter(
    (e) =>
      e.type === entity.type &&
      e.slug !== entity.slug &&
      e.relatedCategory === entity.relatedCategory,
  ).slice(0, limit);
}

export { ALL_ENTITIES };
