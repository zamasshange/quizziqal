import type { MetadataRoute } from "next";
import { categories, quizzes } from "@/lib/quizzes";
import { IMAGE_GAME_MODES } from "@/lib/imageQuestions";
import { absoluteUrl } from "@/lib/seo";
import { getAllSeoTopics } from "@/lib/seoTopics";
import { ALL_ENTITIES } from "@/lib/seoEntities";
import { entityPath } from "@/lib/seoEntitySlugs";

/** Served at /sitemap.xml — lists every indexable URL including programmatic entity pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/discover"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/ai"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/topics"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: absoluteUrl("/founder"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.72,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/privacy-policy"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: absoluteUrl("/status"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/achievements"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: absoluteUrl("/leaderboard"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  const topicPages: MetadataRoute.Sitemap = getAllSeoTopics().map((topic) => ({
    url: absoluteUrl(`/topics/${topic.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.72,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: absoluteUrl(`/${c.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const quizPages: MetadataRoute.Sitemap = quizzes.flatMap((q) => [
    {
      url: absoluteUrl(`/quiz/${q.id}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: absoluteUrl(`/quiz/${q.id}/play`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    },
  ]);

  const imageGames: MetadataRoute.Sitemap = IMAGE_GAME_MODES.map((m) => ({
    url: absoluteUrl(`/play/${m.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const entityPages: MetadataRoute.Sitemap = ALL_ENTITIES.map((entity) => ({
    url: absoluteUrl(entityPath(entity.type, entity.slug)),
    lastModified: now,
    changeFrequency: entity.type === "country" ? ("monthly" as const) : ("weekly" as const),
    priority: entity.type === "country" ? 0.68 : 0.7,
  }));

  return [
    ...staticPages,
    ...topicPages,
    ...categoryPages,
    ...quizPages,
    ...imageGames,
    ...entityPages,
  ];
}
