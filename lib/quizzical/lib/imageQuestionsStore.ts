// Server-only data store for admin-managed image quiz questions.
//
// Uses Supabase when configured; otherwise persists to a local JSON file.
// Play routes use lib/quizGenerator.ts (real Wikipedia/TMDB/OpenRouter) — this
// store is for the dashboard only.

import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "./supabase";
import type {
  ImageQuestion,
  ImageCategory,
  Difficulty,
  NewImageQuestion,
  ListFilters,
} from "./imageQuestions";

const TABLE = "image_questions";
const DATA_DIR = path.join(process.cwd(), ".mock-data");
const DATA_FILE = path.join(DATA_DIR, "image-questions.json");

function rowFromDb(data: Record<string, unknown>): ImageQuestion {
  const wrong = data.wrong_answers;
  return {
    id: String(data.id),
    category: data.category as ImageCategory,
    type: "image-guess",
    image_url: String(data.image_url),
    question: String(data.question ?? "Who is this?"),
    correct_answer: String(data.correct_answer),
    wrong_answers: Array.isArray(wrong)
      ? (wrong as string[]).slice(0, 3) as [string, string, string]
      : ["", "", ""],
    difficulty: data.difficulty as Difficulty,
    created_at: String(data.created_at ?? new Date().toISOString()),
  };
}

function localReadAll(): ImageQuestion[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as ImageQuestion[];
  } catch {
    // missing or unreadable
  }
  return [];
}

function localWriteAll(rows: ImageQuestion[]): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2), "utf8");
  } catch {
    // read-only env
  }
}

function applyFilters(rows: ImageQuestion[], filters: ListFilters): ImageQuestion[] {
  const { category, difficulty, search } = filters;
  const q = search?.trim().toLowerCase();
  return rows
    .filter((row) => (category ? row.category === category : true))
    .filter((row) => (difficulty ? row.difficulty === difficulty : true))
    .filter((row) =>
      q
        ? row.correct_answer.toLowerCase().includes(q) ||
          row.category.toLowerCase().includes(q) ||
          row.question.toLowerCase().includes(q)
        : true,
    )
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function listImageQuestions(
  filters: ListFilters = {},
): Promise<ImageQuestion[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    let query = supabase.from(TABLE).select("*").order("created_at", {
      ascending: false,
    });
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);
    const { data, error } = await query;
    if (error) return [];
    const rows = (data ?? []).map((r) =>
      rowFromDb(r as Record<string, unknown>),
    );
    return applyFilters(rows, filters);
  }
  return applyFilters(localReadAll(), filters);
}

export async function getImageQuestion(
  id: string,
): Promise<ImageQuestion | undefined> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return undefined;
    return rowFromDb(data as Record<string, unknown>);
  }
  return localReadAll().find((row) => row.id === id);
}

export async function createImageQuestion(
  data: NewImageQuestion,
): Promise<ImageQuestion> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: row, error } = await supabase
      .from(TABLE)
      .insert({
        category: data.category,
        type: "image-guess",
        image_url: data.image_url,
        question: data.question,
        correct_answer: data.correct_answer,
        wrong_answers: data.wrong_answers,
        difficulty: data.difficulty,
      })
      .select("*")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Insert failed");
    return rowFromDb(row as Record<string, unknown>);
  }

  const rows = localReadAll();
  const row: ImageQuestion = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `q-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: "image-guess",
    created_at: new Date().toISOString(),
    ...data,
  };
  rows.unshift(row);
  localWriteAll(rows);
  return row;
}

export async function updateImageQuestion(
  id: string,
  data: Partial<NewImageQuestion>,
): Promise<ImageQuestion | undefined> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: row, error } = await supabase
      .from(TABLE)
      .update(data)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error || !row) return undefined;
    return rowFromDb(row as Record<string, unknown>);
  }

  const rows = localReadAll();
  const existing = rows.find((r) => r.id === id);
  if (!existing) return undefined;
  Object.assign(existing, data);
  localWriteAll(rows);
  return existing;
}

export async function deleteImageQuestion(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    return !error;
  }

  const rows = localReadAll();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  rows.splice(idx, 1);
  localWriteAll(rows);
  return true;
}
