"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { onProgressionEvent } from "@/lib/progression/client";
import type { ProgressionEventResult } from "@/lib/progression/types";
import { playMissionComplete, playStreakMilestone } from "@/lib/sound";

type ToastKind = "mission" | "streak";

type Toast = {
  id: number;
  kind: ToastKind;
  title: string;
  detail?: string;
};

const TOAST_MS = 3200;

/** Rare milestone toasts only — top corner, never during reveal/continue flow. */
export default function ProgressionToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return onProgressionEvent((result: ProgressionEventResult) => {
      const next: Toast[] = [];
      let id = Date.now();

      // Discoveries are saved silently — see RevealCard inline hint during gameplay.

      if (result.streakMilestone) {
        playStreakMilestone();
        next.push({
          id: id++,
          kind: "streak",
          title: `${result.streakMilestone}-day streak`,
          detail: "Keep it going!",
        });
      }

      for (const m of result.missionsCompleted) {
        playMissionComplete();
        next.push({
          id: id++,
          kind: "mission",
          title: "Daily mission complete",
          detail: `${m.emoji} ${m.label}`,
        });
      }

      if (next.length === 0) return;

      setToasts((t) => [...t, ...next].slice(-2));
      for (const toast of next) {
        setTimeout(
          () => setToasts((t) => t.filter((x) => x.id !== toast.id)),
          TOAST_MS,
        );
      }
    });
  }, []);

  return (
    <div className="pointer-events-none fixed right-3 top-16 z-[80] flex max-w-[min(100vw-1.5rem,18rem)] flex-col gap-2 sm:right-5 sm:top-20">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className={`rounded-xl border-2 border-ink px-3 py-2 shadow-[0_3px_0_0_#0d0d0d] ${
              t.kind === "mission" ? "bg-lime/90" : "bg-white"
            }`}
          >
            <p className="flex items-center gap-1.5 font-display text-xs font-extrabold text-ink">
              <span aria-hidden>{t.kind === "mission" ? "🎯" : "🔥"}</span>
              {t.title}
            </p>
            {t.detail && (
              <p className="mt-0.5 text-[11px] font-bold text-ink/55">{t.detail}</p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
