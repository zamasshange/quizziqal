"use client";

import { computeDiscoveryProgress, type DiscoveryTrack } from "@/lib/platform/discoveryProgress";
import { useProgression } from "@/lib/progression/client";

export default function DiscoveryProgress() {
  const { state, loaded } = useProgression();
  if (!loaded || state.discoveryCount === 0) return null;

  const tracks: DiscoveryTrack[] = computeDiscoveryProgress(state.discoveries);

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-lg font-black text-ink">Discovery progress</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {tracks.map((t) => (
          <li
            key={t.id}
            className="rounded-xl border-2 border-ink/15 bg-white px-4 py-3"
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-extrabold text-ink">
                {t.emoji} {t.label}
              </span>
              <span className="font-display text-lg font-black text-grass">
                {t.pct}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-ink/20 bg-cream">
              <div
                className="h-full bg-grass transition-all"
                style={{ width: `${t.pct}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] font-bold text-ink/45">
              {t.learned} collected · pool of {t.total}+
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
