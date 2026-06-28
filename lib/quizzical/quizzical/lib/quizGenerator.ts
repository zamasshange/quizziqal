// Auto quiz-generation pipeline: Wikipedia (images) + TMDB (movies) + cache.
//
//   generateImageQuiz(category, difficulty)         -> one question (cache-first)
//   generateImageQuizBatch(category, n, difficulty) -> n unique questions
//
// Images ALWAYS come from a real source (Wikipedia for people, TMDB for movies).
// Subject NAMES come from the AI per difficulty tier (with a curated pool as a
// reliable fallback). Wrong answers are sampled from the same-tier candidate
// list — this is instant (no per-question AI call) and keeps distractors
// plausible and difficulty-consistent.

import { fetchWikipediaSummary } from "./wikipedia";
import { fetchMovieData } from "./tmdb";
import { getCachedQuiz, saveCachedQuiz, getCachedByCategory } from "./quizCache";
import { getCandidatePool, saveCandidatePool } from "./candidateCache";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type GeneratedQuestion = {
  id: string;
  category: string;
  question: string;
  image_url: string;
  description: string;
  correct_answer: string;
  wrong_answers: string[];
  options: string[];
  /** Shown on the reveal (e.g. TMDB movie poster). */
  reveal_image_url?: string;
  /** Spoiler-free hint shown on demand (movies). */
  hint?: string;
};

type PoolEntry = { label: string; query: string; decoys?: string[] };
type Pool = { question: string; entries: PoolEntry[] };

const POOLS: Record<string, Pool> = {
  Celebrity: {
    question: "Who is this?",
    entries: [
      { label: "Tom Hanks", query: "Tom Hanks" },
      { label: "Leonardo DiCaprio", query: "Leonardo DiCaprio" },
      { label: "Meryl Streep", query: "Meryl Streep" },
      { label: "Denzel Washington", query: "Denzel Washington" },
      { label: "Zendaya", query: "Zendaya" },
      { label: "Brad Pitt", query: "Brad Pitt" },
      { label: "Scarlett Johansson", query: "Scarlett Johansson" },
      { label: "Morgan Freeman", query: "Morgan Freeman" },
      { label: "Will Smith", query: "Will Smith" },
      { label: "Margot Robbie", query: "Margot Robbie" },
      { label: "Keanu Reeves", query: "Keanu Reeves" },
      { label: "Angelina Jolie", query: "Angelina Jolie" },
    ],
  },
  Athlete: {
    question: "Who is this?",
    entries: [
      { label: "Lionel Messi", query: "Lionel Messi" },
      { label: "Cristiano Ronaldo", query: "Cristiano Ronaldo" },
      { label: "Kylian Mbappé", query: "Kylian Mbappé" },
      { label: "Serena Williams", query: "Serena Williams" },
      { label: "LeBron James", query: "LeBron James" },
      { label: "Usain Bolt", query: "Usain Bolt" },
      { label: "Roger Federer", query: "Roger Federer" },
      { label: "Neymar", query: "Neymar" },
      { label: "Michael Jordan", query: "Michael Jordan" },
      { label: "Rafael Nadal", query: "Rafael Nadal" },
      { label: "Tom Brady", query: "Tom Brady" },
      { label: "Virat Kohli", query: "Virat Kohli" },
    ],
  },
  Movie: {
    question: "Which movie is this?",
    entries: [
      { label: "Inception", query: "Inception" },
      { label: "Titanic", query: "Titanic (1997 film)" },
      { label: "The Matrix", query: "The Matrix" },
      { label: "The Dark Knight", query: "The Dark Knight" },
      { label: "Joker", query: "Joker (2019 film)" },
      { label: "Avatar", query: "Avatar (2009 film)" },
      { label: "Parasite", query: "Parasite (2019 film)" },
      { label: "Interstellar", query: "Interstellar (film)" },
      { label: "Gladiator", query: "Gladiator (2000 film)" },
      { label: "Forrest Gump", query: "Forrest Gump" },
      { label: "The Godfather", query: "The Godfather" },
      { label: "Pulp Fiction", query: "Pulp Fiction" },
    ],
  },
  Music: {
    question: "Who is this artist?",
    entries: [
      { label: "Beyoncé", query: "Beyoncé" },
      { label: "Taylor Swift", query: "Taylor Swift" },
      { label: "Drake", query: "Drake (musician)" },
      { label: "Adele", query: "Adele" },
      { label: "The Weeknd", query: "The Weeknd" },
      { label: "Rihanna", query: "Rihanna" },
      { label: "Eminem", query: "Eminem" },
      { label: "Ed Sheeran", query: "Ed Sheeran" },
      { label: "Bruno Mars", query: "Bruno Mars" },
      { label: "Ariana Grande", query: "Ariana Grande" },
      { label: "Billie Eilish", query: "Billie Eilish" },
      { label: "Kendrick Lamar", query: "Kendrick Lamar" },
    ],
  },
};

