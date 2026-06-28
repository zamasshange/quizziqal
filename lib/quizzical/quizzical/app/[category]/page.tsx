import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CategoryNav from "@/components/CategoryNav";
import FilterChips, { type Chip } from "@/components/FilterChips";
import QuizGrid from "@/components/QuizGrid";
import QuizRow from "@/components/QuizRow";
import Footer from "@/components/Footer";
import {
  categories,
  getCategory,
  getQuizzesByCategory,
  quizzes,
} from "@/lib/quizzes";
import JsonLd from "@/components/JsonLd";
import { categoryMetadata } from "@/lib/seo";
import {
  breadcrumbJsonLd,
  categoryCollectionJsonLd,
} from "@/lib/seoStructuredData";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata(
  props: PageProps<"/[category]">,
): Promise<Metadata> {
  const { category } = await props.params;
  const found = getCategory(category);
  if (!found) return { title: "Not found" };
  return categoryMetadata(found);
}

export default async function CategoryPage(props: PageProps<"/[category]">) {
  const { category } = await props.params;
  const found = getCategory(category);

  if (!found) {
    notFound();
  }

  // Only this category's quizzes — accurate, no padding with unrelated ones.
  const own = getQuizzesByCategory(found.slug).sort((a, b) => b.plays - a.plays);
  const totalPlays = own.reduce((sum, q) => sum + q.plays, 0);
  const others = quizzes.filter((q) => q.category !== found.slug);

  const chips: Chip[] = [
    { label: "All", href: "/", count: quizzes.length, emoji: "✨" },
    ...categories.map((c) => ({
      label: c.name,
      href: `/${c.slug}`,
      count: getQuizzesByCategory(c.slug).length,
      emoji: c.emoji,
      active: c.slug === found.slug,
    })),
  ];

  return (
    <div className="relative z-0 flex flex-auto flex-col">
      <JsonLd
        data={[
          categoryCollectionJsonLd(found, own.length),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: found.name, path: `/${found.slug}` },
          ]),
        ]}
      />
      <Navbar />
      <div className="pointer-events-none absolute inset-0 top-0 z-0 bg-quiz-pattern opacity-[0.05]" />

      <main className="custom-container relative z-10 flex-1 px-4 pb-10 sm:px-6 md:px-8 lg:px-12">
        <div className="py-4 md:py-6">
          <CategoryNav />
        </div>

        {/* Category header banner */}
        <section
          className="relative overflow-hidden rounded-3xl border-4 border-ink shadow-[0_6px_0_0_#0d0d0d]"
          style={{ backgroundColor: found.color }}
        >
          <div className="pointer-events-none absolute inset-0 bg-quiz-pattern opacity-[0.12]" />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-4 -top-6 select-none text-[9rem] leading-none opacity-20 md:text-[12rem]"
          >
            {found.emoji}
          </span>
          <div className="relative flex flex-col gap-3 p-6 md:p-8">
            <span className="w-fit rounded-full border-2 border-ink bg-white/90 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-ink">
              Category
            </span>
            <h1 className="font-display text-4xl font-black leading-none text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.35)] md:text-5xl">
              {found.emoji} {found.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-extrabold text-white/90">
              <span>
                {own.length} {own.length === 1 ? "quiz" : "quizzes"}
              </span>
              <span>{totalPlays.toLocaleString()} plays</span>
              <span>Signature: {found.tag}</span>
            </div>
          </div>
        </section>

        {/* Real, working category filter chips */}
        <div className="mt-5">
          <FilterChips chips={chips} />
        </div>

        {/* This category's quizzes */}
        <section className="mt-6">
          <h2 className="mb-3 text-2xl font-black text-ink">
            All {found.name} quizzes
          </h2>
          <QuizGrid quizzes={own} />
        </section>

        {/* Honest cross-sell from other categories */}
        <QuizRow title="More quizzes to explore" quizzes={others} />
      </main>

      <Footer />
    </div>
  );
}
