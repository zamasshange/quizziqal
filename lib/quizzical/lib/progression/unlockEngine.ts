import type { RawState } from "./engine";
import { computeAtlasProgress } from "./atlas";
import { computeKnowledgeRank } from "./ranks";
import { countMasteredCategories, computeAchievementScore } from "./legend";
import {
  ALL_UNLOCKS,
  type UnlockDef,
  type UnlockRequirement,
} from "./unlockDefinitions";
import { levelFromXp } from "./xp";
import type { CategoryMastery } from "./types";

export type UnlockProgress = {
  id: string;
  kind: UnlockDef["kind"];
  title: string;
  description: string;
  emoji: string;
  href?: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  requirements: RequirementView[];
  rewardXp?: number;
  rewardCoins?: number;
};

export type RequirementView = {
  label: string;
  current: number;
  required: number;
  met: boolean;
};

export type NextUnlock = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  href?: string;
  progress: number;
  requirementLabel: string;
};

type EvalContext = {
  level: number;
  discoveryCount: number;
  longestStreak: number;
  mastery: CategoryMastery[];
  discoveriesByType: Map<string, number>;
  atlasPct: number;
  unlockedAchievements: string[];
  achievementScore: number;
  knowledgeRankId: string;
  unlockedItems: string[];
};

function discoveryTypeCounts(discoveries: RawState["discoveries"]): Map<string, number> {
  const map = new Map<string, number>();
  const seen = new Map<string, Set<string>>();
  for (const d of discoveries) {
    if (!seen.has(d.discoveryType)) seen.set(d.discoveryType, new Set());
    const set = seen.get(d.discoveryType)!;
    const key = d.term.trim().toLowerCase();
    if (set.has(key)) continue;
    set.add(key);
    map.set(d.discoveryType, (map.get(d.discoveryType) ?? 0) + 1);
  }
  return map;
}

function buildContext(raw: RawState): EvalContext {
  const level = levelFromXp(raw.xp);
  const atlas = computeAtlasProgress(raw.discoveries);
  const achievementScore = computeAchievementScore(
    raw.unlockedAchievements,
    raw.unlockedBadges,
    raw.stats.perfectQuizzes,
  );
  const rank = computeKnowledgeRank(level, raw.discoveries.length, raw.isLegend);
  return {
    level,
    discoveryCount: raw.discoveries.length,
    longestStreak: raw.longestStreak,
    mastery: Object.entries(raw.mastery).map(([slug, m]) => ({
      slug,
      answered: m.answered,
      correct: m.correct,
      masteryPct: m.answered > 0 ? Math.round((m.correct / m.answered) * 100) : 0,
      title: "",
    })),
    discoveriesByType: discoveryTypeCounts(raw.discoveries),
    atlasPct: atlas.overallPct,
    unlockedAchievements: raw.unlockedAchievements,
    achievementScore,
    knowledgeRankId: rank.id,
    unlockedItems: raw.unlockedItems ?? [],
  };
}

function evalRequirement(req: UnlockRequirement, ctx: EvalContext): RequirementView {
  switch (req.type) {
    case "level":
      return { label: `Reach Level ${req.value}`, current: ctx.level, required: req.value, met: ctx.level >= req.value };
    case "discoveries":
      return { label: `${req.value} discoveries`, current: ctx.discoveryCount, required: req.value, met: ctx.discoveryCount >= req.value };
    case "mastery": {
      const m = ctx.mastery.find((x) => x.slug === req.category);
      const pct = m?.masteryPct ?? 0;
      return { label: `${req.pct}% ${req.category} mastery`, current: pct, required: req.pct, met: pct >= req.pct };
    }
    case "discoveries_type": {
      const count = ctx.discoveriesByType.get(req.discoveryType) ?? 0;
      return { label: `${req.value} ${req.discoveryType} discoveries`, current: count, required: req.value, met: count >= req.value };
    }
    case "atlas_pct":
      return { label: `${req.value}% atlas completion`, current: ctx.atlasPct, required: req.value, met: ctx.atlasPct >= req.value };
    case "achievement":
      return { label: `Earn achievement`, current: ctx.unlockedAchievements.includes(req.id) ? 1 : 0, required: 1, met: ctx.unlockedAchievements.includes(req.id) };
    case "streak":
      return { label: `${req.value}-day streak`, current: ctx.longestStreak, required: req.value, met: ctx.longestStreak >= req.value };
    case "rank":
      return { label: `Reach ${req.rankId} rank`, current: 0, required: 1, met: ctx.knowledgeRankId === req.rankId };
    default:
      return { label: "Unknown", current: 0, required: 1, met: false };
  }
}

