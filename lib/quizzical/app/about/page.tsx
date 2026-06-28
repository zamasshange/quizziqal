import Link from "next/link";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import JsonLd from "@/components/JsonLd";
import {
  FeatureGrid,
  InfoCard,
  InfoHero,
  InfoProse,
  InfoSection,
} from "@/components/info/InfoPageParts";
import AppIcon from "@/components/icons/AppIcon";
import { aboutMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seoStructuredData";

export const metadata: Metadata = aboutMetadata();

const FEATURES = [
  {
    icon: "sparkles" as const,
    title: "AI-powered questions",
    description:
      "Fresh, dynamic quizzes generated with Google Gemini — tailored to your topic and difficulty.",
    color: "#b15bff",
  },
  {
    icon: "book" as const,
    title: "Trusted sources",
    description:
      "Wikipedia, TMDB, and sports databases power our picture quizzes with real, verifiable content.",
    color: "#4d8dff",
  },
  {
    icon: "gamepad" as const,
    title: "Interactive gameplay",
    description:
      "Timed rounds, multiple choice, score tracking, and streaks keep every session engaging.",
    color: "#ff9f43",
  },
  {
    icon: "lightbulb" as const,
    title: "Learn after every answer",
    description:
      "Reveal cards with facts, images, and context so you walk away smarter than when you started.",
    color: "#00a76d",
  },
];

export default function AboutPage() {
  return (
    <SiteShell showCategories={false}>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About Quizzical",
            description:
              "AI-powered quiz platform combining entertainment with education by BDL Corp.",
            url: "https://quizzical.site/about",
          },
        ]}
      />

      <div className="mx-auto flex max-w-4xl flex-col gap-10 pb-4 md:gap-14">
        <InfoHero
          icon="brain"
          title="About Us"
          subtitle="Welcome to our AI-powered quiz platform, where learning meets entertainment."
        />

        <InfoSection icon="target" title="Our mission">
          <InfoCard>
            <InfoProse>
              <p>
                Our mission is to make knowledge fun, engaging, and accessible
                to everyone. We combine artificial intelligence, trusted
                information sources, and interactive gameplay to create a
                unique quiz experience that goes beyond simply answering
                questions.
              </p>
              <p>
                Unlike traditional quiz websites, our platform is designed to
                help users learn while they play. After each question, players
                can discover interesting facts, images, and educational
                information related to the topic they just answered.
              </p>
            </InfoProse>
          </InfoCard>
        </InfoSection>

        <InfoSection icon="sparkles" title="What makes us different">
          <FeatureGrid items={FEATURES} />
        </InfoSection>

        <InfoSection icon="globe" title="Topics we cover">
          <InfoCard>
            <InfoProse>
              <p>
                Our quizzes cover a wide range of categories including
                geography, sports, science, history, entertainment, movies,
                music, world cultures, landmarks, and more.
              </p>
              <p>
                By combining AI-generated questions with trusted educational
                sources, we aim to create a platform that is informative,
                engaging, and continuously evolving.
              </p>
            </InfoProse>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "Geography",
                "Sports",
                "Science",
                "History",
                "Movies",
                "Music",
                "Culture",
                "Landmarks",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border-2 border-ink/15 bg-cream px-3 py-1 text-xs font-extrabold text-ink/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </InfoCard>
        </InfoSection>

        <InfoSection icon="gamepad" title="Learning through play">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <InfoCard>
              <InfoProse>
                <p>
                  Whether you&apos;re testing your knowledge, challenging
                  friends, or learning something new every day, we&apos;re here
                  to make the journey enjoyable.
                </p>
                <p>
                  Every round is built around the idea that play and education
                  belong together — because the best way to remember something
                  is to have fun discovering it.
                </p>
              </InfoProse>
            </InfoCard>
            <div
              className="flex h-32 w-full items-center justify-center rounded-2xl border-4 border-ink bg-lime shadow-[0_4px_0_0_#0d0d0d] md:h-40 md:w-40 md:shrink-0"
              aria-hidden
            >
              <AppIcon name="trophy" size={56} className="text-ink" />
            </div>
          </div>
        </InfoSection>

        <InfoCard className="text-center">
          <p className="text-lg font-extrabold text-ink">
            Thank you for being part of our community.
          </p>
          <p className="mt-2 text-sm font-semibold text-ink/60">
            Ready to play?{" "}
            <Link href="/" className="font-extrabold text-grass underline-offset-2 hover:underline">
              Browse quizzes
            </Link>{" "}
            or{" "}
            <Link href="/ai" className="font-extrabold text-grass underline-offset-2 hover:underline">
              generate an AI quiz
            </Link>
            .
          </p>
        </InfoCard>
      </div>


    </SiteShell>
  );
}
