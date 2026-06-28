"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useProgression } from "@/lib/progression/client";
import SiteShell from "@/components/SiteShell";

export default function AchievementsClient() {
  const { state, loaded } = useProgression();

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl pb-8">
        <h1 className="font-display text-4xl font-black text-ink">🏅 Achievements</h1>
        <p className="mt-2 font-bold text-ink/60">
          Unlock badges and titles as you explore, learn, and compete.
        </p>

        {state.badges.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-black text-ink">Your badges</h2>
            <div className="flex flex-wrap gap-2">
              {state.badges.map((b) => (
                <span
                  key={b.id}
                  className="rounded-full border-2 border-ink bg-lime/40 px-3 py-1.5 text-sm font-extrabold text-ink"
                >
                  {b.emoji} {b.label}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-black text-ink">Achievement progress</h2>
          {!loaded ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-cream-dark" />
              ))}
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {state.achievements.map((a) => {
                const pct = Math.min(100, Math.round((a.progress / a.target) * 100));
                return (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border-4 border-ink p-4 shadow-[0_4px_0_0_#0d0d0d] ${
                      a.unlocked ? "bg-lime/30" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{a.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-ink">
                          {a.title}
                          {a.unlocked && (
                            <span className="ml-2 text-xs text-grass">Unlocked ✓</span>
                          )}
                        </p>
                        <p className="text-sm font-semibold text-ink/55">{a.description}</p>
                        <div className="mt-2 h-2 overflow-hidden rounded-full border border-ink/20 bg-cream">
                          <div
                            className={`h-full ${a.unlocked ? "bg-grass" : "bg-grass/60"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs font-bold text-ink/45">
                          {Math.min(a.progress, a.target).toLocaleString()} /{" "}
                          {a.target.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </section>

        <Link
          href="/profile"
          className="mt-8 inline-block text-sm font-extrabold text-grass hover:underline"
        >
          ← Back to profile
        </Link>
      </div>
    </SiteShell>
  );
}
