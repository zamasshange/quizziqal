"use client";

import { useEffect, useState } from "react";
import { LOADING_LINES, pickRandom } from "@/lib/gameFlavor";

const MASCOTS = ["🎯", "🤡", "🎪", "🃏", "🦄"];

export default function GameLoading() {
  const [line, setLine] = useState(() => pickRandom(LOADING_LINES));
  const [mascot, setMascot] = useState(() => pickRandom(MASCOTS));

  useEffect(() => {
    const id = setInterval(() => {
      setLine(pickRandom(LOADING_LINES));
      setMascot(pickRandom(MASCOTS));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="play-arena relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-white">
      <div className="play-arena-glow pointer-events-none absolute inset-0" aria-hidden />
      <p className="relative z-10 mb-4 text-7xl animate-bounce-in">{mascot}</p>
      <div className="relative z-10 mb-4 h-14 w-14 animate-spin rounded-full border-4 border-yellow-300 border-t-transparent" />
      <p className="relative z-10 text-lg font-extrabold animate-slide-up">{line}</p>
      <p className="relative z-10 mt-2 text-sm font-semibold text-white/50">Almost there…</p>
    </div>
  );
}
