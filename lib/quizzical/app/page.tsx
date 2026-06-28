import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CategoryNav from "@/components/CategoryNav";
import DynamicHomeHero from "@/components/atmosphere/DynamicHomeHero";
import QuizRow from "@/components/QuizRow";
import Footer from "@/components/Footer";
import { homeRows } from "@/lib/quizzes";
import { IMAGE_GAME_MODES } from "@/lib/imageQuestions";
import PictureGameGrid from "@/components/PictureGameGrid";
import HomeGameHub from "@/components/HomeGameHub";
import PlatformHub from "@/components/platform/PlatformHub";
import ExplorerHub from "@/components/progression/ExplorerHub";
import JsonLd from "@/components/JsonLd";
import { homeMetadata } from "@/lib/seo";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seoStructuredData";

export const metadata: Metadata = homeMetadata();

export default function Home() {
  return (
    <div className="relative z-0 flex flex-col">
      <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />
      <Navbar />

      <div className="pointer-events-none absolute inset-0 top-0 z-0 bg-quiz-pattern opacity-[0.05]" />

      <main className="custom-container relative z-10 px-4 pb-6 sm:px-6 md:px-8 lg:px-12">
        {/* Category strip — desktop only; mobile users see games first */}
        <div className="hidden py-6 md:block">
          <CategoryNav />
        </div>

        <DynamicHomeHero />

        {/* Picture guessing games — grouped grid with full photo previews */}
        <section id="picture-games" className="mt-3 scroll-mt-20 md:mt-7">
          <PictureGameGrid modes={IMAGE_GAME_MODES} variant="home" />
        </section>

        <HomeGameHub />

        {/* Curated quiz rows — main trivia catalogue */}
        {homeRows.map((row) => (
          <QuizRow key={row.title} title={row.title} quizzes={row.quizzes} />
        ))}

        <ExplorerHub />

        <PlatformHub />

        {/* Mobile category browse — after content so the fold shows what we offer */}
        <section id="browse-categories" className="mt-8 scroll-mt-24 md:hidden">
          <h2 className="mb-3 text-lg font-black text-ink">Browse by category</h2>
          <CategoryNav layout="grid" hideStart />
        </section>
      </main>

      <Footer />
    </div>
  );
}
