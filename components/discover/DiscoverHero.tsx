"use client";

import Link from "next/link";

export default function DiscoverHero() {
  return (
    <section className="sonke-inner-section sonke-game-hero-module">
      <div className="sonke-game-hero-copy">
        <p className="sonke-game-badge">Free to play</p>
        <h1 className="sonke-game-title">Ready to play?</h1>
        <p className="sonke-game-tagline">
          Guess celebrities, sports stars, movies &amp; more — with real photos,
          timed rounds, and learn-something-new reveals.
        </p>
        <ul className="sonke-meta-bar">
          <li>50+ Quizzes</li>
          <li>197 Countries</li>
          <li>∞ AI topics</li>
        </ul>
        <div className="sonke-play-actions">
          <a href="#picture-games" className="sonke-btn sonke-btn-play">
            ▶ Jump into a game
          </a>
          <Link href="/ai" className="sonke-btn sonke-btn-secondary">
            🤖 Make an AI quiz
          </Link>
        </div>
      </div>
    </section>
  );
}
