import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import PublicProfileClient from "@/components/PublicProfileClient";
import { buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return buildMetadata({
    title: `${decodeURIComponent(username)} — Player Profile`,
    description: `View ${decodeURIComponent(username)}'s XP, level, achievements, and discoveries on Quizzical.`,
    path: `/profile/${username}`,
    keywords: ["player profile", "quiz XP", "leaderboard"],
  });
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;

  return (
    <SiteShell showCategories={false}>
      <PublicProfileClient username={decodeURIComponent(username)} />
    </SiteShell>
  );
}
