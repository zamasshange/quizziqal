import type { Metadata } from "next";
import type { Category, Quiz } from "./quizzes";
import type { SeoTopic } from "./seoTopics";
import { topicCount } from "./seoTopics";
import type { GameMode } from "./imageQuestions";
import { getCategory } from "./quizzes";
import type { SeoEntity } from "./seoEntitySlugs";
import {
  ENTITY_TYPE_LABELS,
  entityPath,
  type SeoEntityType,
} from "./seoEntitySlugs";
import {
  BASE_KEYWORDS,
  BRAND_KEYWORDS,
  CATEGORY_KEYWORDS,
  CORE_QUIZ_KEYWORDS,
  IMAGE_GAME_KEYWORDS,
  PAGE_KEYWORDS,
  QUIZ_LONGTAIL_KEYWORDS,
  SOUTH_AFRICA_KEYWORDS,
} from "./seoKeywords";

export const SITE_NAME = "Quizzical";
export const SITE_TAGLINE = "Play. Learn. Level Up.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://quizzical.site";

export function absoluteUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL.replace(/\/$/, "")}${clean}`;
}

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords: string[];
  noIndex?: boolean;
  ogType?: "website" | "article";
  /** Bypass layout title template (homepage). */
  absoluteTitle?: boolean;
};

function ogTitle(title: string): string {
  if (title.includes(SITE_NAME)) return title;
  return `${title} | ${SITE_NAME}`;
}

/** Builds full Next.js Metadata with canonical, Open Graph, Twitter, and keywords. */
export function buildMetadata({
  title,
  description,
  path,
  keywords,
  noIndex = false,
  ogType = "website",
  absoluteTitle = false,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const uniqueKeywords = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))].slice(
    0,
    24,
  );

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: uniqueKeywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: ogTitle(title),
      description,
      url,
      siteName: SITE_NAME,
      type: ogType,
      locale: "en_US",
      images: [
        {
          url: absoluteUrl("/logo.png"),
          width: 512,
          height: 512,
          alt: `${SITE_NAME} — free online quiz games`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle(title),
      description,
      images: [absoluteUrl("/logo.png")],
    },
  };
}

export function homeMetadata(): Metadata {
  return buildMetadata({
    title: "Quizzical | Play Free AI-Powered Quiz Games Online",
    description:
      "Challenge yourself with hundreds of quiz games covering geography, sports, movies, history, science, music, and more. Learn, compete, and become a Knowledge Explorer.",
    path: "/",
    absoluteTitle: true,
    keywords: [...PAGE_KEYWORDS.home],
  });
}

export function categoryMetadata(category: Category): Metadata {
  const extra = CATEGORY_KEYWORDS[category.slug] ?? [];
  return buildMetadata({
    title: `${category.name} Quiz Games & Trivia`,
    description: `Free ${category.name.toLowerCase()} quizzes online — ${category.tag} games with timed scoring and educational facts after every answer. Play on Quizzical, no download required.`,
    path: `/${category.slug}`,
    keywords: [...BRAND_KEYWORDS, ...CORE_QUIZ_KEYWORDS, ...extra],
  });
}

export function quizMetadata(quiz: Quiz): Metadata {
  const cat = getCategory(quiz.category);
  const catKeys = CATEGORY_KEYWORDS[quiz.category] ?? [];
  const isFlags = quiz.id === "flags-of-the-world";

  return buildMetadata({
    title: `${quiz.title} Quiz`,
    description: isFlags
      ? `Play Flags of the World free — 197 countries, random flags every round, and educational facts after each answer. The ultimate flags quiz on Quizzical.`
      : `${quiz.description} Play the ${quiz.title} quiz free on Quizzical — timed trivia with educational reveal cards in ${cat?.name ?? "trivia"}.`,
    path: `/quiz/${quiz.id}`,
    keywords: [
      ...BRAND_KEYWORDS,
      ...catKeys,
      quiz.title,
      `${quiz.title} quiz`,
      ...(isFlags ? ["flags quiz", "country flags game", "world flags trivia"] : []),
    ],
  });
}

export function quizPlayMetadata(quiz: Quiz): Metadata {
  const cat = getCategory(quiz.category);
  const catKeys = CATEGORY_KEYWORDS[quiz.category] ?? [];

  return buildMetadata({
    title: `Play ${quiz.title} Quiz`,
    description: `Start ${quiz.title} now — free online ${cat?.name.toLowerCase() ?? "trivia"} with timer, score tracking, and learn-after-answer facts on Quizzical.`,
    path: `/quiz/${quiz.id}/play`,
    keywords: [
      ...BRAND_KEYWORDS,
      ...catKeys,
      `play ${quiz.title.toLowerCase()}`,
      `${quiz.title} online`,
    ],
  });
}

export function entityMetadata(entity: SeoEntity): Metadata {
  const label = ENTITY_TYPE_LABELS[entity.type];
  const path = entityPath(entity.type, entity.slug);
  const catKeys = CATEGORY_KEYWORDS[entity.relatedCategory] ?? [];

  const description =
    entity.intro ??
    `Learn about ${entity.name} and test your knowledge with free ${label.toLowerCase()} quizzes on Quizzical — trivia games with educational facts after every answer.`;

  return buildMetadata({
    title: `${entity.name} — ${label} Quiz & Facts`,
    description,
    path,
    keywords: [
      ...BRAND_KEYWORDS,
      ...catKeys,
      entity.name,
      `${entity.name} quiz`,
      `${entity.name} trivia`,
      `${label.toLowerCase()} quiz`,
    ],
  });
}

export function imageGameMetadata(game: GameMode): Metadata {
  const extra = IMAGE_GAME_KEYWORDS[game.slug] ?? [];

  return buildMetadata({
    title: `${game.title} — Picture Quiz`,
    description: `Play ${game.title} free online. Image-based picture quiz with real photos, multiple choice answers, and educational facts on Quizzical.`,
    path: `/play/${game.slug}`,
    keywords: [...BRAND_KEYWORDS, ...extra, "picture quiz", "image quiz game"],
  });
}

export function aiGeneratorMetadata(): Metadata {
  return buildMetadata({
    title: "AI Quiz Generator — Create Custom Trivia",
    description:
      "Generate a custom quiz on any topic with AI. Enter a subject, pick difficulty, and play instantly — free AI quiz maker on Quizzical.",
    path: "/ai",
    keywords: [...BRAND_KEYWORDS, ...PAGE_KEYWORDS.ai],
  });
}

export function signInMetadata(): Metadata {
  return buildMetadata({
    title: "Sign In",
    description: "Sign in to Quizzical to track quiz scores, XP, discoveries, and leaderboard rank.",
    path: "/signin",
    keywords: PAGE_KEYWORDS.signin,
    noIndex: true,
  });
}

export function signUpMetadata(): Metadata {
  return buildMetadata({
    title: "Sign Up",
    description: "Create a free Quizzical account to track progress, collect discoveries, and compete on leaderboards.",
    path: "/signup",
    keywords: PAGE_KEYWORDS.signup,
    noIndex: true,
  });
}

export function dashboardMetadata(): Metadata {
  return buildMetadata({
    title: "Dashboard",
    description: "Quizzical admin dashboard.",
    path: "/dashboard",
    keywords: [],
    noIndex: true,
  });
}

export function topicsHubMetadata(): Metadata {
  return buildMetadata({
    title: "Quiz Topics & Guides",
    description: `Browse ${topicCount()} quiz topics on Quizzical — free online trivia for geography, sports, movies, history, science, and more.`,
    path: "/topics",
    keywords: [...BRAND_KEYWORDS, ...CORE_QUIZ_KEYWORDS, "quiz topics"],
  });
}

export function topicMetadata(topic: SeoTopic): Metadata {
  const kw = topic.keyword;
  return buildMetadata({
    title: `${kw} — Free Online Quiz`,
    description: `Play free ${kw} quizzes on Quizzical. Timed trivia, picture rounds, and educational facts after every answer — no download required.`,
    path: `/topics/${topic.slug}`,
    keywords: [
      kw,
      `${kw} online`,
      `free ${kw}`,
      "online quiz",
      "trivia games",
      ...topic.related.slice(0, 6),
    ],
  });
}

export function aboutMetadata(): Metadata {
  return buildMetadata({
    title: "About Quizzical",
    description:
      "Quizzical is an AI-powered quiz platform that combines entertainment with education. Learn about our mission to make knowledge fun, free, and accessible worldwide.",
    path: "/about",
    keywords: PAGE_KEYWORDS.about,
  });
}

export function founderMetadata(): Metadata {
  return buildMetadata({
    title: "About Zama Shange — Founder of Quizzical",
    description:
      "Meet Zama Shange, South African founder and developer behind Quizzical and BDL Corp — building digital products that educate and inspire.",
    path: "/founder",
    keywords: PAGE_KEYWORDS.founder,
  });
}

export function privacyPolicyMetadata(): Metadata {
  return buildMetadata({
    title: "Privacy Policy",
    description:
      "How Quizzical collects, uses, and protects your data — accounts, cookies, third-party services, and your rights.",
    path: "/privacy-policy",
    keywords: PAGE_KEYWORDS.privacy,
  });
}

export function contactMetadata(): Metadata {
  return buildMetadata({
    title: "Contact Us",
    description:
      "Contact the Quizzical team — feedback, bug reports, partnerships, and general questions.",
    path: "/contact",
    keywords: PAGE_KEYWORDS.contact,
  });
}

export function statusMetadata(): Metadata {
  return buildMetadata({
    title: "Platform Status",
    description:
      "Operational status of Quizzical — quiz gameplay, AI generation, authentication, leaderboards, and media content.",
    path: "/status",
    keywords: PAGE_KEYWORDS.status,
  });
}

export function discoverHubMetadata(): Metadata {
  return buildMetadata({
    title: "Discover — Countries, Landmarks, Athletes & More",
    description:
      "Explore Quizzical discovery pages — learn about countries, landmarks, athletes, celebrities, movies, and historical figures, then play related quizzes.",
    path: "/discover",
    keywords: [
      ...BRAND_KEYWORDS,
      ...CORE_QUIZ_KEYWORDS,
      "country quiz",
      "landmark quiz",
      "celebrity trivia",
    ],
  });
}

export function entityHubMetadata(type: SeoEntityType): Metadata {
  const label = ENTITY_TYPE_LABELS[type];
  const plural =
    type === "country"
      ? "Countries"
      : type === "player"
        ? "Athletes"
        : type === "figure"
          ? "Historical Figures"
          : `${label}s`;

  return buildMetadata({
    title: `${plural} — Quiz & Trivia Guides`,
    description: `Browse ${plural.toLowerCase()} on Quizzical — free educational pages linked to geography, sports, entertainment, and history quizzes.`,
    path: `/${type === "figure" ? "figure" : type === "player" ? "player" : type}`,
    keywords: [...BRAND_KEYWORDS, ...CATEGORY_KEYWORDS.geography],
  });
}
