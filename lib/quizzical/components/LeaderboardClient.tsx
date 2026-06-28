"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  LEADERBOARD_CATEGORIES,
  LEADERBOARD_COUNTRIES,
  type LeaderboardEntry,
  type LeaderboardScope,
} from "@/lib/progression/leaderboard";
import { LeaderboardIdentity } from "@/components/platform/LeaderboardAvatar";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { debounce } from "@/lib/debounce";
import { hasCompletedOnboarding } from "@/lib/userMetadata";

export default function LeaderboardClient() {
  const { isSignedIn, user } = useUser();
  const [scope, setScope] = useState<LeaderboardScope>("global");
  const [category, setCategory] = useState<string>("geography");
  const [country, setCountry] = useState<string>("ZA");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [source, setSource] = useState<"supabase" | "none" | "error">("none");
  const [loading, setLoading] = useState(true);
  const syncedRef = useRef(false);

  const fetchBoard = useCallback(
    async (showSpinner: boolean) => {
      if (showSpinner) setLoading(true);

      const params = new URLSearchParams({ scope, limit: "25" });
      if (scope === "country") params.set("country", country);
      if (scope === "category") params.set("category", category);

      try {
        const res = await fetch(`/api/progression/leaderboard?${params}`);
        const data = (await res.json()) as {
          entries?: LeaderboardEntry[];
          source?: "supabase" | "none" | "error";
        };
        setEntries(data.entries ?? []);
        setSource(data.source ?? "none");
      } catch {
        if (showSpinner) {
          setEntries([]);
          setSource("error");
        }
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [scope, country, category],
  );

  useEffect(() => {
    if (!isSignedIn || syncedRef.current) return;
    syncedRef.current = true;
    void fetch("/api/progression").catch(() => undefined);
  }, [isSignedIn]);

  useEffect(() => {
    void fetchBoard(true);
  }, [fetchBoard]);

  useEffect(() => {
    const poll = setInterval(() => void fetchBoard(false), 60000);

    const sb = getSupabaseBrowser();
    if (!sb) return () => clearInterval(poll);

    const refreshQuietly = debounce(() => void fetchBoard(false), 2000);

    const channel = sb
      .channel("leaderboard_pulse")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_xp_events" },
        refreshQuietly,
      )
      .subscribe();

    return () => {
      clearInterval(poll);
      void sb.removeChannel(channel);
    };
  }, [fetchBoard]);

  const onboarded =
    isSignedIn &&
    hasCompletedOnboarding(
      { publicMetadata: user?.publicMetadata } as Record<string, unknown>,
    );

  const tabs: { id: LeaderboardScope; label: string }[] = [
    { id: "global", label: "Global" },
    { id: "weekly", label: "This week" },
    { id: "monthly", label: "This month" },
    { id: "country", label: "By country" },
    { id: "category", label: "By category" },
  ];

  const showSkeleton = loading && entries.length === 0;
  const showList = entries.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setScope(t.id)}
            className={`rounded-full border-2 px-3 py-1 text-xs font-extrabold ${
              scope === t.id
                ? "border-ink bg-grass text-white"
                : "border-ink/20 bg-white text-ink/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {scope === "country" && (
        <div className="flex flex-wrap gap-1.5">
          {LEADERBOARD_COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCountry(c.code)}
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${
                country === c.code
                  ? "border-ink bg-lime/40 text-ink"
                  : "border-ink/15 text-ink/50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {scope === "category" && (
        <div className="flex flex-wrap gap-1.5">
          {LEADERBOARD_CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${
                category === c.slug
                  ? "border-ink bg-lime/40 text-ink"
                  : "border-ink/15 text-ink/50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {source === "none" && !loading && (
        <p className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
          Leaderboard database is not connected. Configure Supabase in your
          environment to see live rankings.
        </p>
      )}

      {showSkeleton && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-cream-dark" />
          ))}
        </div>
      )}

      {!loading && entries.length === 0 && source === "supabase" && (
        <div className="rounded-2xl border-4 border-dashed border-ink/20 p-10 text-center">
          <p className="font-extrabold text-ink/60">No players ranked yet</p>
          {isSignedIn && !onboarded ? (
            <p className="mt-2 text-sm font-semibold text-ink/45">
              Finish setting up your profile to join the leaderboard.
            </p>
          ) : isSignedIn ? (
            <p className="mt-2 text-sm font-semibold text-ink/45">
              Play a quiz while signed in to earn XP and climb the ranks.
            </p>
          ) : (
            <p className="mt-2 text-sm font-semibold text-ink/45">
              Sign in and complete your profile, then play quizzes to earn XP.
            </p>
          )}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {!isSignedIn && (
              <Link
                href="/signin"
                className="inline-block rounded-full border-4 border-ink bg-grass px-5 py-2 font-extrabold text-white shadow-[0_3px_0_0_#0d0d0d]"
              >
                Sign in
              </Link>
            )}
            {isSignedIn && !onboarded && (
              <Link
                href="/onboarding"
                className="inline-block rounded-full border-4 border-ink bg-grass px-5 py-2 font-extrabold text-white shadow-[0_3px_0_0_#0d0d0d]"
              >
                Complete profile
              </Link>
            )}
            <Link
              href="/"
              className="inline-block rounded-full border-4 border-ink bg-white px-5 py-2 font-extrabold text-ink shadow-[0_3px_0_0_#0d0d0d]"
            >
              Play a quiz
            </Link>
          </div>
        </div>
      )}

      {showList && (
        <ol className="flex flex-col gap-2">
          {entries.map((e) => (
            <li key={`${e.rank}-${e.username}`}>
              <Link
                href={`/profile/${encodeURIComponent(e.username)}`}
                className={`flex items-center gap-3 rounded-2xl border-4 border-ink px-4 py-3 shadow-[0_3px_0_0_#0d0d0d] transition hover:bg-lime/10 ${
                  e.rank <= 3 ? "bg-lime/30" : "bg-white"
                }`}
              >
                <span className="w-8 font-display text-xl font-black text-ink/40">
                  #{e.rank}
                </span>
                <LeaderboardIdentity
                  username={e.username}
                  avatarId={e.avatarId}
                  countryCode={e.countryCode}
                  countryName={e.countryName}
                />
                <div className="text-right">
                  <span className="block font-extrabold tabular-nums text-grass">
                    {e.xp.toLocaleString()} XP
                  </span>
                  <span className="text-[10px] font-bold text-ink/40">
                    Lv.{e.level}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
