"use client";

import Link from "next/link";

const FLOATERS = ["🎯", "⚡", "🏆", "🎮", "✨", "🔥"];

export default function DiscoverHero() {
  return (
    <section className="game-hero mb-3 overflow-hidden rounded-xl p-3.5 text-white lg:mb-8 lg:rounded-3xl lg:p-10">
      {FLOATERS.map((emoji, i) => (
        <span
          key={emoji}
          className={`game-hero-emoji animate-float hidden lg:block ${i % 2 ? "animate-float-slow" : ""}`}
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

      {/* ── Mobile: compact ticket-style banner ── */}
      <div className="relative z-10 lg:hidden">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-white/30 bg-white/15 text-2xl">
            🎯
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-extrabold leading-tight">Ready to play?</h1>
            <p className="mt-0.5 text-xs text-white/75">
              Free · Wiki pics · timed rounds
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <a
            href="#picture-games"
            className="game-pill flex-1 rounded-full bg-yellow-300 py-2.5 text-center text-xs font-extrabold text-[var(--game-ink)]"
          >
            ▶ Play now
          </a>
          <Link
            href="/ai"
            className="game-pill flex-1 rounded-full border-2 border-white/35 bg-white/10 py-2.5 text-center text-xs font-bold text-white"
          >
            🤖 AI quiz
          </Link>
        </div>
      </div>

      {/* ── Desktop: full hero ── */}
      <div className="relative z-10 hidden lg:block">
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

        <h1 className="mb-2 text-5xl font-extrabold leading-tight">Ready to play?</h1>
        <p className="mb-5 max-w-lg text-lg leading-relaxed text-white/90">
          Guess celebrities, sports stars, movies & more — with real photos,
          timed rounds, and learn-something-new reveals after every answer.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#picture-games"
            className="game-pill animate-pulse-glow rounded-full bg-yellow-300 px-6 py-3 text-base font-extrabold text-[var(--game-ink)]"
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
            <p className="text-3xl font-extrabold">50+</p>
            <p className="text-xs font-semibold text-white/70">Quizzes</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold">197</p>
            <p className="text-xs font-semibold text-white/70">Countries</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold">∞</p>
            <p className="text-xs font-semibold text-white/70">AI topics</p>
          </div>
        </div>
      </div>
    </section>
  );
}
