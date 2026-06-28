import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CategoryNav from "@/components/CategoryNav";
import AiHeroCard from "@/components/AiHeroCard";
import HeroSearch from "@/components/HeroSearch";
import QuizRow from "@/components/QuizRow";
import Footer from "@/components/Footer";
import {
  homeRows,
  categories,
  getQuizzesByCategory,
  quizzes,
} from "@/lib/quizzes";
import { IMAGE_GAME_MODES } from "@/lib/imageQuestions";
import JsonLd from "@/components/JsonLd";
import { homeMetadata } from "@/lib/seo";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seoStructuredData";

export const metadata: Metadata = homeMetadata();

const TRENDING = [
  { label: "World Capitals", href: "/quiz/world-capitals" },
  { label: "Movie Mania", href: "/quiz/movie-mania" },
  { label: "Animal Kingdom", href: "/quiz/animal-kingdom" },
  { label: "World War II", href: "/quiz/world-war-two" },
];

export default function Home() {
  return (
    <div className="relative z-0 flex flex-auto flex-col">
      <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />
      <Navbar />

      <div className="pointer-events-none absolute inset-0 top-0 z-0 bg-quiz-pattern opacity-[0.05]" />

      <main className="custom-container relative z-10 flex-1 px-4 pb-4 sm:px-6 md:px-8 lg:px-12">
        {/* Category navigation */}
        <div className="py-4 md:py-6">
          <CategoryNav />
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border-4 border-ink bg-petrol shadow-[0_6px_0_0_#0d0d0d]">
          <div className="pointer-events-none absolute inset-0 bg-quiz-pattern opacity-[0.08]" />
          {/* Floating decorative stickers */}
          <span aria-hidden className="pointer-events-none absolute right-[42%] top-6 hidden rotate-12 text-4xl opacity-25 md:block">🎯</span>
          <span aria-hidden className="pointer-events-none absolute bottom-6 left-[8%] hidden -rotate-12 text-4xl opacity-20 lg:block">🧠</span>
          <span aria-hidden className="pointer-events-none absolute right-[2%] top-1/2 hidden rotate-6 text-5xl opacity-20 lg:block">🏆</span>
          <div className="relative grid gap-7 p-6 md:grid-cols-[1.15fr_0.85fr] md:items-stretch md:gap-8 md:p-10">
            <div className="flex flex-col items-start gap-4">
              <span className="rounded-full border-2 border-ink bg-lime px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-ink">
                100% free · no sign-up
              </span>
              <h1 className="font-display text-4xl font-black leading-[1.05] text-cream md:text-5xl">
                Thousands of quizzes.
                <br />
                Pick one and{" "}
                <span className="text-sky">play</span>.
              </h1>
              <p className="max-w-md text-base font-bold text-cream/70">
                Free online quiz games at Quizzical.site — geography, movie,
                sports, and flag trivia, plus picture quizzes and an AI quiz
                generator on any topic.
              </p>
              <div className="mt-1 w-full max-w-lg">
                <HeroSearch />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-cream/50">
                  Trending
                </span>
                {TRENDING.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="rounded-full border-2 border-cream/20 bg-white/5 px-3 py-1 text-xs font-extrabold text-cream/80 transition-colors hover:border-cream hover:text-cream"
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1 pt-2 text-sm font-extrabold text-cream/60">
                <span>
                  <span className="text-cream">{quizzes.length}</span> quizzes
                </span>
                <span>
                  <span className="text-cream">{categories.length}</span>{" "}
                  categories
                </span>
                <span>
                  <span className="text-cream">No ads</span> while you play
                </span>
              </div>
            </div>

            <AiHeroCard />
          </div>
        </section>

        {/* Picture guessing games */}
        <section id="picture-games" className="mt-7 scroll-mt-24">
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-2xl font-black text-ink">
              🖼️ Picture guessing games
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {IMAGE_GAME_MODES.map((mode) => (
              <Link
                key={mode.slug}
                href={`/play/${mode.slug}`}
                className="group flex flex-col"
              >
                <div
                  className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border-[3px] border-ink shadow-[0_4px_0_0_#0d0d0d] transition-all duration-100 group-hover:-translate-y-1 group-hover:shadow-[0_7px_0_0_#0d0d0d]"
                  style={{ backgroundColor: mode.color }}
                >
                  <span className="text-6xl drop-shadow-sm md:text-7xl">
                    {mode.emoji}
                  </span>
                  <span className="absolute bottom-2 right-2 rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                    ▶ Play
                  </span>
                </div>
                <h3 className="pt-2.5 text-base font-extrabold leading-tight text-ink">
                  {mode.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Quiz rows */}
        {homeRows.map((row) => (
          <QuizRow key={row.title} title={row.title} quizzes={row.quizzes} />
        ))}

        {/* Category rows */}
        {categories.map((cat) => (
          <QuizRow
            key={cat.slug}
            title={`${cat.emoji} ${cat.name}`}
            quizzes={getQuizzesByCategory(cat.slug)}
            seeAllHref={`/${cat.slug}`}
          />
        ))}
      </main>

      <Footer />
    </div>
  );
}
