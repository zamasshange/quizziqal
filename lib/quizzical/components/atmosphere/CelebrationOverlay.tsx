"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onProgressionEvent } from "@/lib/progression/client";
import { ACHIEVEMENTS, BADGES } from "@/lib/progression/achievements";
import {
  PROGRESSION_MILESTONE_EVENTS,
  celebrationUnlockSummary,
  filterCelebrationUnlocks,
} from "@/lib/progression/unlockCelebrations";
import { playAchievement, playCelebration, playLevelUp } from "@/lib/sound";
import { CelebrationParticles } from "./GameParticles";

type CelebrationKind = "level" | "achievement" | "badge" | "unlock" | "legend";

type Celebration = {
  id: number;
  kind: CelebrationKind;
  title: string;
  subtitle: string;
  emoji: string;
  accent: string;
};

/**
 * Full-screen celebrations — only at quiz/challenge end, never mid-question.
 * Minor unlocks (starter games, low-level worlds) are silent.
 */
export default function CelebrationOverlay() {
  const [queue, setQueue] = useState<Celebration[]>([]);
  const current = queue[0] ?? null;

  useEffect(() => {
    return onProgressionEvent((result) => {
      if (!PROGRESSION_MILESTONE_EVENTS.has(result.eventType)) return;

      const next: Celebration[] = [];
      let id = Date.now();

      for (const achId of result.achievementsUnlocked) {
        playAchievement();
        const def = ACHIEVEMENTS.find((a) => a.id === achId);
        next.push({
          id: id++,
          kind: "achievement",
          title: "Achievement unlocked",
          subtitle: def?.title ?? achId.replace(/-/g, " "),
          emoji: def?.emoji ?? "🏅",
          accent: "bg-lime",
        });
      }

      for (const badgeId of result.badgesUnlocked) {
        playAchievement();
        const def = BADGES.find((b) => b.id === badgeId);
        next.push({
          id: id++,
          kind: "badge",
          title: "Badge earned",
          subtitle: def?.label ?? badgeId.replace(/-/g, " "),
          emoji: def?.emoji ?? "🎖️",
          accent: "bg-white",
        });
      }

      const celebrateUnlocks = filterCelebrationUnlocks(result.unlocksEarned ?? []);
      if (celebrateUnlocks.length > 0) {
        playCelebration();
        const summary = celebrationUnlockSummary(celebrateUnlocks);
        next.push({
          id: id++,
          kind: "unlock",
          title: summary.title,
          subtitle: summary.subtitle,
          emoji: summary.emoji,
          accent: "bg-sky/40",
        });
      }

      if (result.leveledUp && result.newLevel) {
        playLevelUp();
        playCelebration();
        next.push({
          id: id++,
          kind: "level",
          title: `Level ${result.newLevel}`,
          subtitle: result.newTitle ?? "Knowledge Explorer",
          emoji: "⬆️",
          accent: "bg-gradient-to-br from-lime via-sky/80 to-grass/30",
        });
      }

      if (result.becameLegend) {
        playCelebration();
        next.push({
          id: id++,
          kind: "legend",
          title: "Knowledge Legend",
          subtitle: `You are Legend #${result.legendNumber ?? "?"}`,
          emoji: "👑",
          accent: "bg-gradient-to-br from-sun via-white to-sun/40",
        });
      }

      if (next.length === 0) return;
      setQueue((q) => [...q, ...next]);
    });
  }, []);

  useEffect(() => {
    if (!current) return;
    const ms = current.kind === "level" ? 3800 : 3000;
    const t = setTimeout(() => setQueue((q) => q.slice(1)), ms);
    return () => clearTimeout(t);
  }, [current]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          className="pointer-events-none fixed inset-0 z-[110] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" />
          {current.kind === "level" && (
            <CelebrationParticles color="#ffd95e" className="z-0" />
          )}

          <motion.div
            initial={{ scale: 0.88, y: 28 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 24 }}
            className={`relative z-10 w-full max-w-sm rounded-3xl border-4 border-ink p-8 text-center shadow-[0_8px_0_0_#0d0d0d] ${current.accent}`}
          >
            <span className="block text-5xl">{current.emoji}</span>
            <h2 className="mt-3 font-display text-2xl font-black text-ink">
              {current.title}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm font-extrabold text-ink/70">
              {current.subtitle}
            </p>
            {current.kind === "level" && (
              <div className="mx-auto mt-4 h-2 w-32 overflow-hidden rounded-full border-2 border-ink bg-white">
                <motion.div
                  className="h-full bg-grass"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
              </div>
            )}
            {current.kind === "legend" && (
              <p className="mt-3 text-xs font-extrabold uppercase tracking-wide text-ink/50">
                Permanent Hall of Fame entry
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
