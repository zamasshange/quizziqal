"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProgression } from "@/lib/progression/client";
import NextUnlockWidget from "./NextUnlockWidget";
import WorldMapProgress from "./WorldMapProgress";

export default function KnowledgeAtlasClient() {
  const { state, loaded } = useProgression();
  const [legend, setLegend] = useState(state.legend);

  useEffect(() => {
    if (state.legend) setLegend(state.legend);
  }, [state.legend]);

  if (!loaded || !state.atlas) {
    return (
      <div className="py-16 text-center font-bold text-ink/50">
        Loading your atlas…
      </div>
    );
  }

  const { atlas } = state;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="text-center">
        <span className="text-5xl">🗺️</span>
        <h1 className="mt-2 font-display text-3xl font-black text-ink">
          World Knowledge Atlas
        </h1>
        <p className="mt-2 font-bold text-ink/60">
          Your lifelong quest to discover everything. Quizzical&apos;s knowledge Pokédex.
        </p>
        <div className="mx-auto mt-4 max-w-md">
          <div className="mb-1 flex justify-between text-xs font-extrabold uppercase text-ink/45">
            <span>Overall completion</span>
            <span>{atlas.overallPct}%</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full border-2 border-ink bg-white">
            <div
              className="h-full bg-gradient-to-r from-grass to-sky transition-all"
              style={{ width: `${atlas.overallPct}%` }}
            />
          </div>
          <p className="mt-1 text-sm font-bold text-ink/55">
            {atlas.overallLearned.toLocaleString()} / {atlas.overallTotal.toLocaleString()} entries
          </p>
        </div>
      </header>

      <NextUnlockWidget />

      <WorldMapProgress />

      <div className="grid gap-3 sm:grid-cols-2">
        {atlas.tracks.map((track) => (
          <div
            key={track.id}
            className="rounded-2xl border-4 border-ink bg-white p-4 shadow-[0_4px_0_0_#0d0d0d]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-display text-lg font-black text-ink">
                <span>{track.emoji}</span>
                {track.label}
              </span>
              <span className="text-sm font-extrabold text-grass">{track.pct}%</span>
            </div>
            <p className="mt-1 text-sm font-bold text-ink/55">
              {track.learned.toLocaleString()} / {track.total.toLocaleString()}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full border border-ink bg-cream">
              <div
                className="h-full bg-grass"
                style={{ width: `${track.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {atlas.countriesVisited.length > 0 && (
        <section className="rounded-2xl border-4 border-ink bg-white p-5 shadow-[0_4px_0_0_#0d0d0d]">
          <h2 className="font-display text-xl font-black text-ink">
            🌍 Visited Through Knowledge
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {atlas.countriesVisited.slice(0, 40).map((c) => (
              <span
                key={c}
                className="rounded-full border-2 border-ink bg-cream px-3 py-1 text-xs font-extrabold text-ink"
              >
                ✓ {c}
              </span>
            ))}
            {atlas.countriesVisited.length > 40 && (
              <span className="text-xs font-bold text-ink/50">
                +{atlas.countriesVisited.length - 40} more
              </span>
            )}
          </div>
        </section>
      )}

      {legend && (
        <section className="rounded-2xl border-4 border-sun bg-gradient-to-br from-sun/20 to-white p-5 shadow-[0_4px_0_0_#0d0d0d]">
          <h2 className="font-display text-xl font-black text-ink">
            👑 Knowledge Legend Program
          </h2>
          <p className="mt-1 text-sm font-bold text-ink/60">
            The highest honour in Quizzical — only a tiny fraction of explorers ever earn it.
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full border border-ink bg-white">
            <div
              className="h-full bg-sun"
              style={{ width: `${legend.progressPct}%` }}
            />
          </div>
          <ul className="mt-4 space-y-2">
            {Object.entries(legend.requirements).map(([key, req]) => (
              <li
                key={key}
                className="flex items-center justify-between text-sm font-bold"
              >
                <span className={req.met ? "text-grass" : "text-ink/60"}>
                  {req.met ? "✓" : "○"}{" "}
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="text-ink/70">
                  {req.current.toLocaleString()} / {req.required.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/hall-of-fame"
            className="mt-4 inline-flex text-sm font-extrabold text-grass hover:underline"
          >
            Hall of Fame →
          </Link>
        </section>
      )}
    </div>
  );
}
