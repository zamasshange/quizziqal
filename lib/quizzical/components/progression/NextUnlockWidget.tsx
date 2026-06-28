"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useProgression } from "@/lib/progression/client";

export default function NextUnlockWidget() {
  const { state, loaded } = useProgression();
  if (!loaded || !state.nextUnlock) return null;

  const next = state.nextUnlock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-4 border-ink bg-gradient-to-br from-sun/30 via-white to-grass/20 p-4 shadow-[0_4px_0_0_#0d0d0d]"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{next.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
            Next unlock
          </p>
          <p className="font-display text-lg font-black text-ink">{next.title}</p>
          <p className="text-sm font-bold text-ink/60">{next.description}</p>
          <p className="mt-1 text-xs font-extrabold text-grass">
            {next.requirementLabel}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full border-2 border-ink bg-white">
            <div
              className="h-full bg-grass transition-all duration-500"
              style={{ width: `${Math.round(next.progress * 100)}%` }}
            />
          </div>
        </div>
      </div>
      {next.href && (
        <Link
          href={next.href}
          className="mt-3 inline-flex text-sm font-extrabold text-grass hover:underline"
        >
          Preview locked content →
        </Link>
      )}
    </motion.div>
  );
}
