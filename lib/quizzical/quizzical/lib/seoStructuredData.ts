import { absoluteUrl, SITE_NAME, SITE_URL } from "./seo";
import type { Category, Quiz } from "./quizzes";
import type { GameMode } from "./imageQuestions";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Free online quiz games and trivia — geography, movies, sports, flags, picture quizzes, and AI-generated quizzes.",
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: "BDL Corp",
      url: SITE_URL,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    sameAs: [],
  };
}

export function quizJsonLd(quiz: Quiz, categoryName?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: quiz.title,
    description: quiz.description,
    url: absoluteUrl(`/quiz/${quiz.id}`),
    educationalLevel: "General",
    about: categoryName ?? quiz.category,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function categoryCollectionJsonLd(category: Category, quizCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} Quizzes`,
    description: `Free ${category.name.toLowerCase()} quizzes and trivia games on ${SITE_NAME}.`,
    url: absoluteUrl(`/${category.slug}`),
    numberOfItems: quizCount,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function imageGameJsonLd(game: GameMode) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: `Free online ${game.title.toLowerCase()} picture quiz on ${SITE_NAME}.`,
    url: absoluteUrl(`/play/${game.slug}`),
    gamePlatform: "Web browser",
    applicationCategory: "Game",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
