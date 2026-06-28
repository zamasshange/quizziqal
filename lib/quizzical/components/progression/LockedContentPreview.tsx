"use client";

import type { UnlockProgress } from "@/lib/progression/unlockEngine";
import { buildUnlockProgressView } from "@/lib/progression/unlockDisplay";
import { useProgression } from "@/lib/progression/client";

type OverlayProps = {
  unlock: UnlockProgress;
  /** `strip` = in-card bottom bar (grids). `full` = play-page gate. */
  mode?: "strip" | "full";
};

/** Compact lock UI that stays inside the card image — never changes card size. */
export function LockOverlay({ unlock, mode = "strip" }: OverlayProps) {
  const { state } = useProgression();
  const view = buildUnlockProgressView(unlock, state.xp);

  if (mode === "full") {
    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-[inherit] bg-ink/50 p-4 text-center backdrop-blur-[2px]">
        <div className="w-full max-w-xs rounded-2xl border-4 border-ink bg-white p-4 shadow-[0_4px_0_0_#0d0d0d]">
          <StripContent unlock={unlock} view={view} large />
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[inherit]">
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-[1px]" />
      <span className="absolute right-2 top-2 rounded-full border-2 border-ink bg-white px-2 py-0.5 text-[10px] font-extrabold text-ink">
        🔒 {view.pct}%
      </span>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/90 to-transparent px-2.5 pb-2.5 pt-8">
        <StripContent unlock={unlock} view={view} />
      </div>
    </div>
  );
}

function StripContent({
  unlock,
  view,
  large = false,
}: {
  unlock: UnlockProgress;
  view: ReturnType<typeof buildUnlockProgressView>;
  large?: boolean;
}) {
  return (
    <div className={large ? "text-center" : ""}>
      <p
        className={
          large
            ? "font-display text-base font-black text-white"
            : "line-clamp-1 font-display text-xs font-black text-white sm:text-sm"
        }
      >
        {unlock.title}
      </p>
      <p
        className={
          large
            ? "mt-1 text-sm font-extrabold text-grass"
            : "mt-0.5 text-[10px] font-extrabold text-grass sm:text-xs"
        }
      >
        {view.detail}
      </p>
      <p
        className={
          large
            ? "text-xs font-bold text-white/70"
            : "text-[9px] font-bold text-white/65 sm:text-[10px]"
        }
      >
        {view.remaining}
      </p>
      <div
        className={
          large
            ? "mx-auto mt-2 h-2 w-full max-w-[200px] overflow-hidden rounded-full border-2 border-white/30 bg-white/20"
            : "mt-1.5 h-1.5 overflow-hidden rounded-full border border-white/30 bg-white/20"
        }
      >
        <div
          className="h-full bg-grass transition-all duration-500"
          style={{ width: `${view.pct}%` }}
        />
      </div>
    </div>
  );
}

type Props = {
  unlock: UnlockProgress;
  children: React.ReactNode;
  mode?: "strip" | "full";
  className?: string;
};

/** Wraps only the visual (image) area — children must fill a fixed aspect box. */
export default function LockedContentPreview({
  unlock,
  children,
  mode = "strip",
  className = "",
}: Props) {
  if (unlock.unlocked) {
    return <>{children}</>;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none select-none opacity-80 saturate-[0.7]">
        {children}
      </div>
      <LockOverlay unlock={unlock} mode={mode} />
    </div>
  );
}
