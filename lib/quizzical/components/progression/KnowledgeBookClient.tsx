"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProgression } from "@/lib/progression/client";
import { discoveryTypeLabel } from "@/lib/progression/missions";
import type { DiscoveryType } from "@/lib/progression/types";
import SiteShell from "@/components/SiteShell";

const TYPE_ORDER: DiscoveryType[] = [
  "country",
  "landmark",
  "athlete",
  "movie",
  "artist",
  "historical_figure",
  "animal",
  "science",
  "general",
];

export default function KnowledgeBookClient() {
  const { state, loaded } = useProgression();
  const [filter, setFilter] = useState<DiscoveryType | "all">("all");

  const grouped = useMemo(() => {
    const map = new Map<DiscoveryType, typeof state.discoveries>();
    for (const d of state.discoveries) {
      const list = map.get(d.discoveryType) ?? [];
      list.push(d);
      map.set(d.discoveryType, list);
    }
    return map;
  }, [state.discoveries]);

  const visible =
    filter === "all"
      ? state.discoveries
      : (grouped.get(filter) ?? []);

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl pb-8">
        <div className="mb-6">
          <h1 className="font-display text-4xl font-black text-ink">
            📖 My Knowledge Book
          </h1>
          <p className="mt-2 font-bold text-ink/60">
            Every correct answer adds to your personal encyclopedia of discoveries.
          </p>
          <p className="mt-1 text-sm font-extrabold text-grass">
            {state.discoveryCount} discoveries collected
          </p>
        </div>

        {!loaded && (
          <div className="animate-pulse space-y-3">
            <div className="h-24 rounded-2xl bg-cream-dark" />
            <div className="h-24 rounded-2xl bg-cream-dark" />
          </div>
        )}

        {loaded && state.discoveryCount === 0 && (
          <div className="rounded-2xl border-4 border-dashed border-ink/20 p-12 text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 font-extrabold text-ink/60">No discoveries yet</p>
            <p className="mt-1 text-sm font-semibold text-ink/45">
              Play quizzes and get answers right to start collecting knowledge.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-full border-4 border-ink bg-grass px-5 py-2 font-extrabold text-white shadow-[0_3px_0_0_#0d0d0d]"
            >
              Start exploring
            </Link>
          </div>
        )}

        {state.discoveryCount > 0 && (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              <FilterChip
                active={filter === "all"}
                onClick={() => setFilter("all")}
                label={`All (${state.discoveryCount})`}
              />
              {TYPE_ORDER.map((type) => {
                const count = grouped.get(type)?.length ?? 0;
                if (count === 0) return null;
                return (
                  <FilterChip
                    key={type}
                    active={filter === type}
                    onClick={() => setFilter(type)}
                    label={`${discoveryTypeLabel(type)} (${count})`}
                  />
                );
              })}
            </div>

            <ul className="grid gap-2 sm:grid-cols-2">
              {visible.map((d) => (
                <li
                  key={`${d.term}-${d.discoveredAt}`}
                  className="flex items-center gap-3 rounded-xl border-2 border-ink/15 bg-white px-4 py-3 shadow-sm"
                >
                  <span className="text-lg text-grass">✓</span>
                  <div className="min-w-0">
                    <p className="truncate font-extrabold text-ink">{d.term}</p>
                    <p className="text-xs font-bold text-ink/45">
                      {discoveryTypeLabel(d.discoveryType)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </SiteShell>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border-2 px-3 py-1 text-xs font-extrabold transition-colors ${
        active
          ? "border-ink bg-grass text-white"
          : "border-ink/20 bg-white text-ink/60 hover:border-ink/40"
      }`}
    >
      {label}
    </button>
  );
}
