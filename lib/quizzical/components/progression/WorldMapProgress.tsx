"use client";

import { useProgression } from "@/lib/progression/client";
import { COUNTRY_COUNT } from "@/lib/allCountries";

/** Simplified world map progress — countries learned vs remaining. */
export default function WorldMapProgress() {
  const { state, loaded } = useProgression();
  if (!loaded || !state.atlas) return null;

  const countries = state.atlas.tracks.find((t) => t.id === "countries");
  const learned = countries?.learned ?? 0;
  const total = countries?.total ?? COUNTRY_COUNT;
  const pct = countries?.pct ?? 0;
  const remaining = Math.max(0, total - learned);

  return (
    <section className="rounded-2xl border-4 border-ink bg-gradient-to-br from-sky/15 via-white to-grass/10 p-5 shadow-[0_4px_0_0_#0d0d0d]">
      <h2 className="font-display text-xl font-black text-ink">🗺️ World Map Progress</h2>
      <p className="mt-1 text-sm font-bold text-ink/60">
        Unlock countries through knowledge — your personal travel map.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border-2 border-ink bg-white p-3">
          <p className="font-display text-2xl font-extrabold text-grass">{learned}</p>
          <p className="text-[10px] font-extrabold uppercase text-ink/45">Learned</p>
        </div>
        <div className="rounded-xl border-2 border-ink bg-white p-3">
          <p className="font-display text-2xl font-extrabold text-ink">{remaining}</p>
          <p className="text-[10px] font-extrabold uppercase text-ink/45">Remaining</p>
        </div>
        <div className="rounded-xl border-2 border-ink bg-white p-3">
          <p className="font-display text-2xl font-extrabold text-sky">{pct}%</p>
          <p className="text-[10px] font-extrabold uppercase text-ink/45">Complete</p>
        </div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full border-2 border-ink bg-cream">
        <div className="h-full bg-gradient-to-r from-grass to-sky" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className={`h-3 w-3 rounded-sm border border-ink/20 ${
              i < Math.round((pct / 100) * 20) ? "bg-grass" : "bg-cream"
            }`}
            aria-hidden
          />
        ))}
      </div>
    </section>
  );
}
