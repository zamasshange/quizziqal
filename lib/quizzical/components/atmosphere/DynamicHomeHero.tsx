"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Suspense } from "react";
import HeroSearch from "@/components/HeroSearch";
import AiHeroCard from "@/components/AiHeroCard";
import CategoryBackground from "@/components/atmosphere/CategoryBackground";
import MicroFloat from "@/components/atmosphere/MicroFloat";
import SeasonalBanner from "@/components/atmosphere/SeasonalBanner";
import { useProgression } from "@/lib/progression/client";
import { xpToNextLevel } from "@/lib/progression/xp";
import { categories, quizzes } from "@/lib/quizzes";

const TAGLINES = [
  "Build your legacy as a Knowledge Explorer.",
  "Complete the Atlas. Win Seasons. Enter the Hall of Fame.",
  "Every answer unlocks something new.",
  "Become a Knowledge Legend.",
];

const TRENDING = [
  { label: "World Capitals", href: "/quiz/world-capitals" },
  { label: "Movie Mania", href: "/quiz/movie-mania" },
  { label: "Animal Kingdom", href: "/quiz/animal-kingdom" },
  { label: "World War II", href: "/quiz/world-war-two" },
];

export default function DynamicHomeHero() {
  const { state, loaded } = useProgression();
  const tagline = TAGLINES[new Date().getDate() % TAGLINES.length];
  const xpBar = loaded ? xpToNextLevel(state.xp) : null;

  return (
    <section className="relative w-full overflow-hidden rounded-2xl border-[3px] border-ink bg-petrol shadow-[0_4px_0_0_#0d0d0d] md:rounded-3xl md:border-4 md:shadow-[0_6px_0_0_#0d0d0d]">
      <CategoryBackground categorySlug="home" showParticles={false}>
        <div className="pointer-events-none absolute inset-0 bg-quiz-pattern opacity-[0.08]" />

        <div className="relative grid w-full gap-2 p-4 md:grid-cols-2 md:items-stretch md:gap-6 md:p-8 lg:p-10">
          <div className="flex w-full flex-col items-start gap-2 md:gap-3">
            <SeasonalBanner className="pointer-events-auto hidden w-full max-w-md sm:block" />

            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              <span className="hidden rounded-full border-2 border-ink bg-lime px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-ink sm:inline-flex">
                100% free · no sign-up
              </span>
              {loaded && (
                <>
                <span className="hidden rounded-full border-2 border-cream/25 bg-white/10 px-3 py-1 text-xs font-extrabold text-cream/80 sm:inline-flex">
                  {state.knowledgeRankEmoji} {state.knowledgeRank ?? state.title} · Lv.{state.level} · 🔥 {state.currentStreak}d
                </span>
                {state.atlas && (
                  <span className="hidden rounded-full border-2 border-cream/25 bg-white/10 px-3 py-1 text-xs font-extrabold text-cream/80 lg:inline-flex">
                    🗺️ Atlas {state.atlas.overallPct}%
                  </span>
                )}
                </>
              )}
            </div>

            <h1 className="font-display text-xl font-black leading-tight text-cream sm:text-3xl md:text-4xl lg:text-5xl">
              Quizzical.
              <span className="text-sky"> {tagline}</span>
            </h1>

            {loaded && xpBar && (
              <div className="hidden w-full max-w-md sm:block">
                <div className="h-1.5 overflow-hidden rounded-full border border-cream/25 bg-ink/20">
                  <motion.div
                    className="h-full bg-sky"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpBar.progress * 100}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            <p className="hidden max-w-md text-sm font-bold text-cream/70 sm:block md:text-base">
              Discover the world, compete globally, unlock achievements, and earn your place in the Hall of Fame.
            </p>

            <div className="w-full max-w-lg">
              <Suspense fallback={null}>
                <HeroSearch />
              </Suspense>
            </div>

            <Link
              href="/ai"
              className="inline-flex items-center gap-1 rounded-full border border-ink bg-grass px-3 py-1 text-xs font-extrabold text-white shadow-[0_2px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5 sm:border-2 sm:px-4 sm:py-2 sm:text-sm md:hidden"
            >
              ✨ AI Quiz Generator →
            </Link>

            <div className="hidden flex-wrap items-center gap-2 md:flex">
              <span className="text-xs font-extrabold uppercase tracking-wide text-cream/50">
                Trending
              </span>
              {TRENDING.map((t, i) => (
                <MicroFloat key={t.href} delay={i * 0.15} y={2}>
                  <Link
                    href={t.href}
                    className="rounded-full border-2 border-cream/20 bg-white/5 px-3 py-1 text-xs font-extrabold text-cream/80 transition-colors hover:border-cream hover:text-cream"
                  >
                    {t.label}
                  </Link>
                </MicroFloat>
              ))}
            </div>

            <div className="hidden flex-wrap items-center gap-x-4 gap-y-1 text-xs font-extrabold text-cream/55 md:flex">
              <span>
                <span className="text-cream">{quizzes.length}</span> quizzes
              </span>
              <span>
                <span className="text-cream">{categories.length}</span> categories
              </span>
              <span>
                <span className="text-cream">No ads</span>
              </span>
            </div>

            <a
              href="#picture-games"
              className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-20 focus:rounded-lg focus:bg-cream focus:px-2 focus:py-1 focus:text-ink md:hidden"
            >
              Browse picture games
            </a>
          </div>

          <div className="hidden md:flex md:min-h-0 md:w-full">
            <AiHeroCard className="h-full w-full" />
          </div>
        </div>
      </CategoryBackground>
    </section>
  );
}
