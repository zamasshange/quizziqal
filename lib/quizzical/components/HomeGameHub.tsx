"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useProgression } from "@/lib/progression/client";
import { categories } from "@/lib/quizzes";
import {
  getActiveSessions,
  getRecentCompletedUnique,
  type GameHistoryEntry,
  type SavedGameSession,
} from "@/lib/gameProgress";
import { fadeUp, sectionViewport, staggerContainer } from "@/lib/motion";

const HOME_RESUME_LIMIT = 2;
const HOME_RECENT_LIMIT = 4;

type HubItem =
  | { kind: "resume"; session: SavedGameSession }
  | { kind: "replay"; entry: GameHistoryEntry };

function buildHubItems(
  active: SavedGameSession[],
  recent: GameHistoryEntry[],
): HubItem[] {
  const activeKeys = new Set(active.map((s) => s.gameKey));
  const resume = active.slice(0, HOME_RESUME_LIMIT).map(
    (session): HubItem => ({ kind: "resume", session }),
  );
  const replay = recent
    .filter((entry) => !activeKeys.has(entry.gameKey))
    .slice(0, HOME_RECENT_LIMIT)
    .map((entry): HubItem => ({ kind: "replay", entry }));

  return [...resume, ...replay];
}

export default function HomeGameHub() {
  const { isSignedIn } = useUser();
  const { state, loaded } = useProgression();
  const [active, setActive] = useState<SavedGameSession[]>([]);
  const [recent, setRecent] = useState<GameHistoryEntry[]>([]);
  const [extraCount, setExtraCount] = useState(0);

  useEffect(() => {
    const sessions = getActiveSessions();
    const uniqueRecent = getRecentCompletedUnique(20);
    const activeKeys = new Set(sessions.map((s) => s.gameKey));
    const visible = buildHubItems(sessions, uniqueRecent);

    const hiddenActive = Math.max(0, sessions.length - HOME_RESUME_LIMIT);
    const hiddenRecent = uniqueRecent.filter(
      (entry) =>
        !activeKeys.has(entry.gameKey) &&
        !visible.some(
          (item) =>
            item.kind === "replay" && item.entry.gameKey === entry.gameKey,
        ),
    ).length;

    setActive(sessions);
    setRecent(uniqueRecent);
    setExtraCount(hiddenActive + hiddenRecent);
  }, []);

  const items = useMemo(
    () => buildHubItems(active, recent),
    [active, recent],
  );

  const masteryContinue = useMemo(() => {
    if (!loaded || !isSignedIn) return null;
    const inProgress = state.mastery
      .filter((m) => m.answered > 0 && m.masteryPct < 100)
      .sort((a, b) => a.masteryPct - b.masteryPct)[0];
    if (!inProgress) return null;
    const cat = categories.find((c) => c.slug === inProgress.slug);
    return { mastery: inProgress, cat };
  }, [loaded, isSignedIn, state.mastery]);

  if (items.length === 0 && !masteryContinue) return null;

  return (
    <motion.section
      className="mt-4 md:mt-7"
      initial="hidden"
      whileInView="visible"
      viewport={sectionViewport}
      variants={staggerContainer}
    >
      <motion.div
        className="mb-2 flex items-baseline justify-between gap-2 md:mb-3"
        variants={fadeUp}
      >
        <h2 className="text-lg font-black text-ink md:text-2xl">
          ▶ Continue Playing
        </h2>
        <Link
          href="/profile"
          className="shrink-0 text-xs font-extrabold text-grass hover:underline md:text-sm"
        >
          View all →
        </Link>
      </motion.div>

      <motion.div
        className="-mx-1 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:gap-3 [&::-webkit-scrollbar]:hidden"
        variants={fadeUp}
      >
        {masteryContinue && (
          <Link
            href={`/${masteryContinue.mastery.slug}`}
            className="flex w-[11.5rem] shrink-0 snap-start items-center gap-2.5 rounded-xl border-[3px] border-ink bg-grass/20 p-3 shadow-[0_3px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5 sm:w-56 sm:rounded-2xl sm:border-4 sm:p-4"
          >
            <span className="text-2xl sm:text-3xl">
              {masteryContinue.cat?.emoji ?? "🎯"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-ink sm:text-base">
                {masteryContinue.cat?.name ?? masteryContinue.mastery.slug}
              </p>
              <p className="text-[10px] font-bold text-ink/55 sm:text-xs">
                Mastery {masteryContinue.mastery.masteryPct}% · Continue journey
              </p>
            </div>
          </Link>
        )}
        {items.map((item) => {
          if (item.kind === "resume") {
            const s = item.session;
            return (
              <Link
                key={`resume-${s.gameKey}`}
                href={s.href}
                className="flex w-[11.5rem] shrink-0 snap-start items-center gap-2.5 rounded-xl border-[3px] border-ink bg-lime/30 p-3 shadow-[0_3px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5 sm:w-56 sm:rounded-2xl sm:border-4 sm:p-4 sm:shadow-[0_4px_0_0_#0d0d0d]"
              >
                <span className="text-2xl sm:text-3xl">{s.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-ink sm:text-base">
                    {s.title}
                  </p>
                  <p className="text-[10px] font-bold text-ink/55 sm:text-xs">
                    Resume · Q{s.index + 1} · {s.score.toLocaleString()} pts
                  </p>
                </div>
              </Link>
            );
          }

          const r = item.entry;
          return (
            <Link
              key={`replay-${r.gameKey}`}
              href={r.href}
              className="flex w-[9.5rem] shrink-0 snap-start flex-col justify-between rounded-xl border-2 border-ink/15 bg-white p-3 transition-colors hover:border-ink sm:w-44"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{r.emoji}</span>
                <p className="line-clamp-2 text-sm font-extrabold leading-tight text-ink">
                  {r.title}
                </p>
              </div>
              <p className="mt-2 text-[10px] font-bold text-ink/45 sm:text-xs">
                {r.score.toLocaleString()} pts · Play again
              </p>
            </Link>
          );
        })}

        {extraCount > 0 && (
          <Link
            href="/profile"
            className="flex w-[7.5rem] shrink-0 snap-start items-center justify-center rounded-xl border-2 border-dashed border-ink/20 bg-white/60 px-3 py-3 text-center text-xs font-extrabold text-ink/55 transition-colors hover:border-ink/40 hover:text-ink sm:w-32 sm:text-sm"
          >
            +{extraCount} more on profile
          </Link>
        )}
      </motion.div>

      {!isSignedIn && (
        <p className="mt-2 text-[11px] font-semibold text-ink/50 md:mt-3 md:text-xs">
          <Link href="/signin" className="font-extrabold text-grass hover:underline">
            Sign in
          </Link>{" "}
          to sync scores on the global leaderboard.
        </p>
      )}
    </motion.section>
  );
}
