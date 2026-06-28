import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import LeaderboardClient from "@/components/LeaderboardClient";
import AppIcon from "@/components/icons/AppIcon";
import { buildMetadata } from "@/lib/seo";
import { BASE_KEYWORDS } from "@/lib/seoKeywords";

export const metadata: Metadata = buildMetadata({
  title: "Leaderboard",
  description:
    "Global XP leaderboard on Quizzical — compete by country, category, and weekly rankings. Live updates as players earn XP.",
  path: "/leaderboard",
  keywords: [...BASE_KEYWORDS, "quiz leaderboard", "XP rankings", "top players"],
});

export default function LeaderboardPage() {
  return (
    <SiteShell showCategories={false}>
      <div className="mx-auto max-w-3xl pb-4">
        <h1 className="flex items-center gap-3 font-display text-4xl font-black text-ink">
          <AppIcon name="trophy" size={36} className="text-grass" />
          Leaderboard
        </h1>
        <p className="mt-2 font-bold text-ink/60">
          Compete globally by XP. Rankings update live as players learn, discover,
          and complete quizzes.
        </p>
        <div className="mt-6">
          <LeaderboardClient />
        </div>
      </div>

    </SiteShell>
  );
}
