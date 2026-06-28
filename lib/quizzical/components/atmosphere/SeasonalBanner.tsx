"use client";

import { motion } from "framer-motion";
import { getActiveSeasonalEvent } from "@/lib/atmosphere/seasons";

type Props = {
  className?: string;
};

export default function SeasonalBanner({ className = "" }: Props) {
  const event = getActiveSeasonalEvent();
  if (!event) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 border-ink px-3 py-2 shadow-[0_2px_0_0_#0d0d0d] ${className}`}
      style={{ backgroundColor: `${event.accent}33` }}
    >
      <p className="flex items-center gap-2 text-xs font-extrabold text-cream md:text-sm">
        <motion.span
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {event.emoji}
        </motion.span>
        <span>
          <span className="text-sky">{event.name}</span>
          <span className="font-bold text-cream/75"> — {event.tagline}</span>
        </span>
      </p>
    </motion.div>
  );
}
