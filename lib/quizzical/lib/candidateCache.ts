// Cache for AI-generated candidate name pools, keyed by `${category}|${difficulty}`.
//
// Generating fresh names from the AI on every play is what made loading slow AND
// defeated the per-subject Wikipedia/TMDB cache (new names every time = always a
// cache miss). Instead we generate a larger pool once, cache it for a while, and
// each game randomly samples from it — so variety stays high, the AI call is
// rare, and recurring names keep the image cache warm (fast).

import fs from "fs";
import path from "path";

export type Candidate = { name: string; decoys: string[] };

const DATA_DIR = path.join(process.cwd(), ".mock-data");
const DATA_FILE = path.join(DATA_DIR, "candidate-pools.json");
const TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

type PoolRecord = { created_at: number; candidates: Candidate[] };
type Store = Record<string, PoolRecord>;

function readAll(): Store {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as Store;
  } catch {
    return {};
  }
}

function writeAll(store: Store): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // read-only env — skip
  }
}

export function getCandidatePool(key: string): Candidate[] | null {
  const rec = readAll()[key];
  if (!rec) return null;
  if (Date.now() - rec.created_at > TTL_MS) return null;
  return rec.candidates.length > 0 ? rec.candidates : null;
}

export function saveCandidatePool(key: string, candidates: Candidate[]): void {
  if (candidates.length === 0) return;
  const store = readAll();
  store[key] = { created_at: Date.now(), candidates };
  writeAll(store);
}
