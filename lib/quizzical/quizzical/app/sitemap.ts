import type { MetadataRoute } from "next";
import { categories, quizzes } from "@/lib/quizzes";
import { IMAGE_GAME_MODES } from "@/lib/imageQuestions";
import { absoluteUrl } from "@/lib/seo";

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
      url: absoluteUrl("/ai"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

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

  return [...staticPages, ...categoryPages, ...quizPages, ...imageGames];
}
