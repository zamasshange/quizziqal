"use client";

import CategoryBackground from "@/components/atmosphere/CategoryBackground";
import CategoryIcon from "@/components/icons/CategoryIcon";
import type { Category } from "@/lib/quizzes";

type Props = {
  category: Category;
  totalItems: number;
  totalPlays: number;
  quizCount: number;
  pictureCount: number;
};

export default function CategoryBanner({
  category,
  totalItems,
  totalPlays,
  quizCount,
  pictureCount,
}: Props) {
  return (
    <section
      className="relative overflow-hidden rounded-3xl border-4 border-ink shadow-[0_6px_0_0_#0d0d0d]"
      style={{ backgroundColor: category.color }}
    >
      <CategoryBackground categorySlug={category.slug}>
        <div className="pointer-events-none absolute inset-0 bg-quiz-pattern opacity-[0.12]" />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-2 -top-4 select-none opacity-15 md:-right-4 md:-top-6"
        >
          <CategoryIcon slug={category.slug} size={120} className="text-white" />
        </span>
        <div className="relative flex flex-col gap-3 p-6 md:p-8">
          <span className="w-fit rounded-full border-2 border-ink bg-white/90 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-ink">
            Category
          </span>
          <h1 className="flex items-center gap-3 font-display text-4xl font-black leading-none text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.35)] md:text-5xl">
            <CategoryIcon slug={category.slug} size={40} className="text-white" />
            {category.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-extrabold text-white/90">
            <span>
              {totalItems} {totalItems === 1 ? "game" : "games"}
              {pictureCount > 0 && quizCount > 0 && (
                <span className="font-bold text-white/70">
                  {" "}
                  ({quizCount} quizzes · {pictureCount} picture)
                </span>
              )}
            </span>
            <span>{totalPlays.toLocaleString()} plays</span>
            <span>Signature: {category.tag}</span>
          </div>
        </div>
      </CategoryBackground>
    </section>
  );
}
