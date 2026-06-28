"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
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
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[220px]">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <main className="flex-1 p-3 pb-24 lg:p-8 lg:pb-8">
          <DiscoverHero />

          <section className="mb-5 hidden lg:mb-8 lg:block">
            <Link
              href="/ai"
              className="quiz-card group block overflow-hidden rounded-2xl border-2 border-purple-200/60 bg-white p-0 shadow-lg transition-transform hover:scale-[1.01]"
            >
              <div
                className="relative flex items-center gap-4 p-5 text-white lg:p-8"
                style={{
                  background:
                    "linear-gradient(135deg, #5b19df 0%, #7c3aed 55%, #c026d3 100%)",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                />
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/20 text-3xl shadow-lg transition-transform group-hover:scale-110 lg:h-16 lg:w-16">
                  🤖
                </span>
                <div className="relative z-10">
                  <h2 className="text-lg font-extrabold lg:text-2xl">AI Quiz Generator</h2>
                  <p className="text-sm text-white/85 lg:text-base">
                    Type any topic — get a custom quiz in seconds
                  </p>
                  <span className="mt-2 inline-block rounded-full border-2 border-white/40 bg-white/15 px-3 py-1 text-xs font-bold">
                    Try it free →
                  </span>
                </div>
              </div>
            </Link>
          </section>

          <section id="picture-games" className="mb-5 lg:mb-8">
            <h2 className="mb-1 text-base font-extrabold text-gray-900 lg:mb-2 lg:text-xl">
              🖼️ Picture games
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
                    onClick={() => handlePictureGame(mode.slug)}
                  >
                    <QuizCard
                      quiz={card}
                      onPlay={() => handlePictureGame(mode.slug)}
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
