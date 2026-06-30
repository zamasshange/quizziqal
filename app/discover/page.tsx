"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SonkeAppShell from "@/components/skin/SonkeAppShell";
import { ContentModule, SectionHeading } from "@/components/skin/content";
import DiscoverHero from "@/components/discover/DiscoverHero";
import QuizCard from "@/components/discover/QuizCard";
import CategoryChips from "@/components/discover/CategoryChips";
import {
  discoverQuizzes,
  DISCOVER_CATEGORIES,
  IMAGE_GAME_MODES,
} from "@/lib/discoverData";
import type { Quiz } from "@/lib/types";

export default function DiscoverPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loadingQuiz, setLoadingQuiz] = useState<string | null>(null);

  const filtered = discoverQuizzes.filter((q) => {
    const matchesSearch =
      !searchQuery ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" ||
      q.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase() === selectedCategory.toLowerCase()) ||
      (selectedCategory === "Featured" && q.plays > 50_000) ||
      (selectedCategory === "Picture" && q.tags.includes("picture"));

    return matchesSearch && matchesCategory;
  });

  const handlePlay = (quizId: string) => {
    setLoadingQuiz(quizId);
    router.push(`/play/${quizId}`);
    setLoadingQuiz(null);
  };

  const handlePictureGame = (slug: string) => {
    setLoadingQuiz(slug);
    router.push(`/play/pic-${slug}`);
    setLoadingQuiz(null);
  };

  const pictureCard = (mode: (typeof IMAGE_GAME_MODES)[0]): Quiz => ({
    id: `pic-${mode.slug}`,
    title: mode.title,
    description: mode.subtitle ?? "Wikipedia-powered picture quiz",
    creator: "Quizziqal",
    questionCount: 10,
    plays: 120000,
    category: "Picture",
    tags: ["picture", mode.category, mode.slug, "wikipedia"],
    coverGradient: `linear-gradient(135deg, ${mode.color} 0%, ${mode.color}99 100%)`,
    coverIcon: mode.emoji,
    isFree: true,
    questions: [],
  });

  return (
    <SonkeAppShell
      pageTitle="Discover"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search quizzes…"
    >
      <DiscoverHero />

      <ContentModule panel className="hidden lg:block">
        <SectionHeading>AI Quiz Generator</SectionHeading>
        <p className="sonke-section-lead">
          Type any topic — get a custom quiz in seconds.
        </p>
        <div className="sonke-play-actions">
          <Link href="/ai" className="sonke-btn sonke-btn-play">
            🤖 Try it free
          </Link>
        </div>
      </ContentModule>

      <ContentModule id="picture-games">
        <SectionHeading>Picture games</SectionHeading>
        <p className="sonke-section-lead">
          Live Wikipedia images — new questions every time
        </p>
        <ul className="GamesCollage_gamesGrid__jv6Iv sonke-related-grid">
          {IMAGE_GAME_MODES.map((mode) => {
            const card = pictureCard(mode);
            return (
              <li key={mode.slug}>
                <QuizCard
                  quiz={card}
                  onPlay={() => handlePictureGame(mode.slug)}
                  loading={loadingQuiz === mode.slug}
                />
              </li>
            );
          })}
        </ul>
      </ContentModule>

      <ContentModule>
        <CategoryChips
          categories={DISCOVER_CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </ContentModule>

      <ContentModule>
        <SectionHeading>
          {selectedCategory === "All" ? "All quizzes" : selectedCategory}
        </SectionHeading>
        <p className="sonke-section-lead">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </p>
        <ul className="GamesCollage_gamesGrid__jv6Iv sonke-related-grid">
          {filtered.map((quiz) => (
            <li key={quiz.id}>
              <QuizCard
                quiz={quiz}
                onPlay={handlePlay}
                loading={loadingQuiz === quiz.id}
              />
            </li>
          ))}
        </ul>
        {filtered.length === 0 && (
          <p className="sonke-search-empty">No quizzes found — try a different search.</p>
        )}
      </ContentModule>
    </SonkeAppShell>
  );
}
