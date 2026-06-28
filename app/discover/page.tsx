"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import QuizCard from "@/components/discover/QuizCard";
import CategoryChips from "@/components/discover/CategoryChips";
import { quizzes, CATEGORIES } from "@/lib/quizzes";

export default function DiscoverPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loadingQuiz, setLoadingQuiz] = useState<string | null>(null);

  const filtered = quizzes.filter((q) => {
    const matchesSearch =
      !searchQuery ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" ||
      q.category === selectedCategory ||
      (selectedCategory === "Featured" && q.plays > 1_000_000);

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
      if (data.gameId) {
        router.push(`/play/${data.gameId}`);
      }
    } finally {
      setLoadingQuiz(null);
    }
  };

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
              Explore ready-to-use quizzes made by teachers and students worldwide.
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide lg:flex-wrap lg:overflow-visible">
              <button className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-bold text-[var(--kahoot-purple)] lg:px-6 lg:py-2.5 lg:text-sm">
                Top picks
              </button>
              <button className="shrink-0 rounded-full border-2 border-white/50 px-4 py-2 text-xs font-bold text-white lg:px-6 lg:py-2.5 lg:text-sm lg:hover:bg-white/10">
                Trending
              </button>
              <button className="shrink-0 rounded-full border-2 border-white/50 px-4 py-2 text-xs font-bold text-white lg:px-6 lg:py-2.5 lg:text-sm lg:hover:bg-white/10">
                New
              </button>
            </div>
          </section>

          <section className="mb-5 lg:mb-8">
            <h2 className="mb-3 text-base font-bold text-gray-900 lg:mb-4 lg:text-xl">
              Top picks for all
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible">
              {[
                { title: "Family Fun Night", emoji: "👨‍👩‍👧‍👦", color: "#46178f" },
                { title: "Monday Motivation", emoji: "💪", color: "#1368ce" },
                { title: "Science & Nature", emoji: "🌿", color: "#26890c" },
                { title: "Pop Culture", emoji: "🎬", color: "#e21b3c" },
              ].map((collection) => (
                <div
                  key={collection.title}
                  className="flex w-[120px] shrink-0 flex-col items-center gap-2 rounded-xl bg-white p-3 shadow-sm lg:w-auto lg:flex-row lg:gap-4 lg:p-4 lg:hover:shadow-md"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-xl lg:h-14 lg:w-14 lg:text-2xl"
                    style={{ background: `${collection.color}20` }}
                  >
                    {collection.emoji}
                  </div>
                  <span className="text-center text-[11px] font-bold leading-tight text-gray-800 lg:text-left lg:text-sm">
                    {collection.title}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-4 lg:mb-6">
            <CategoryChips
              categories={CATEGORIES}
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
