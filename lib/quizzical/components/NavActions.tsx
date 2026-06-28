"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { quizzes } from "@/lib/quizzes";
import { playClick, useMuted } from "@/lib/sound";
import { SoundOnIcon, SoundOffIcon } from "./icons";

export default function NavActions() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [muted, toggleMuted] = useMuted();

  useEffect(() => {
    setMounted(true);
  }, []);

  function surpriseMe() {
    playClick();
    const pick = quizzes[Math.floor(Math.random() * quizzes.length)];
    router.push(`/quiz/${pick.id}/play`);
  }

  return (
    <>
      <button
        type="button"
        onClick={surpriseMe}
        className="hidden h-9 items-center gap-1 rounded-full border-2 border-ink bg-lime px-2.5 text-xs font-extrabold text-ink shadow-[0_3px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5 active:translate-y-0 md:h-10 md:gap-1.5 md:px-3 md:text-sm lg:flex"
      >
        <span aria-hidden>🎲</span>
        <span className="hidden md:inline">Surprise</span>
      </button>

      <button
        type="button"
        onClick={toggleMuted}
        aria-label={mounted && muted ? "Unmute sounds" : "Mute sounds"}
        aria-pressed={mounted ? muted : false}
        title={mounted && muted ? "Sounds off" : "Sounds on"}
        className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-black/5 hover:text-ink"
      >
        {mounted && muted ? (
          <SoundOffIcon className="h-5 w-5" />
        ) : (
          <SoundOnIcon className="h-5 w-5" />
        )}
      </button>
    </>
  );
}
