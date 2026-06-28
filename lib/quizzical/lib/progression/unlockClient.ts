"use client";

import { useProgression } from "./client";
import type { UnlockProgress } from "./unlockEngine";

/** Find unlock status for a content href — uses local state immediately, no wait. */
export function useUnlockForHref(href: string) {
  const { state } = useProgression();
  const unlock = state.unlocks?.find((u) => u.href === href);
  const locked = Boolean(unlock && !unlock.unlocked);

  return { unlock, locked };
}

export type { UnlockProgress };
