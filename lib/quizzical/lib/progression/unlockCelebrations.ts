import { ALL_UNLOCKS, getUnlockById, type UnlockDef } from "./unlockDefinitions";
import type { RawState } from "./engine";

/** Events where unlocks are evaluated and celebrations may fire. */
export const PROGRESSION_MILESTONE_EVENTS = new Set([
  "quiz_complete",
  "daily_challenge",
  "mission_complete",
]);

/** Level-1 starter content — granted silently, never celebrated. */
function isStarterUnlock(def: UnlockDef): boolean {
  if (def.requirements.length === 0) return false;
  return def.requirements.every(
    (r) => r.type === "level" && r.value <= 1,
  );
}

/** Pre-grant default starter unlocks so the first quiz doesn't spam popups. */
export function hydrateStarterUnlocks(raw: RawState): void {
  const items = new Set(raw.unlockedItems ?? []);
  for (const def of ALL_UNLOCKS) {
    if (isStarterUnlock(def)) items.add(def.id);
  }
  raw.unlockedItems = [...items];
}

/** Unlocks worth a full-screen moment (not every picture game at level 3). */
export function isCelebrationUnlock(unlockId: string): boolean {
  const def = getUnlockById(unlockId);
  if (!def) return false;

  if (def.kind === "boss" || def.kind === "rare" || def.kind === "legendary") {
    return true;
  }
  if (def.kind === "mastery" || def.kind === "discovery") return true;

  const levelReq = def.requirements.find((r) => r.type === "level");
  const minLevel = levelReq?.value ?? 0;

  if (def.kind === "world") return minLevel >= 5;
  if (def.kind === "picture_game") return minLevel >= 8;
  if (def.kind === "quiz") return minLevel >= 10;

  return false;
}

export function filterCelebrationUnlocks(ids: string[]): string[] {
  return ids.filter(isCelebrationUnlock);
}

export function celebrationUnlockSummary(ids: string[]): {
  title: string;
  subtitle: string;
  emoji: string;
} {
  const defs = ids.map((id) => getUnlockById(id)).filter(Boolean) as UnlockDef[];
  if (defs.length === 0) {
    return { title: "Unlocked!", subtitle: "New content available", emoji: "🔓" };
  }
  if (defs.length === 1) {
    const d = defs[0]!;
    return { title: "Unlocked!", subtitle: d.title, emoji: d.emoji };
  }
  return {
    title: `${defs.length} new unlocks`,
    subtitle: defs.map((d) => d.title).slice(0, 3).join(" · "),
    emoji: "🎉",
  };
}
