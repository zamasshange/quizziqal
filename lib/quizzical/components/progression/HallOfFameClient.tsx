"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CountryFlag from "@/components/CountryFlag";

type HofEntry = {
  id: number;
  entryKind: string;
  title: string;
  username: string;
  userId?: string;
  countryCode?: string;
  seasonNumber?: number;
  emoji?: string;
  detail?: string;
  inductedAt: string;
};

export default function HallOfFameClient() {
  const [entries, setEntries] = useState<HofEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/progression/hall-of-fame")
      .then((r) => r.json())
      .then((d: { entries: HofEntry[] }) => setEntries(d.entries ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="text-center">
        <span className="text-6xl">🏛️</span>
        <h1 className="mt-2 font-display text-3xl font-black text-ink">
          Hall of Fame
        </h1>
        <p className="mt-2 font-bold text-ink/60">
          Permanent recognition for the greatest Knowledge Explorers in Quizzical history.
        </p>
      </header>

      {loading && (
        <p className="text-center font-bold text-ink/50">Loading legends…</p>
      )}

      {!loading && entries.length === 0 && (
        <div className="rounded-2xl border-4 border-dashed border-ink/30 bg-white p-10 text-center">
          <p className="font-display text-xl font-black text-ink">
            Your name could be first
          </p>
          <p className="mt-2 font-bold text-ink/55">
            Compete in Season 1, master the Atlas, and become a Knowledge Legend.
          </p>
          <Link
            href="/leaderboard"
            className="mt-4 inline-flex font-extrabold text-grass hover:underline"
          >
            View leaderboard →
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-2xl border-4 border-ink bg-white p-5 shadow-[0_4px_0_0_#0d0d0d]"
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{entry.emoji ?? "🏆"}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
                  {entry.entryKind.replace(/_/g, " ")}
                </p>
                <h2 className="font-display text-xl font-black text-ink">
                  {entry.title}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-lg font-extrabold text-grass">
                  {entry.countryCode && (
                    <CountryFlag code={entry.countryCode} width={24} />
                  )}
                  {entry.userId ? (
                    <Link href={`/profile/${entry.username}`} className="hover:underline">
                      {entry.username}
                    </Link>
                  ) : (
                    entry.username
                  )}
                </p>
                {entry.detail && (
                  <p className="mt-1 text-sm font-bold text-ink/55">{entry.detail}</p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border-4 border-ink bg-petrol p-5 text-cream shadow-[0_4px_0_0_#0d0d0d]">
        <h2 className="font-display text-xl font-black">How to enter</h2>
        <ul className="mt-3 space-y-2 text-sm font-bold text-cream/85">
          <li>🏆 Win a Knowledge Season championship</li>
          <li>👑 Become a Knowledge Legend (Level 100 + 10,000 discoveries)</li>
          <li>🌍 Top the global discovery leaderboard</li>
          <li>🔥 Hold the longest active streak record</li>
        </ul>
      </section>
    </div>
  );
}
