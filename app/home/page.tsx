"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { IMAGE_GAME_MODES } from "@/lib/discoverData";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[220px]">
        <Header searchQuery="" onSearchChange={() => {}} />

        <main className="flex-1 p-3 pb-24 lg:p-8 lg:pb-8">
          <section className="game-hero mb-4 overflow-hidden rounded-2xl p-4 text-white lg:mb-8 lg:p-8">
            <div className="relative z-10">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-white/60">
                Quizziqal
              </p>
              <h1 className="text-2xl font-extrabold leading-tight lg:text-4xl">
                Let&apos;s go! 🎮
              </h1>
              <p className="mt-1 text-sm text-white/80 lg:text-base">
                Tap a game below — no signup, no PIN, just play.
              </p>
            </div>
          </section>

          <section className="mb-5">
            <h2 className="mb-2 text-sm font-extrabold text-gray-900 lg:text-lg">
              ⚡ Quick play
            </h2>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
              {IMAGE_GAME_MODES.map((mode) => (
                <button
                  key={mode.slug}
                  type="button"
                  onClick={() => router.push(`/play/pic-${mode.slug}`)}
                  className="game-pill flex items-center gap-2.5 rounded-xl border-2 border-purple-100 bg-white p-3 text-left shadow-sm active:scale-[0.98] lg:p-4"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ background: `${mode.color}22` }}
                  >
                    {mode.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-extrabold text-gray-900 lg:text-sm">
                      {mode.title.replace(/^Guess the /, "")}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400">
                      Tap to play →
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-2 sm:grid-cols-2">
            <Link
              href="/discover"
              className="game-pill rounded-xl bg-[var(--kahoot-purple)] px-4 py-3.5 text-center text-sm font-extrabold text-white shadow-md"
            >
              🔍 Browse all quizzes
            </Link>
            <Link
              href="/ai"
              className="game-pill rounded-xl border-2 border-purple-200 bg-white px-4 py-3.5 text-center text-sm font-extrabold text-[var(--kahoot-purple)]"
            >
              🤖 Make an AI quiz
            </Link>
          </section>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
