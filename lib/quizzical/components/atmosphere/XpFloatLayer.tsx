"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onProgressionEvent } from "@/lib/progression/client";

type FloatXp = {
  id: number;
  amount: number;
  x: number;
  y: number;
};

/** Floating +XP indicators that rise and fade after correct answers. */
export default function XpFloatLayer() {
  const [floats, setFloats] = useState<FloatXp[]>([]);

  useEffect(() => {
    return onProgressionEvent((result) => {
      if (result.xpEarned <= 0 || result.leveledUp) return;
      if (
        result.achievementsUnlocked.length > 0 ||
        result.badgesUnlocked.length > 0
      ) {
        return;
      }
      const id = Date.now() + Math.random();
      const x = 20 + Math.random() * 60;
      const y = 55 + Math.random() * 25;
      setFloats((f) => [...f, { id, amount: result.xpEarned, x, y }]);
      setTimeout(
        () => setFloats((f) => f.filter((item) => item.id !== id)),
        1400,
      );
    });
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      <AnimatePresence>
        {floats.map((f) => (
          <motion.span
            key={f.id}
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -48, scale: 1.1 }}
            exit={{ opacity: 0, y: -72, scale: 0.9 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute font-display text-xl font-black text-grass drop-shadow-[0_2px_0_#0d0d0d] sm:text-2xl"
            style={{ left: `${f.x}%`, top: `${f.y}%` }}
          >
            +{f.amount} XP
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
