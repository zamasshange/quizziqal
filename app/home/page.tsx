"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SonkeAppShell from "@/components/skin/SonkeAppShell";
import { ContentModule, SectionHeading } from "@/components/skin/content";
import { IMAGE_GAME_MODES } from "@/lib/discoverData";

export default function HomePage() {
  const router = useRouter();

  return (
    <SonkeAppShell pageTitle="Home">
      <ContentModule className="sonke-game-hero-module">
        <div className="sonke-game-hero-copy">
          <p className="sonke-game-badge">Quizziqal</p>
          <h1 className="sonke-game-title">Let&apos;s go!</h1>
          <p className="sonke-game-tagline">
            Tap a game below — no signup, no PIN, just play.
          </p>
        </div>
      </ContentModule>

      <ContentModule>
        <SectionHeading>Quick play</SectionHeading>
        <ul className="GamesCollage_gamesGrid__jv6Iv sonke-related-grid">
          {IMAGE_GAME_MODES.map((mode) => (
            <li key={mode.slug}>
              <button
                type="button"
                onClick={() => router.push(`/play/pic-${mode.slug}`)}
                className="MediaItem_mediaLink__JSobH sonke-related-card w-full border-0 bg-transparent p-0 text-left"
              >
                <div
                  className="flex aspect-square items-center justify-center rounded-t-xl text-4xl"
                  style={{ background: `${mode.color}33` }}
                >
                  {mode.emoji}
                </div>
                <p className="MediaItem_heading__AybaX sonke-related-title">
                  {mode.title.replace(/^Guess the /, "")}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </ContentModule>

      <ContentModule panel>
        <div className="sonke-play-actions">
          <Link href="/discover" className="sonke-btn sonke-btn-play">
            🔍 Browse all quizzes
          </Link>
          <Link href="/ai" className="sonke-btn sonke-btn-secondary">
            🤖 Make an AI quiz
          </Link>
        </div>
      </ContentModule>
    </SonkeAppShell>
  );
}
