"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  getActiveSessions,
  getGameHistory,
  getRecentCompleted,
  type GameHistoryEntry,
  type SavedGameSession,
} from "@/lib/gameProgress";
import { formatHistoryDate } from "@/lib/completeGame";
import { useProgression } from "@/lib/progression/client";
import { xpToNextLevel } from "@/lib/progression/xp";
import { getCountry } from "@/lib/progression/countries";
import { AVATARS, getAvatarById } from "@/lib/avatars";
import CountryFlag from "@/components/CountryFlag";
import CountryPicker from "@/components/CountryPicker";
import DiscoveryProgress from "@/components/platform/DiscoveryProgress";
import type { ProgressionState } from "@/lib/progression/types";

export default function ProfileClient() {
  const { user, isSignedIn } = useUser();
  const { state, loaded, refresh, setCountryCode } = useProgression();
  const username =
    (user?.publicMetadata?.username as string | undefined) ?? "Player";
  const avatarId =
    (user?.publicMetadata?.avatarId as string | undefined) ?? null;
  const avatar = avatarId ? getAvatarById(avatarId) : null;

  const [active, setActive] = useState<SavedGameSession[]>([]);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);

  useEffect(() => {
    setActive(getActiveSessions());
    setHistory(getGameHistory());
  }, []);

  const completed = getRecentCompleted(20);
  const xpBar = xpToNextLevel(state.xp);
  const country = getCountry(state.countryCode);

  async function updateCountry(code: string) {
    setCountryCode(code);
    try {
      const res = await fetch("/api/progression", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: code }),
      });
      if (res.ok) {
        const data = (await res.json()) as ProgressionState;
        setCountryCode(data.countryCode);
        return;
      }
      await refresh();
    } catch {
      await refresh();
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {avatar && (
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-ink bg-lime/30 shadow-[0_4px_0_0_#0d0d0d]">
              <Image src={avatar.src} alt="" width={48} height={48} />
            </div>
          )}
          <div>
            <h1 className="font-display text-4xl font-black text-ink">
              {isSignedIn ? `${username}` : "Knowledge Explorer"}
            </h1>
            <p className="font-extrabold text-grass">
              Level {state.level} · {state.title}
            </p>
            {country && (
              <p className="flex items-center gap-2 text-sm font-bold text-ink/55">
                <CountryFlag code={state.countryCode} width={28} />
                {country.name}
                {state.rank ? ` · Global rank #${state.rank}` : ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isSignedIn && (
            <Link
              href="/account"
              className="rounded-full border-4 border-ink bg-white px-4 py-2 text-sm font-extrabold shadow-[0_3px_0_0_#0d0d0d]"
            >
              ⚙️ Manage account
            </Link>
          )}
          <Link
            href="/knowledge-book"
            className="rounded-full border-4 border-ink bg-white px-4 py-2 text-sm font-extrabold shadow-[0_3px_0_0_#0d0d0d]"
          >
            📖 Knowledge Book
          </Link>
          <Link
            href="/achievements"
            className="rounded-full border-4 border-ink bg-lime/40 px-4 py-2 text-sm font-extrabold shadow-[0_3px_0_0_#0d0d0d]"
          >
            🏅 Achievements
          </Link>
        </div>
      </div>

      {loaded && (
        <>
          <div className="rounded-2xl border-4 border-ink bg-white p-5 shadow-[0_4px_0_0_#0d0d0d]">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-xl font-extrabold text-ink">
                {state.xp.toLocaleString()} XP
              </p>
              <p className="text-sm font-bold text-ink/55">🪙 {state.coins} Knowledge Coins</p>
            </div>
            <div className="h-3 overflow-hidden rounded-full border-2 border-ink bg-cream">
              <div
                className="h-full bg-grass transition-all"
                style={{ width: `${xpBar.progress * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs font-bold text-ink/45">
              {xpBar.current}/{xpBar.needed} XP to level {xpBar.level + 1}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Streak", value: `${state.currentStreak}d`, sub: `Best ${state.longestStreak}d` },
              { label: "Discoveries", value: String(state.discoveryCount), sub: "Collected" },
              { label: "Quizzes", value: String(state.stats.quizzesCompleted), sub: "Completed" },
              {
                label: "Accuracy",
                value:
                  state.stats.totalAnswered > 0
                    ? `${Math.round((state.stats.totalCorrect / state.stats.totalAnswered) * 100)}%`
                    : "—",
                sub: "All time",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border-4 border-ink bg-white p-4 text-center shadow-[0_4px_0_0_#0d0d0d]"
              >
                <p className="font-display text-2xl font-extrabold text-grass">{s.value}</p>
                <p className="text-xs font-extrabold uppercase text-ink/45">{s.label}</p>
                <p className="text-[10px] font-bold text-ink/40">{s.sub}</p>
              </div>
            ))}
          </div>

          {state.badges.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-black">Badges</h2>
              <div className="flex flex-wrap gap-2">
                {state.badges.map((b) => (
                  <span
                    key={b.id}
                    className="rounded-full border-2 border-ink bg-lime/30 px-3 py-1 text-sm font-extrabold"
                  >
                    {b.emoji} {b.label}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-lg font-black">Category mastery</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {state.mastery
                .filter((m) => m.answered > 0)
                .slice(0, 8)
                .map((m) => (
                  <li
                    key={m.slug}
                    className="rounded-xl border-2 border-ink/15 bg-white px-3 py-2"
                  >
                    <div className="flex justify-between text-sm font-extrabold">
                      <span className="capitalize">{m.slug.replace(/-/g, " ")}</span>
                      <span>{m.masteryPct}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-cream">
                      <div className="h-full bg-grass" style={{ width: `${m.masteryPct}%` }} />
                    </div>
                  </li>
                ))}
            </ul>
          </section>

          <DiscoveryProgress />

          {isSignedIn && (
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-black">Represent your country</h2>
                <Link
                  href="/account"
                  className="text-sm font-extrabold text-grass hover:underline"
                >
                  Edit in account settings →
                </Link>
              </div>
              <p className="mb-3 text-sm font-semibold text-ink/50">
                Pick your flag — it shows on your profile and the country leaderboard.
              </p>
              <CountryPicker
                value={state.countryCode}
                onChange={(code) => void updateCountry(code)}
              />
            </section>
          )}
        </>
      )}

      {active.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-black text-ink">▶ Continue playing</h2>
          <ul className="flex flex-col gap-3">
            {active.map((s) => (
              <li key={s.gameKey}>
                <Link
                  href={s.href}
                  className="flex items-center gap-4 rounded-2xl border-4 border-ink bg-lime/25 p-4 shadow-[0_4px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5"
                >
                  <span className="text-4xl">{s.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-ink">{s.title}</p>
                    <p className="text-sm font-semibold text-ink/55">
                      Question {s.index + 1} · {s.score.toLocaleString()} pts
                    </p>
                  </div>
                  <span className="rounded-full border-2 border-ink bg-grass px-3 py-1 text-xs font-extrabold text-white">
                    Continue
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-black text-ink">📜 Game history</h2>
        {history.length === 0 ? (
          <div className="rounded-2xl border-4 border-dashed border-ink/20 p-10 text-center font-bold text-ink/50">
            No games yet —{" "}
            <Link href="/" className="text-grass hover:underline">
              play a quiz
            </Link>{" "}
            to start your journey!
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((h) => (
              <li key={h.id}>
                <Link
                  href={h.href}
                  className="flex items-center gap-3 rounded-xl border-2 border-ink/10 bg-white px-4 py-3 transition-colors hover:border-ink/30"
                >
                  <span className="text-2xl">{h.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold text-ink">{h.title}</p>
                    <p className="text-xs font-semibold text-ink/50">
                      {h.inProgress
                        ? "In progress"
                        : `${h.correct}/${h.total} correct · ${formatHistoryDate(h.completedAt)}`}
                    </p>
                  </div>
                  <span className="font-extrabold tabular-nums text-grass">
                    {h.score.toLocaleString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/leaderboard"
          className="rounded-full border-4 border-ink bg-grass px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_3px_0_0_#0d0d0d]"
        >
          🏆 Leaderboard
        </Link>
        <Link
          href="/"
          className="rounded-full border-4 border-ink/20 px-5 py-2.5 text-sm font-extrabold text-ink/70 hover:border-ink"
        >
          Browse quizzes
        </Link>
      </div>
    </div>
  );
}
