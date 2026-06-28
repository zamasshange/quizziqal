import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import JsonLd from "@/components/JsonLd";
import { topicMetadata, topicsHubMetadata } from "@/lib/seo";
import {
  getAllSeoTopics,
  getSeoTopicBySlug,
  topicCount,
} from "@/lib/seoTopics";
import { categories, quizzes } from "@/lib/quizzes";
import { IMAGE_GAME_MODES } from "@/lib/imageQuestions";
import { breadcrumbJsonLd } from "@/lib/seoStructuredData";

export const metadata: Metadata = topicsHubMetadata();

export default function TopicsHubPage() {
  const topics = getAllSeoTopics();

  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Topics", path: "/topics" },
        ])}
      />

      <section className="mx-auto max-w-4xl">
        <h1 className="font-display text-4xl font-black text-ink md:text-5xl">
          Quiz topics &amp; keywords
        </h1>
        <p className="mt-3 text-base font-bold text-ink/65">
          Browse {topicCount()} quiz topics on Quizzical — free online trivia for
          geography, sports, movies, history, science, and more. Every page is
          listed in our sitemap for search engines.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/topics/${topic.slug}`}
              className="rounded-full border-2 border-ink/15 bg-white px-3 py-1.5 text-sm font-extrabold text-ink/80 transition-colors hover:border-ink hover:text-ink"
            >
              {topic.keyword}
            </Link>
          ))}
        </div>
      </section>


    </SiteShell>
  );
}
