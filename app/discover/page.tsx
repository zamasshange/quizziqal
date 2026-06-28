"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
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

  const handlePlay = async (quizId: string) => {
    setLoadingQuiz(quizId);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId }),
      });
      const data = await res.json();
      if (data.gameId) router.push(`/play/${data.gameId}`);
    } finally {
      setLoadingQuiz(null);
    }
  };

  const handlePictureGame = async (category: string, key: string) => {
    setLoadingQuiz(key);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: { type: "picture", slug: key, category },
        }),
      });
      const data = await res.json();
      if (data.gameId) router.push(`/play/${data.gameId}`);
    } finally {
      setLoadingQuiz(null);
    }
  };

  const pictureCard = (mode: (typeof IMAGE_GAME_MODES)[0]): Quiz => ({
    id: `pic-${mode.slug}`,
    title: mode.title,
    description: mode.subtitle ?? "Wikipedia-powered picture quiz",
    creator: "Quizziqal",
    questionCount: 10,
    plays: 120000,
    category: "Picture",
    tags: ["picture", mode.slug, "wikipedia"],
    coverGradient: `linear-gradient(135deg, ${mode.color} 0%, ${mode.color}99 100%)`,
    coverIcon: mode.emoji,
    isFree: true,
    questions: [],
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[220px]">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <main className="flex-1 p-3 pb-24 lg:p-8 lg:pb-8">
          <section
            className="mb-5 overflow-hidden rounded-xl p-5 text-white lg:mb-8 lg:rounded-2xl lg:p-12"
            style={{
              background:
                "linear-gradient(135deg, var(--kahoot-purple) 0%, var(--kahoot-purple-light) 50%, #a855f7 100%)",
            }}
          >
            <h1 className="mb-1 text-2xl font-extrabold lg:mb-2 lg:text-4xl">Discover</h1>
            <p className="mb-4 text-sm text-white/90 lg:mb-6 lg:max-w-xl lg:text-lg">
              Free quizzes powered by Wikipedia — celebrities, movies, sports & more.
            </p>
          </section>

          <section className="mb-5 lg:mb-8">
            <Link
              href="/ai"
              className="block overflow-hidden rounded-xl p-5 text-white transition-transform hover:scale-[1.01] lg:rounded-2xl lg:p-8"
              style={{
                background:
                  "linear-gradient(135deg, #5b19df 0%, #7c3aed 50%, #a855f7 100%)",
              }}
            >
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl">
                  🤖
                </span>
                <div>
                  <h2 className="text-lg font-extrabold lg:text-2xl">AI Quiz Generator</h2>
                  <p className="text-sm text-white/85 lg:text-base">
                    Type any topic — get a custom quiz in seconds
                  </p>
                </div>
              </div>
            </Link>
          </section>

          <section className="mb-5 lg:mb-8">
            <h2 className="mb-3 text-base font-bold text-gray-900 lg:mb-4 lg:text-xl">
              Picture games
            </h2>
            <p className="mb-3 text-xs text-gray-500 lg:text-sm">
              Live Wikipedia images — new questions every time
            </p>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              {IMAGE_GAME_MODES.map((mode) => {
                const card = pictureCard(mode);
                return (
                  <div
                    key={mode.slug}
                    onClick={() => handlePictureGame(mode.category, mode.slug)}
                  >
                    <QuizCard
                      quiz={card}
                      onPlay={() => handlePictureGame(mode.category, mode.slug)}
                      loading={loadingQuiz === mode.slug}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mb-4 lg:mb-6">
            <CategoryChips
              categories={DISCOVER_CATEGORIES}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between lg:mb-4">
              <h2 className="text-base font-bold text-gray-900 lg:text-xl">
                {selectedCategory === "All" ? "All quizzes" : selectedCategory}
              </h2>
              <span className="text-xs text-gray-500 lg:text-sm">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
              {filtered.map((quiz) => (
                <div key={quiz.id} onClick={() => handlePlay(quiz.id)}>
                  <QuizCard
                    quiz={quiz}
                    onPlay={handlePlay}
                    loading={loadingQuiz === quiz.id}
                  />
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="py-12 text-center lg:py-16">
                <p className="text-base text-gray-500 lg:text-lg">No quizzes found</p>
                <p className="text-xs text-gray-400 lg:text-sm">Try a different search</p>
              </div>
            )}
          </section>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
