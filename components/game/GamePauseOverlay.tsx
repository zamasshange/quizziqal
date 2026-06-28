"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PAUSE_LINES, pickRandom } from "@/lib/gameFlavor";

type Props = {
  onResume: () => void;
};

export default function GamePauseOverlay({ onResume }: Props) {
  const line = useMemo(() => pickRandom(PAUSE_LINES), []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-bounce-in rounded-3xl border-4 border-purple-200 bg-white p-8 text-center shadow-2xl">
        <span className="mb-4 block text-6xl animate-wiggle">⏸️</span>
        <h2 className="mb-2 text-2xl font-extrabold text-gray-900">Time-out!</h2>
        <p className="mb-6 text-sm font-semibold text-gray-500">{line}</p>
        <button
          type="button"
          onClick={onResume}
          className="game-pill mb-3 w-full rounded-full bg-[var(--kahoot-green)] py-3 font-extrabold text-white shadow-[0_4px_0_#1a5c08]"
        >
          ▶ Back to battle!
        </button>
        <Link
          href="/discover"
          className="block text-sm font-semibold text-gray-500 underline"
        >
          🏃 Flee to safety
        </Link>
      </div>
    </div>
  );
}
