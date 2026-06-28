import { absoluteUrl, SITE_NAME, SITE_URL } from "./seo";
import type { Category, Quiz } from "./quizzes";
import type { GameMode } from "./imageQuestions";
import type { SeoEntity } from "./seoEntitySlugs";
import { ENTITY_TYPE_LABELS } from "./seoEntitySlugs";

const BDL_CORP = {
  "@type": "Organization" as const,
  name: "BDL Corp",
  url: SITE_URL,
  description:
    "BDL Corp creates free online quiz and trivia games including Quizzical.",
};

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: [
      "Quizzical.site",
      "Quizziqal",
      "Quizzical SA",
      "Quizzical South Africa",
      "Quizzical Quiz Game",
      "Quizzical Online",
    ],
    url: SITE_URL,
    description:
      "Quizzical — free AI-powered quiz games online. Geography, sports, movies, history, science, and trivia with educational facts after every answer.",
    inLanguage: "en",
    publisher: BDL_CORP,
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
    name: "BDL Corp",
    legalName: "BDL Corp",
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
      url: SITE_URL,
    },
    founder: {
      "@type": "Person",
      name: "Zama Shange",
      url: absoluteUrl("/founder"),
    },
    areaServed: {
      "@type": "Country",
      name: "South Africa",
    },
    knowsAbout: [
      "Online quiz games",
      "Trivia",
      "Educational games",
      "AI quiz generation",
    ],
    sameAs: ["https://www.youtube.com/@quizziqal"],
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Zama Shange",
    birthDate: "2007-06-20",
    birthPlace: {
      "@type": "Place",
      name: "Durban, South Africa",
    },
    nationality: {
      "@type": "Country",
      name: "South Africa",
    },
    jobTitle: "Founder, Designer & Developer",
    worksFor: {
      "@type": "Organization",
      name: "BDL Corp",
    },
    url: absoluteUrl("/founder"),
    knowsAbout: [
      "Software Development",
      "Product Design",
      "Educational Technology",
      "Quiz Games",
    ],
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

export function quizFaqJsonLd(quiz: Quiz) {
  const questions = quiz.questions.slice(0, 6);
  if (questions.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.text,
      acceptedAnswer: {
        "@type": "Answer",
        text: `The correct answer is ${q.answers[q.correct]}. Play ${quiz.title} on Quizzical to learn more with educational reveal cards.`,
      },
    })),
  };
}

export function entityArticleJsonLd(
  entity: SeoEntity,
  summary: { title: string; description: string; extract?: string; url?: string },
) {
  const path = `/${entity.type === "figure" ? "figure" : entity.type}/${entity.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${entity.name} — ${ENTITY_TYPE_LABELS[entity.type]} Guide`,
    description: summary.description || summary.extract?.slice(0, 160),
    url: absoluteUrl(path),
    author: BDL_CORP,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.png"),
      },
    },
    about: {
      "@type": "Thing",
      name: entity.name,
    },
    mainEntityOfPage: absoluteUrl(path),
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

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
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
