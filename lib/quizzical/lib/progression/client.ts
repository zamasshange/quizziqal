"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  applyProgressionEvent,
  getDefaultProgressionState,
  loadRawState,
  saveRawState,
} from "./engine";
import { buildFullProgressionState } from "./buildState";
import { ensureUnlocks, syncProgressionState } from "./syncState";
import type {
  ProgressionEventPayload,
  ProgressionEventResult,
  ProgressionState,
} from "./types";
import { detectCountryCode } from "./countries";

type ProgressionListener = (result: ProgressionEventResult) => void;
const listeners = new Set<ProgressionListener>();

export function onProgressionEvent(fn: ProgressionListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(result: ProgressionEventResult) {
  listeners.forEach((fn) => fn(result));
}

function readLocalState(): ProgressionState {
  if (typeof window === "undefined") {
    return getDefaultProgressionState(detectCountryCode());
  }
  return buildFullProgressionState(loadRawState());
}

function applyLocalSnapshot(
  setState: React.Dispatch<React.SetStateAction<ProgressionState>>,
) {
  const raw = loadRawState();
  setState((prev) => ensureUnlocks(buildFullProgressionState(raw), raw));
}

export function useProgression() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded: clerkReady } = useUser();
  const [state, setState] = useState<ProgressionState>(readLocalState);
  const [loaded, setLoaded] = useState(() => typeof window !== "undefined");

  const refresh = useCallback(async () => {
    const localRaw = loadRawState();
    const localState = buildFullProgressionState(localRaw);

    if (!isSignedIn) {
      setState(localState);
      setLoaded(true);
      return;
    }

    try {
      const res = await fetch("/api/progression");
      if (res.ok) {
        const data = (await res.json()) as ProgressionState;
        const merged = syncProgressionState(data, localRaw);
        saveRawState({
          ...localRaw,
          xp: merged.xp,
          coins: merged.coins,
          currentStreak: merged.currentStreak,
          longestStreak: merged.longestStreak,
          countryCode: merged.countryCode,
          discoveries: merged.discoveries,
          mastery: Object.fromEntries(
            merged.mastery.map((m) => [m.slug, { answered: m.answered, correct: m.correct }]),
          ),
          unlockedAchievements: merged.achievements
            .filter((a) => a.unlocked)
            .map((a) => a.id),
          unlockedBadges: merged.badges.map((b) => b.id),
          missions: merged.missions,
          stats: merged.stats,
          unlockedItems: merged.unlockedItemIds ?? [],
          kingdomId: merged.kingdom?.id ?? null,
          loginStreak: merged.loginStreak ?? localRaw.loginStreak,
          isLegend: merged.legend?.isLegend ?? false,
          legendNumber: merged.legend?.legendNumber,
          crownedAt: merged.legend?.crownedAt,
          seasonXp: merged.season?.userSeasonXp ?? 0,
          seasonDiscoveries: merged.season?.userSeasonDiscoveries ?? 0,
        });
        const raw = loadRawState();
        setState(ensureUnlocks(merged, raw));
        setLoaded(true);
        return;
      }
    } catch {
      /* fall through to local */
    }

    setState(localState);
    setLoaded(true);
  }, [isSignedIn]);

  useEffect(() => {
    if (!clerkReady) return;
    void refresh();
  }, [clerkReady, refresh]);

  /** Re-read local storage after navigation or when returning to the tab. */
  useEffect(() => {
    applyLocalSnapshot(setState);
  }, [pathname]);

  useEffect(() => {
    function syncFromStorage() {
      if (document.visibilityState !== "visible") return;
      applyLocalSnapshot(setState);
    }

    window.addEventListener("focus", syncFromStorage);
    window.addEventListener("pageshow", syncFromStorage);
    document.addEventListener("visibilitychange", syncFromStorage);
    return () => {
      window.removeEventListener("focus", syncFromStorage);
      window.removeEventListener("pageshow", syncFromStorage);
      document.removeEventListener("visibilitychange", syncFromStorage);
    };
  }, []);

  /** Keep all useProgression() hooks in sync after any quiz event. */
  useEffect(() => {
    return onProgressionEvent((result) => {
      const raw = loadRawState();
      setState(ensureUnlocks(result.state, raw));
    });
  }, []);

  const recordEvent = useCallback(
    async (payload: ProgressionEventPayload): Promise<ProgressionEventResult> => {
      if (isSignedIn) {
        try {
          const res = await fetch("/api/progression/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const result = (await res.json()) as ProgressionEventResult;
            const raw = loadRawState();
            saveRawState({
              ...raw,
              xp: result.state.xp,
              coins: result.state.coins,
              currentStreak: result.state.currentStreak,
              longestStreak: result.state.longestStreak,
              discoveries: result.state.discoveries,
              mastery: Object.fromEntries(
                result.state.mastery.map((m) => [
                  m.slug,
                  { answered: m.answered, correct: m.correct },
                ]),
              ),
              unlockedAchievements: result.state.achievements
                .filter((a) => a.unlocked)
                .map((a) => a.id),
              unlockedBadges: result.state.badges.map((b) => b.id),
              missions: result.state.missions,
              stats: result.state.stats,
              unlockedItems: result.state.unlockedItemIds ?? raw.unlockedItems,
              seasonXp: result.state.season?.userSeasonXp ?? raw.seasonXp,
              seasonDiscoveries:
                result.state.season?.userSeasonDiscoveries ?? raw.seasonDiscoveries,
            });
            setState(ensureUnlocks(result.state, loadRawState()));
            emit(result);
            return result;
          }
        } catch {
          /* fall through */
        }
      }

      const raw = loadRawState();
      const result = applyProgressionEvent(raw, payload);
      setState(ensureUnlocks(result.state, loadRawState()));
      emit(result);
      return result;
    },
    [isSignedIn],
  );

  const setCountryCode = useCallback((countryCode: string) => {
    setState((prev) => ({ ...prev, countryCode }));
  }, []);

  return { state, loaded, clerkReady, refresh, recordEvent, setCountryCode };
}

export async function recordProgressionEvent(
  payload: ProgressionEventPayload,
): Promise<ProgressionEventResult> {
  const isSignedIn =
    typeof window !== "undefined" &&
    document.cookie.includes("__session");

  if (isSignedIn) {
    try {
      const res = await fetch("/api/progression/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const result = (await res.json()) as ProgressionEventResult;
        const raw = loadRawState();
        saveRawState({
          ...raw,
          xp: result.state.xp,
          coins: result.state.coins,
          currentStreak: result.state.currentStreak,
          longestStreak: result.state.longestStreak,
          discoveries: result.state.discoveries,
          mastery: Object.fromEntries(
            result.state.mastery.map((m) => [
              m.slug,
              { answered: m.answered, correct: m.correct },
            ]),
          ),
          unlockedAchievements: result.state.achievements
            .filter((a) => a.unlocked)
            .map((a) => a.id),
          unlockedBadges: result.state.badges.map((b) => b.id),
          missions: result.state.missions,
          stats: result.state.stats,
          unlockedItems: result.state.unlockedItemIds ?? raw.unlockedItems,
          seasonXp: result.state.season?.userSeasonXp ?? raw.seasonXp,
          seasonDiscoveries:
            result.state.season?.userSeasonDiscoveries ?? raw.seasonDiscoveries,
        });
        emit(result);
        return result;
      }
    } catch {
      /* local fallback */
    }
  }

  const raw = loadRawState();
  const result = applyProgressionEvent(raw, payload);
  emit(result);
  return result;
}
