import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CategoryNav from "@/components/CategoryNav";
import FilterChips, { type Chip } from "@/components/FilterChips";
import QuizGrid from "@/components/QuizGrid";
import QuizRow from "@/components/QuizRow";
import PictureGameGrid from "@/components/PictureGameGrid";
import Footer from "@/components/Footer";
import {
  categories,
  getCategory,
  getQuizzesByCategory,
  quizzes,
} from "@/lib/quizzes";
import { getCategoryBrowseCounts } from "@/lib/categoryBrowse";
import { getPictureGamesByQuizCategory } from "@/lib/imageQuestions";
import JsonLd from "@/components/JsonLd";
import { categoryMetadata } from "@/lib/seo";
import {
  breadcrumbJsonLd,
  categoryCollectionJsonLd,
} from "@/lib/seoStructuredData";
import SeoInternalLinks from "@/components/seo/SeoInternalLinks";
import CategoryBanner from "@/components/atmosphere/CategoryBanner";
import CategoryWorldBanner from "@/components/progression/CategoryWorldBanner";

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
  const pictureGames = getPictureGamesByQuizCategory(found.slug);
  const totalItems = own.length + pictureGames.length;
  const totalPlays = own.reduce((sum, q) => sum + q.plays, 0);
  const others = quizzes.filter((q) => q.category !== found.slug);
  const browseCounts = getCategoryBrowseCounts();

  const chips: Chip[] = [
    { label: "All", href: "/", count: quizzes.length, emoji: "✨" },
    ...categories.map((c) => ({
      label: c.name,
      href: `/${c.slug}`,
      count: browseCounts[c.slug],
      emoji: c.emoji,
      active: c.slug === found.slug,
    })),
  ];

  return (
    <div className="relative z-0 flex flex-col">
      <JsonLd
        data={[
          categoryCollectionJsonLd(found, totalItems),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: found.name, path: `/${found.slug}` },
          ]),
        ]}
      />
      <Navbar />
      <div className="pointer-events-none absolute inset-0 top-0 z-0 bg-quiz-pattern opacity-[0.05]" />

      <main className="custom-container relative z-10 px-4 pb-6 sm:px-6 md:px-8 lg:px-12">
        <div className="py-4 md:py-6">
          <CategoryNav />
        </div>

        <CategoryBanner
          category={found}
          totalItems={totalItems}
          totalPlays={totalPlays}
          quizCount={own.length}
          pictureCount={pictureGames.length}
        />

        <CategoryWorldBanner categorySlug={found.slug} categoryName={found.name} />

        {/* Real, working category filter chips */}
        <div className="mt-5">
          <FilterChips chips={chips} />
        </div>

        {pictureGames.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-2xl font-black text-ink">
              🖼️ Picture guessing games
            </h2>
            <PictureGameGrid modes={pictureGames} variant="compact" />
          </section>
        )}

        {/* This category's text quizzes */}
        <section className="mt-6">
          <h2 className="mb-3 text-2xl font-black text-ink">
            {pictureGames.length > 0 ? "Trivia quizzes" : `All ${found.name} quizzes`}
          </h2>
          <QuizGrid quizzes={own} />
        </section>

        {/* Honest cross-sell from other categories */}
        <QuizRow title="More quizzes to explore" quizzes={others} />

        <SeoInternalLinks categorySlug={found.slug} />
      </main>

      <Footer />
    </div>
  );
}
