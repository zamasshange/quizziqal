// Client-side play history — prevents the same image/subject/question from
// reappearing within a session or in quick succession for the same browser.

"use client";

const STORAGE_KEY = "quizzical-play-history";
const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days (guest fallback; signed-in uses server)
const MAX_ITEMS = 80;

type SeenItem = { v: string; at: number };

type HistoryBucket = {
  answers: SeenItem[];
  images: SeenItem[];
  ids: SeenItem[];
};

type Store = Record<string, HistoryBucket>;

function emptyBucket(): HistoryBucket {
  return { answers: [], images: [], ids: [] };
}

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // quota exceeded — best effort
  }
}

function prune(items: SeenItem[]): SeenItem[] {
  const now = Date.now();
  const fresh = items.filter((i) => now - i.at < TTL_MS);
  return fresh.slice(-MAX_ITEMS);
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function mergeSeen(existing: SeenItem[], values: string[]): SeenItem[] {
  const now = Date.now();
  const seen = new Set(existing.map((i) => normalize(i.v)));
  const next = [...existing];
  for (const raw of values) {
    const v = raw.trim();
    if (!v) continue;
    const key = normalize(v);
    if (seen.has(key)) continue;
    seen.add(key);
    next.push({ v, at: now });
  }
  return prune(next);
}

/** Build a storage key for image games or text quizzes. */
export function playHistoryKey(
  kind: "image" | "text" | "surprise",
  ...parts: string[]
): string {
  return [kind, ...parts.map((p) => p.trim())].join(":");
}

export type ExcludedHistory = {
  answers: string[];
  images: string[];
  ids: string[];
};

/** Curated pool size for every picture-quiz category. */
export const IMAGE_POOL_SIZE = 12;

/**
 * Picture games use small fixed pools — rotate stale exclusions before fetch
 * so every category (celebrity, football, music, etc.) can always start.
 */
export function ensurePlayablePool(key: string, needed = 10): void {
  const { answers } = getExcluded(key);
  if (answers.length + needed > IMAGE_POOL_SIZE) {
    rotateExcluded(key);
  }
}

export function getExcluded(key: string): ExcludedHistory {
  const bucket = readStore()[key];
  if (!bucket) return { answers: [], images: [], ids: [] };
  return {
    answers: prune(bucket.answers).map((i) => i.v),
    images: prune(bucket.images).map((i) => i.v),
    ids: prune(bucket.ids).map((i) => i.v),
  };
}

export function recordSeen(
  key: string,
  data: {
    answers?: string[];
    images?: string[];
    ids?: string[];
  },
): void {
  const store = readStore();
  const bucket = store[key] ?? emptyBucket();
  store[key] = {
    answers: mergeSeen(bucket.answers, data.answers ?? []),
    images: mergeSeen(bucket.images, data.images ?? []),
    ids: mergeSeen(bucket.ids, data.ids ?? []),
  };
  writeStore(store);
}

/** Drop the oldest half of exclusions when the pool is exhausted. */
export function rotateExcluded(key: string): void {
  const store = readStore();
  const bucket = store[key];
  if (!bucket) return;

  const halve = (items: SeenItem[]) => {
    const pruned = prune(items);
    return pruned.slice(Math.floor(pruned.length / 2));
  };

  store[key] = {
    answers: halve(bucket.answers),
    images: halve(bucket.images),
    ids: halve(bucket.ids),
  };
  writeStore(store);
}
