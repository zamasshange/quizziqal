"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SonkeAppShell from "@/components/skin/SonkeAppShell";
import { ContentModule, SectionHeading } from "@/components/skin/content";
import QuizCard from "@/components/discover/QuizCard";
import CategoryChips from "@/components/discover/CategoryChips";
import { discoverQuizzes, DISCOVER_CATEGORIES } from "@/lib/discoverData";

export default function LibraryPage() {
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

  return (
    <SonkeAppShell
      pageTitle="Library"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search library…"
    >
      <ContentModule className="sonke-game-hero-module">
        <div className="sonke-game-hero-copy">
          <p className="sonke-game-badge">Library</p>
          <h1 className="sonke-game-title">Your collection</h1>
          <p className="sonke-game-tagline">
            {discoverQuizzes.length} quizzes to explore — pick one and play.
          </p>
        </div>
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
      </ContentModule>
    </SonkeAppShell>
  );
}
