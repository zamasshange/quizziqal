"use client";

import Link from "next/link";

const FLOATERS = ["🎯", "⚡", "🏆", "🎮", "✨", "🔥"];

export default function DiscoverHero() {
  return (
    <section className="game-hero mb-5 overflow-hidden rounded-2xl p-5 text-white lg:mb-8 lg:rounded-3xl lg:p-10">
      {FLOATERS.map((emoji, i) => (
        <span
          key={emoji}
          className={`game-hero-emoji animate-float ${i % 2 ? "animate-float-slow" : ""}`}
          style={{
            top: `${12 + (i % 3) * 28}%`,
            left: `${8 + i * 15}%`,
            animationDelay: `${i * 0.4}s`,
          }}
          aria-hidden
        >
          {emoji}
        </span>
      ))}

      <div className="relative z-10">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full border-2 border-white/30 bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">
            🎉 Free to play
          </span>
          <span className="rounded-full border-2 border-white/30 bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">
            📸 Live Wikipedia pics
          </span>
          <span className="rounded-full border-2 border-white/30 bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">
            🤖 AI quizzes
          </span>
        </div>

        <h1 className="mb-2 text-3xl font-extrabold leading-tight lg:text-5xl">
          Ready to play?
        </h1>
        <p className="mb-5 max-w-lg text-sm leading-relaxed text-white/90 lg:text-lg">
          Guess celebrities, sports stars, movies & more — with real photos,
          timed rounds, and learn-something-new reveals after every answer.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#picture-games"
            className="game-pill animate-pulse-glow rounded-full bg-yellow-300 px-6 py-3 text-sm font-extrabold text-[var(--game-ink)] lg:text-base"
          >
            ▶ Jump into a game
          </a>
          <Link
            href="/ai"
            className="rounded-full border-2 border-white/40 bg-white/10 px-5 py-3 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            🤖 Make an AI quiz
          </Link>
        </div>

        <div className="mt-6 flex gap-6 border-t border-white/20 pt-5">
          <div>
            <p className="text-2xl font-extrabold lg:text-3xl">50+</p>
            <p className="text-xs font-semibold text-white/70">Quizzes</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold lg:text-3xl">197</p>
            <p className="text-xs font-semibold text-white/70">Countries</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold lg:text-3xl">∞</p>
            <p className="text-xs font-semibold text-white/70">AI topics</p>
          </div>
        </div>
      </div>
    </section>
  );
}
