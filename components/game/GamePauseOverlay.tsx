"use client";

import Link from "next/link";

type Props = {
  onResume: () => void;
};

export default function GamePauseOverlay({ onResume }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        <span className="mb-4 block text-5xl">⏸️</span>
        <h2 className="mb-2 text-2xl font-extrabold text-gray-900">Paused</h2>
        <p className="mb-6 text-sm text-gray-500">Take a break — tap resume when ready.</p>
        <button
          type="button"
          onClick={onResume}
          className="mb-3 w-full rounded-full bg-[var(--kahoot-purple)] py-3 font-extrabold text-white"
        >
          ▶ Resume
        </button>
        <Link
          href="/discover"
          className="block text-sm font-semibold text-gray-500 underline"
        >
          Quit to Discover
        </Link>
      </div>
    </div>
  );
}
