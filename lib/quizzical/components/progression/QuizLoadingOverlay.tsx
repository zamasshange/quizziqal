"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { getCategoryTheme } from "@/lib/atmosphere/categoryThemes";

const MESSAGES: Record<string, string[]> = {
  geography: ["🌍 Loading landmarks…", "🗺️ Fetching map data…"],
  sports: ["⚽ Loading player data…", "🏆 Fetching sports stats…"],
  history: ["📜 Loading archives…", "🏛️ Fetching historical data…"],
  "science-and-nature": ["🔬 Loading science data…", "🚀 Fetching space facts…"],
  entertainment: ["🎬 Loading media assets…", "🎭 Fetching entertainment data…"],
  default: ["✨ Loading quiz data…", "📚 Fetching content…"],
};

function defaultMessage(categorySlug?: string): string {
  const list = MESSAGES[categorySlug ?? ""] ?? MESSAGES.default;
  return list[0];
}

type Props = {
  /** When false, nothing is rendered. */
  open: boolean;
  title: string;
  emoji: string;
  categorySlug?: string;
  /** Override the default loading line. */
  message?: string;
};

/** Full-screen loading overlay — portaled to body so it always covers the entire app. */
export default function QuizLoadingOverlay({
  open,
  title,
  emoji,
  categorySlug,
  message,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const theme = getCategoryTheme(categorySlug);
  const statusLine = message ?? defaultMessage(categorySlug);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, mounted]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label={`Loading ${title}`}
        >
          <motion.div
            initial={{ scale: 0.98, y: 6 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border-4 border-ink bg-white p-8 text-center shadow-[0_8px_0_0_#0d0d0d]"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-15"
              style={{
                background: `linear-gradient(135deg, ${theme.orbColors[0]}, ${theme.orbColors[1] ?? theme.orbColors[0]})`,
              }}
            />
            <div className="relative">
              <span className="text-5xl">{emoji}</span>
              <h2 className="mt-3 font-display text-xl font-black text-ink">{title}</h2>
              <p className="mt-3 text-sm font-extrabold text-grass">{statusLine}</p>
              <div className="mx-auto mt-5 h-2 w-40 overflow-hidden rounded-full border-2 border-ink/15 bg-cream">
                <motion.div
                  className="h-full w-1/3 rounded-full bg-grass"
                  animate={{ x: ["-100%", "280%"] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function categorySlugFromQuizCategory(categoryId: string): string {
  return categoryId;
}