export function isImageCategory(value: string): boolean {
  return value in POOLS;
}

export function normalizeDifficulty(value: string | null | undefined): Difficulty {
  if (value === "Easy" || value === "Hard") return value;
  return "Medium";
}

export type ExcludeSet = {
  answers?: string[];
  images?: string[];
};

function toExcludeSet(exclude?: ExcludeSet): {
  answers: Set<string>;
  images: Set<string>;
} {
  return {
    answers: new Set(
      (exclude?.answers ?? []).map((a) => a.trim().toLowerCase()).filter(Boolean),
    ),
    images: new Set(
      (exclude?.images ?? []).map((a) => a.trim()).filter(Boolean),
    ),
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- AI candidates: subjects + difficulty-scaled "close" decoys ------------

const AI_KIND: Record<string, string> = {
  Celebrity: "famous actors and celebrities",
  Athlete: "famous athletes and sports stars",
  Movie: "famous movies",
  Music: "famous music artists or bands",
};

const DIFFICULTY_BRIEF: Record<Difficulty, string> = {
  Easy: "EASY tier: globally famous, instantly recognizable, true household names that almost anyone would know on sight",
  Medium:
    "MEDIUM tier: well-known and popular, but not the very biggest names — recognizable to most people who follow the topic",
  Hard: "HARD tier: deeper cuts and more niche picks — recognizable mainly to dedicated fans/enthusiasts, NOT obvious mainstream choices",
};

// How "close" the 3 decoys should be to the correct answer, per difficulty.
function decoyBrief(category: string, difficulty: Difficulty): string {
  const isMovie = category === "Movie";
  if (difficulty === "Easy") {
    return isMovie
      ? "Decoys: other real movies that are plausible but a fan could rule out."
      : `Decoys: other real ${AI_KIND[category]} that are plausible but a fan could rule out.`;
  }
  if (difficulty === "Medium") {
    return isMovie
      ? "Decoys: real movies of the same genre or decade, so they're genuinely tempting."
      : "Decoys: real people of the SAME gender and a similar era, so they're genuinely tempting.";
  }
  return isMovie
    ? "Decoys: real movies of the SAME genre AND decade with a similar vibe — easily confusable."
    : "Decoys: real people of the SAME gender, similar age/era, and similar look/role — easily confusable at a glance.";
}

type AiCandidate = { name: string; decoys: string[] };

async function aiCandidates(
  category: string,
  count: number,
  difficulty: Difficulty,
): Promise<AiCandidate[] | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
  const kind = AI_KIND[category] ?? category;
  const seed = Math.floor(Math.random() * 1_000_000);
  const isMovie = category === "Movie";

  try {
    const prompt =
      `Generate ${count} ${kind} for a "guess from a photo" game. ` +
      `${DIFFICULTY_BRIEF[difficulty]}. ` +
      `For EACH one, also provide exactly 3 decoy answers (wrong but plausible). ` +
      `${decoyBrief(category, difficulty)} ` +
      `Decoys must be real and must NOT equal the correct answer. ` +
      `Make the main list DIVERSE across eras, countries, and genres, and fully ` +
      `RANDOMIZED (randomization seed: ${seed}). No duplicate main answers. ` +
      (isMovie
        ? `Use exact, official movie titles. `
        : `Use full real names. `) +
      `Return ONLY a JSON array, no markdown, shaped exactly like: ` +
      `[{"name":"...","decoys":["...","...","..."]}]`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "X-Title": "Quizzical",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 1.0,
      }),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return null;

    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr)) return null;

    const out: AiCandidate[] = [];
    for (const item of arr) {
      if (typeof item === "string") {
        const name = item.trim();
        if (name) out.push({ name, decoys: [] });
      } else if (item && typeof item === "object") {
        const name = typeof item.name === "string" ? item.name.trim() : "";
        if (!name) continue;
        const decoys = Array.isArray(item.decoys)
          ? (item.decoys as unknown[])
              .filter((d): d is string => typeof d === "string")
              .map((d) => d.trim())
              .filter(Boolean)
          : [];
        out.push({ name, decoys });
      }
    }
    return out.length > 0 ? out : null;
  } catch {
    return null;
  }
}

