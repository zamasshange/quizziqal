import { xpForLevel, levelFromXp } from "./xp";
import type { RequirementView, UnlockProgress } from "./unlockEngine";

export type UnlockProgressView = {
  /** 0–100 for the primary blocking requirement */
  pct: number;
  headline: string;
  detail: string;
  remaining: string;
  primary: RequirementView;
};

function isLevelRequirement(req: RequirementView): boolean {
  return req.label.startsWith("Reach Level");
}

/** Rich progress copy for a single requirement. */
export function requirementProgressView(
  req: RequirementView,
  xp = 0,
): Pick<UnlockProgressView, "pct" | "detail" | "remaining"> {
  if (req.met) {
    return { pct: 100, detail: "Complete", remaining: "Unlocked" };
  }

  if (isLevelRequirement(req)) {
    const currentLevel = levelFromXp(xp);
    const targetLevel = req.required;
    if (currentLevel >= targetLevel) {
      return { pct: 100, detail: `Level ${targetLevel}`, remaining: "Ready!" };
    }
    const xpStart = xpForLevel(currentLevel);
    const xpEnd = xpForLevel(targetLevel);
    const span = Math.max(1, xpEnd - xpStart);
    const pct = Math.min(99, Math.round(((xp - xpStart) / span) * 100));
    const xpRemaining = Math.max(0, xpEnd - xp);
    return {
      pct,
      detail: `Level ${currentLevel} → ${targetLevel}`,
      remaining:
        xpRemaining > 0
          ? `${xpRemaining.toLocaleString()} XP to go`
          : "Almost there!",
    };
  }

  const pct = Math.min(
    99,
    req.required > 0 ? Math.round((req.current / req.required) * 100) : 0,
  );
  const gap = Math.max(0, req.required - req.current);
  return {
    pct,
    detail: `${req.current}/${req.required}`,
    remaining: gap > 0 ? `${gap.toLocaleString()} more needed` : "Almost there!",
  };
}

/** Primary blocking requirement + player-friendly progress text. */
export function buildUnlockProgressView(
  unlock: UnlockProgress,
  xp = 0,
): UnlockProgressView {
  const primary =
    unlock.requirements.find((r) => !r.met) ??
    unlock.requirements[0] ?? {
      label: "Progress",
      current: 0,
      required: 1,
      met: false,
    };

  const { pct, detail, remaining } = requirementProgressView(primary, xp);

  return {
    pct,
    headline: primary.label,
    detail,
    remaining,
    primary,
  };
}

/** Overall unlock progress (0–1) using XP-aware level math when applicable. */
export function overallUnlockPct(unlock: UnlockProgress, xp = 0): number {
  if (unlock.unlocked) return 1;
  if (unlock.requirements.length === 0) return 0;

  const partial = unlock.requirements.reduce((sum, req) => {
    if (req.met) return sum + 1;
    return sum + requirementProgressView(req, xp).pct / 100;
  }, 0);

  return Math.min(1, partial / unlock.requirements.length);
}
