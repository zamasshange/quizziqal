// Cache for generated image-quiz questions.
//
// Uses the Supabase table `wikipedia_quiz_cache` when configured; otherwise
// transparently falls back to a local JSON file so caching works during
// development before Supabase credentials exist.

import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "./supabase";

export type CachedQuiz = {
  id: string;
  name: string;
  category: string;
  image_url: string;
  description: string;
  correct_answer: string;
  wrong_answers: string[];
  /** Optional reveal image (e.g. TMDB movie poster). */
  poster_url?: string | null;
  /** Optional spoiler-free hint (e.g. movie genre/year/plot teaser). */
  hint?: string | null;
  created_at: string;
};

const TABLE = "wikipedia_quiz_cache";
const DATA_DIR = path.join(process.cwd(), ".mock-data");
const DATA_FILE = path.join(DATA_DIR, "wikipedia-quiz-cache.json");

// ---- Local file fallback ---------------------------------------------------

function localReadAll(): CachedQuiz[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as CachedQuiz[];
  } catch {
    return [];
  }
}

function localWriteAll(rows: CachedQuiz[]): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2), "utf8");
  } catch {
    // read-only env — skip
  }
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `c-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ---- Public API ------------------------------------------------------------

export async function getCachedQuiz(
  name: string,
  category: string,
): Promise<CachedQuiz | null> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("name", name)
      .eq("category", category)
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return (data as CachedQuiz) ?? null;
  }

  return (
    localReadAll().find(
      (row) => row.name === name && row.category === category,
    ) ?? null
  );
}

export async function getCachedByCategory(
  category: string,
): Promise<CachedQuiz[]> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("category", category);
    if (error || !data) return [];
    return data as CachedQuiz[];
  }

  return localReadAll().filter((row) => row.category === category);
}

export async function saveCachedQuiz(
  entry: Omit<CachedQuiz, "id" | "created_at">,
): Promise<CachedQuiz> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert(
        {
          name: entry.name,
          category: entry.category,
          image_url: entry.image_url,
          description: entry.description,
          correct_answer: entry.correct_answer,
          wrong_answers: entry.wrong_answers,
          poster_url: entry.poster_url ?? null,
          hint: entry.hint ?? null,
        },
        { onConflict: "name,category" },
      )
      .select("*")
      .single();
    if (!error && data) return data as CachedQuiz;
    // fall through to local on error
  }

  const rows = localReadAll();
  const existingIdx = rows.findIndex(
    (r) => r.name === entry.name && r.category === entry.category,
  );
  const row: CachedQuiz = {
    id: existingIdx >= 0 ? rows[existingIdx].id : newId(),
    created_at:
      existingIdx >= 0 ? rows[existingIdx].created_at : new Date().toISOString(),
    ...entry,
  };
  if (existingIdx >= 0) rows[existingIdx] = row;
  else rows.unshift(row);
  localWriteAll(rows);
  return row;
}