// Ordered, de-duplicated entries to try this session (AI first, pool fallback),
// plus a flat distractor pool used to top up when AI decoys run short.
async function workingEntries(
  category: string,
  count: number,
  difficulty: Difficulty,
  exclude?: ExcludeSet,
): Promise<{ entries: PoolEntry[]; distractors: string[] }> {
  const want = difficulty === "Hard" ? count * 3 : count * 2;
  const blocked = toExcludeSet(exclude);

  // Use a cached AI name pool (per category+difficulty) and randomly sample from
  // it. This keeps the slow AI call rare while staying varied; recurring names
  // also keep the per-subject Wikipedia/TMDB cache warm for fast subsequent loads.
  const poolKey = `${category}|${difficulty}`;
  let pool = getCandidatePool(poolKey);
  if (!pool || pool.length < want) {
    const generated = await aiCandidates(category, 36, difficulty);
    if (generated && generated.length > 0) {
      saveCandidatePool(poolKey, generated);
      pool = generated;
    }
  }

  const ai = pool ? shuffle(pool).slice(0, Math.max(want, 20)) : null;
  const aiEntries: PoolEntry[] = (ai ?? []).map((c) => ({
    label: c.name,
    query: c.name,
    decoys: c.decoys,
  }));

  const merged: PoolEntry[] = [];
  const seen = new Set<string>();
  const addEntry = (e: PoolEntry) => {
    const key = e.label.toLowerCase();
    if (!e.label || seen.has(key) || blocked.answers.has(key)) return;
    seen.add(key);
    merged.push(e);
  };

  for (const e of [...shuffle(aiEntries), ...shuffle(POOLS[category].entries)]) {
    addEntry(e);
  }

  // Supplement from the Wikipedia/TMDB cache when exclusions shrink the pool.
  if (merged.length < count + 4) {
    const cached = await getCachedByCategory(category);
    for (const row of shuffle(cached)) {
      if (merged.length >= count + 12) break;
      addEntry({ label: row.name, query: row.name });
    }
  }

  // Fallback distractor pool: every name + every decoy we know about.
  const distractorSet = new Set<string>();
  for (const c of pool ?? []) {
    distractorSet.add(c.name);
    for (const d of c.decoys) distractorSet.add(d);
  }
  for (const e of POOLS[category].entries) distractorSet.add(e.label);

  return { entries: merged, distractors: [...distractorSet] };
}

// --- Wrong answers: AI's close decoys first, then same-category top-up ------

function finalizeWrongAnswers(
  correct: string,
  preferred: string[],
  fallback: string[],
): string[] {
  const seen = new Set([correct.toLowerCase()]);
  const out: string[] = [];

  const take = (list: string[]) => {
    for (const c of list) {
      if (out.length === 3) return;
      const v = (c ?? "").trim();
      if (!v || seen.has(v.toLowerCase())) continue;
      seen.add(v.toLowerCase());
      out.push(v);
    }
  };

  take(preferred); // AI's close, difficulty-tuned decoys
  if (out.length < 3) take(shuffle(fallback)); // top up if AI gave too few
  return out.slice(0, 3);
}

function buildQuestion(row: {
  id: string;
  category: string;
  image_url: string;
  description: string;
  correct_answer: string;
  wrong_answers: string[];
  poster_url?: string | null;
  hint?: string | null;
}): GeneratedQuestion {
  return {
    id: row.id,
    category: row.category,
    question: POOLS[row.category]?.question ?? "Who is this?",
    image_url: row.image_url,
    description: row.description,
    correct_answer: row.correct_answer,
    wrong_answers: row.wrong_answers,
    options: shuffle([row.correct_answer, ...row.wrong_answers]),
    reveal_image_url: row.poster_url ?? undefined,
    hint: row.hint ?? undefined,
  };
}

