"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
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
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[220px]">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <main className="flex-1 p-3 pb-24 lg:p-8 lg:pb-8">
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl font-extrabold text-gray-900 lg:text-3xl">
              📚 Library
            </h1>
            <p className="text-sm text-gray-500">
              Your full collection — {discoverQuizzes.length} quizzes to explore
            </p>
          </div>

          <section className="mb-4">
            <CategoryChips
              categories={DISCOVER_CATEGORIES}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </section>

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
            <div className="py-12 text-center">
              <p className="text-gray-500">No quizzes match your search.</p>
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