function requirementProgress(reqs: RequirementView[]): number {
  if (reqs.length === 0) return 1;
  const met = reqs.filter((r) => r.met).length;
  const partial = reqs.reduce((sum, r) => {
    if (r.met) return sum + 1;
    if (r.required > 0) return sum + Math.min(1, r.current / r.required);
    return sum;
  }, 0);
  return Math.min(1, partial / reqs.length);
}

export function evaluateUnlock(def: UnlockDef, ctx: EvalContext): UnlockProgress {
  const requirements = def.requirements.map((r) => evalRequirement(r, ctx));
  const unlocked =
    ctx.unlockedItems.includes(def.id) || requirements.every((r) => r.met);
  return {
    id: def.id,
    kind: def.kind,
    title: def.title,
    description: def.description,
    emoji: def.emoji,
    href: def.href,
    unlocked,
    progress: requirementProgress(requirements),
    requirements,
    rewardXp: def.rewardXp,
    rewardCoins: def.rewardCoins,
  };
}

export function evaluateAllUnlocks(raw: RawState): UnlockProgress[] {
  const ctx = buildContext(raw);
  return ALL_UNLOCKS.map((def) => evaluateUnlock(def, ctx)).sort(
    (a, b) => (a.unlocked === b.unlocked ? 0 : a.unlocked ? 1 : -1),
  );
}

export function findNextUnlock(raw: RawState): NextUnlock | null {
  const ctx = buildContext(raw);
  const locked = ALL_UNLOCKS.filter(
    (def) => !ctx.unlockedItems.includes(def.id),
  )
    .map((def) => ({ def, view: evaluateUnlock(def, ctx) }))
    .filter(({ view }) => !view.unlocked)
    .sort((a, b) => b.view.progress - a.view.progress);

  const best = locked[0];
  if (!best) return null;

  const nextReq = best.view.requirements.find((r) => !r.met);
  return {
    id: best.def.id,
    title: best.def.title,
    emoji: best.def.emoji,
    description: best.def.description,
    href: best.def.href,
    progress: best.view.progress,
    requirementLabel: nextReq
      ? `${nextReq.current}/${nextReq.required} — ${nextReq.label}`
      : "Almost there!",
  };
}

export function checkNewUnlocks(
  raw: RawState,
): { newlyUnlocked: UnlockProgress[]; ids: string[] } {
  const ctx = buildContext(raw);
  const prev = new Set(raw.unlockedItems ?? []);
  const newlyUnlocked: UnlockProgress[] = [];
  const ids: string[] = [];

  for (const def of ALL_UNLOCKS) {
    if (prev.has(def.id)) continue;
    const view = evaluateUnlock(def, ctx);
    if (view.unlocked) {
      newlyUnlocked.push(view);
      ids.push(def.id);
    }
  }

  if (ids.length > 0) {
    raw.unlockedItems = [...prev, ...ids];
  }

  return { newlyUnlocked, ids };
}

export function isQuizUnlocked(quizId: string, raw: RawState): UnlockProgress | null {
  const def = ALL_UNLOCKS.find((u) => u.href === `/quiz/${quizId}`);
  if (!def) return null;
  return evaluateUnlock(def, buildContext(raw));
}

export function isPictureGameUnlocked(slug: string, raw: RawState): UnlockProgress | null {
  const def = ALL_UNLOCKS.find((u) => u.href === `/play/${slug}`);
  if (!def) return null;
  return evaluateUnlock(def, buildContext(raw));
}

export function isWorldUnlocked(categorySlug: string, raw: RawState): UnlockProgress | null {
  const def = ALL_UNLOCKS.find((u) => u.href === `/${categorySlug}`);
  if (!def) return null;
  return evaluateUnlock(def, buildContext(raw));
}

export { countMasteredCategories, buildContext };