async function generateForEntry(
  category: string,
  entry: PoolEntry,
  fallbackDistractors: string[],
): Promise<GeneratedQuestion | null> {
  const decoysFor = (correct: string) =>
    finalizeWrongAnswers(correct, entry.decoys ?? [], fallbackDistractors);
  // 1. Cache first.
  let cached = await getCachedQuiz(entry.label, category);
  if (cached) {
    // Upgrade movie entries cached before the backdrop/poster/hint split.
    if (category === "Movie") {
      const needsBackdrop = !cached.image_url.includes("image.tmdb.org");
      const needsPoster = !cached.poster_url;
      const needsHint = !cached.hint;
      if (needsBackdrop || needsPoster || needsHint) {
        const m = await fetchMovieData(entry.label);
        const image_url = m.backdrop_url ?? cached.image_url;
        const poster_url = m.poster_url ?? cached.poster_url ?? undefined;
        const hint = m.hint ?? cached.hint ?? undefined;
        if (
          image_url !== cached.image_url ||
          poster_url !== cached.poster_url ||
          hint !== cached.hint
        ) {
          cached = await saveCachedQuiz({
            name: cached.name,
            category: cached.category,
            image_url,
            description: cached.description,
            correct_answer: cached.correct_answer,
            wrong_answers: cached.wrong_answers,
            poster_url,
            hint,
          });
        }
      }
    }
    // Refresh distractors from this session's tier for consistency.
    return buildQuestion({
      ...cached,
      wrong_answers: decoysFor(cached.correct_answer),
    });
  }

  let image_url: string | null = null;
  let description = "";
  let poster_url: string | undefined;
  let hint: string | undefined;

  if (category === "Movie") {
    // Question = textless TMDB backdrop (no title → real guess).
    const m = await fetchMovieData(entry.label);
    if (!m.backdrop_url) return null; // skip if no spoiler-free scene
    image_url = m.backdrop_url;
    poster_url = m.poster_url ?? undefined;
    hint = m.hint ?? undefined;
    let summary = await fetchWikipediaSummary(entry.query);
    if (!summary) summary = await fetchWikipediaSummary(`${entry.label} (film)`);
    description = summary?.description ?? "";
  } else {
    const summary = await fetchWikipediaSummary(entry.query);
    if (!summary) return null;
    image_url = summary.image_url;
    description = summary.description;
  }

  if (!image_url) return null;

  const wrong_answers = decoysFor(entry.label);

  const saved = await saveCachedQuiz({
    name: entry.label,
    category,
    image_url,
    description,
    correct_answer: entry.label,
    wrong_answers,
    poster_url,
    hint,
  });

  return buildQuestion(saved);
}

export async function generateImageQuizBatch(
  category: string,
  count = 10,
  difficulty: Difficulty = "Medium",
  exclude?: ExcludeSet,
): Promise<GeneratedQuestion[]> {
  if (!isImageCategory(category)) return [];

  const blocked = toExcludeSet(exclude);
  const results: GeneratedQuestion[] = [];
  const usedAnswer = new Set<string>(blocked.answers);
  const usedImage = new Set<string>(blocked.images);

  // Up to two passes: normal exclusions, then a fresh AI pool if still short.
  for (let pass = 0; pass < 2 && results.length < count; pass++) {
    const passExclude: ExcludeSet = {
      answers: [...usedAnswer],
      images: [...usedImage],
    };
    const { entries, distractors } = await workingEntries(
      category,
      count,
      difficulty,
      passExclude,
    );

    const WINDOW = count + 8;
    for (let i = 0; i < entries.length && results.length < count; i += WINDOW) {
      const slice = entries.slice(i, i + WINDOW);
      const qs = await Promise.all(
        slice.map((e) =>
          generateForEntry(category, e, distractors).catch(() => null),
        ),
      );
      for (const q of qs) {
        if (!q) continue;
        const answerKey = q.correct_answer.toLowerCase();
        if (usedAnswer.has(answerKey) || usedImage.has(q.image_url)) continue;
        usedAnswer.add(answerKey);
        usedImage.add(q.image_url);
        results.push(q);
        if (results.length >= count) break;
      }
    }

    if (pass === 0 && results.length < count) {
      // Refresh the AI candidate pool so the retry has genuinely new subjects.
      const fresh = await aiCandidates(category, 36, difficulty);
      if (fresh && fresh.length > 0) {
        saveCandidatePool(`${category}|${difficulty}`, fresh);
      }
    }
  }

  return results;
}

export async function generateImageQuiz(
  category: string,
  difficulty: Difficulty = "Medium",
  exclude?: ExcludeSet,
): Promise<GeneratedQuestion | null> {
  const [q] = await generateImageQuizBatch(category, 1, difficulty, exclude);
  return q ?? null;
}
