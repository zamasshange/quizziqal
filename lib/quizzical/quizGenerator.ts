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
import { fetchMovieData, isTmdbPosterImageUrl } from "./tmdb";
import { getCachedQuiz, saveCachedQuiz, getCachedByCategory } from "./quizCache";
import { getCandidatePool, saveCandidatePool } from "./candidateCache";
import {
  ATHLETE_KIND_LABEL,
  BASKETBALL_KIND_LABEL,
  CATEGORY_AI_RULES,
  CRICKET_KIND_LABEL,
  FOOTBALL_KIND_LABEL,
  isMajorTeamSportAthlete,
} from "./athleteSports";
import {
  isAllowedQuizImageUrl,
  normalizeImageUrl,
  optimizeQuizImageUrl,
} from "./quizImageUrl";
import bootstrapRows from "./imageQuizBootstrap.json";

type BootstrapRow = {
  name: string;
  category: string;
  image_url: string;
  description: string;
  correct_answer: string;
  wrong_answers: string[];
  poster_url?: string | null;
  hint?: string | null;
};

const BOOTSTRAP = new Map<string, BootstrapRow>(
  Object.entries(bootstrapRows as Record<string, BootstrapRow>),
);

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
    question: "Who is this athlete?",
    entries: [
      { label: "Serena Williams", query: "Serena Williams" },
      { label: "Roger Federer", query: "Roger Federer" },
      { label: "Rafael Nadal", query: "Rafael Nadal" },
      { label: "Naomi Osaka", query: "Naomi Osaka" },
      { label: "Usain Bolt", query: "Usain Bolt" },
      { label: "Eliud Kipchoge", query: "Eliud Kipchoge" },
      { label: "Simone Biles", query: "Simone Biles" },
      { label: "Michael Phelps", query: "Michael Phelps" },
      { label: "Lewis Hamilton", query: "Lewis Hamilton" },
      { label: "Tiger Woods", query: "Tiger Woods" },
      { label: "Ian Thorpe", query: "Ian Thorpe" },
      { label: "Chloe Kim", query: "Chloe Kim" },
    ],
  },
  Football: {
    question: "Who is this footballer?",
    entries: [
      { label: "Lionel Messi", query: "Lionel Messi" },
      { label: "Cristiano Ronaldo", query: "Cristiano Ronaldo" },
      { label: "Kylian Mbappé", query: "Kylian Mbappé" },
      { label: "Neymar", query: "Neymar" },
      { label: "Erling Haaland", query: "Erling Haaland" },
      { label: "Mohamed Salah", query: "Mohamed Salah" },
      { label: "Kevin De Bruyne", query: "Kevin De Bruyne" },
      { label: "Robert Lewandowski", query: "Robert Lewandowski" },
      { label: "Harry Kane", query: "Harry Kane" },
      { label: "Luka Modrić", query: "Luka Modrić" },
      { label: "Pelé", query: "Pelé" },
      { label: "Zinedine Zidane", query: "Zinedine Zidane" },
    ],
  },
  Basketball: {
    question: "Who is this basketball player?",
    entries: [
      { label: "LeBron James", query: "LeBron James" },
      { label: "Michael Jordan", query: "Michael Jordan" },
      { label: "Stephen Curry", query: "Stephen Curry" },
      { label: "Kobe Bryant", query: "Kobe Bryant" },
      { label: "Shaquille O'Neal", query: "Shaquille O'Neal" },
      { label: "Kevin Durant", query: "Kevin Durant" },
      { label: "Giannis Antetokounmpo", query: "Giannis Antetokounmpo" },
      { label: "Magic Johnson", query: "Magic Johnson" },
      { label: "Larry Bird", query: "Larry Bird" },
      { label: "Tim Duncan", query: "Tim Duncan" },
      { label: "Dirk Nowitzki", query: "Dirk Nowitzki" },
      { label: "Hakeem Olajuwon", query: "Hakeem Olajuwon" },
    ],
  },
  Cricket: {
    question: "Who is this cricketer?",
    entries: [
      { label: "Virat Kohli", query: "Virat Kohli" },
      { label: "Sachin Tendulkar", query: "Sachin Tendulkar" },
      { label: "MS Dhoni", query: "MS Dhoni" },
      { label: "Ben Stokes", query: "Ben Stokes" },
      { label: "Babar Azam", query: "Babar Azam" },
      { label: "Steve Smith", query: "Steve Smith (cricketer)" },
      { label: "Jacques Kallis", query: "Jacques Kallis" },
      { label: "Shane Warne", query: "Shane Warne" },
      { label: "Brian Lara", query: "Brian Lara" },
      { label: "AB de Villiers", query: "AB de Villiers" },
      { label: "Rohit Sharma", query: "Rohit Sharma" },
      { label: "Joe Root", query: "Joe Root" },
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
  Athlete: ATHLETE_KIND_LABEL,
  Football: FOOTBALL_KIND_LABEL,
  Basketball: BASKETBALL_KIND_LABEL,
  Cricket: CRICKET_KIND_LABEL,
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
  const categoryRule = CATEGORY_AI_RULES[category];

  try {
    const prompt =
      `Generate ${count} ${kind} for a "guess from a photo" game. ` +
      `${DIFFICULTY_BRIEF[difficulty]}. ` +
      (categoryRule ? `${categoryRule} ` : "") +
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
    const filtered =
      category === "Athlete"
        ? out.filter((c) => !isMajorTeamSportAthlete(c.name))
        : out;
    return filtered.length > 0 ? filtered : null;
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
  opts?: { poolOnly?: boolean; skipDb?: boolean },
): Promise<{ entries: PoolEntry[]; distractors: string[] }> {
  const want = difficulty === "Hard" ? count * 3 : count * 2;
  const blocked = toExcludeSet(exclude);

  let pool: AiCandidate[] | null = null;
  if (!opts?.poolOnly) {
    const poolKey = `${category}|${difficulty}`;
    let cached = getCandidatePool(poolKey);
    if (!cached || cached.length < want) {
      const generated = await aiCandidates(category, 36, difficulty);
      if (generated && generated.length > 0) {
        saveCandidatePool(poolKey, generated);
        cached = generated;
      }
    }
    pool = cached ? shuffle(cached).slice(0, Math.max(want, 20)) : null;
  }

  const aiEntries: PoolEntry[] = (pool ?? []).map((c) => ({
    label: c.name,
    query: c.name,
    decoys: c.decoys,
  }));

  const merged: PoolEntry[] = [];
  const seen = new Set<string>();
  const addEntry = (e: PoolEntry) => {
    const key = e.label.toLowerCase();
    if (!e.label || seen.has(key) || blocked.answers.has(key)) return;
    if (category === "Athlete" && isMajorTeamSportAthlete(e.label)) return;
    seen.add(key);
    merged.push(e);
  };

  for (const e of [...shuffle(aiEntries), ...shuffle(POOLS[category].entries)]) {
    addEntry(e);
  }

  if (merged.length < count + 4 && !opts?.skipDb) {
    const cached = await getCachedByCategory(category);
    for (const row of shuffle(cached)) {
      if (merged.length >= count + 12) break;
      addEntry({ label: row.name, query: row.name });
    }
  }

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

function questionFromBootstrap(
  category: string,
  boot: BootstrapRow,
  distractors: string[],
): GeneratedQuestion | null {
  if (!boot.image_url?.trim() || !isAllowedQuizImageUrl(boot.image_url)) return null;
  if (category === "Athlete" && isMajorTeamSportAthlete(boot.correct_answer))
    return null;
  const wrong_answers =
    category === "Athlete"
      ? finalizeWrongAnswers(
          boot.correct_answer,
          boot.wrong_answers,
          distractors.filter((d) => !isMajorTeamSportAthlete(d)),
        )
      : finalizeWrongAnswers(boot.correct_answer, boot.wrong_answers, distractors);
  return buildQuestion({
    id: `boot-${boot.name.toLowerCase().replace(/\s+/g, "-")}`,
    category: boot.category,
    image_url: boot.image_url,
    description: boot.description,
    correct_answer: boot.correct_answer,
    wrong_answers,
    poster_url: boot.poster_url ?? undefined,
    hint: boot.hint ?? undefined,
  });
}

function collectBootstrapQuestions(
  category: string,
  count: number,
  blocked: ReturnType<typeof toExcludeSet>,
  distractors: string[],
): GeneratedQuestion[] {
  const usedAnswer = new Set<string>(blocked.answers);
  const usedImage = new Set<string>(blocked.images);
  const results: GeneratedQuestion[] = [];
  const entries = shuffle(POOLS[category]?.entries ?? []);

  for (const entry of entries) {
    if (results.length >= count) break;
    const boot = BOOTSTRAP.get(`${category}|${entry.label}`);
    if (!boot) continue;
    const answerKey = boot.correct_answer.toLowerCase();
    if (usedAnswer.has(answerKey) || usedImage.has(boot.image_url)) continue;
    const q = questionFromBootstrap(category, boot, distractors);
    if (!q) continue;
    usedAnswer.add(answerKey);
    usedImage.add(boot.image_url);
    results.push(q);
    void saveCachedQuiz({
      name: boot.name,
      category: boot.category,
      image_url: boot.image_url,
      description: boot.description,
      correct_answer: boot.correct_answer,
      wrong_answers: q.wrong_answers,
      poster_url: boot.poster_url ?? undefined,
      hint: boot.hint ?? undefined,
    }).catch(() => undefined);
  }

  return results;
}

async function generateFastBatch(
  category: string,
  count: number,
  difficulty: Difficulty,
  exclude: ExcludeSet | undefined,
  distractors: string[],
): Promise<GeneratedQuestion[]> {
  const poolSize = POOLS[category]?.entries.length ?? 12;
  let effectiveExclude = exclude;
  const initialBlocked = toExcludeSet(exclude);
  if (initialBlocked.answers.size + count > poolSize) {
    effectiveExclude = { answers: [], images: exclude?.images ?? [] };
  }

  const blocked = toExcludeSet(effectiveExclude);
  const results = collectBootstrapQuestions(category, count, blocked, distractors);
  if (results.length >= count) return results.slice(0, count);

  const usedAnswer = new Set<string>(blocked.answers);
  const usedImage = new Set<string>(blocked.images);
  for (const q of results) {
    usedAnswer.add(q.correct_answer.toLowerCase());
    usedImage.add(q.image_url);
  }

  const { entries, distractors: liveDistractors } = await workingEntries(
    category,
    count,
    difficulty,
    { answers: [...usedAnswer], images: [...usedImage] },
    { poolOnly: true, skipDb: true },
  );

  const pending = entries.filter(
    (e) => !usedAnswer.has(e.label.toLowerCase()),
  );
  const concurrency = 12;
  for (let i = 0; i < pending.length && results.length < count; i += concurrency) {
    const slice = pending.slice(i, i + concurrency);
    const qs = await Promise.all(
      slice.map((e) =>
        generateForEntry(category, e, liveDistractors, { deferCache: true }).catch(
          () => null,
        ),
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

  if (results.length === 0 && (blocked.answers.size > 0 || blocked.images.size > 0)) {
    return collectBootstrapQuestions(
      category,
      count,
      { answers: new Set(), images: new Set() },
      distractors,
    ).slice(0, count);
  }

  return results.slice(0, count);
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
    image_url: optimizeQuizImageUrl(row.image_url),
    description: row.description,
    correct_answer: row.correct_answer,
    wrong_answers: row.wrong_answers,
    options: shuffle([row.correct_answer, ...row.wrong_answers]),
    reveal_image_url: row.poster_url
      ? optimizeQuizImageUrl(row.poster_url)
      : undefined,
    hint: row.hint ?? undefined,
  };
}

async function generateForEntry(
  category: string,
  entry: PoolEntry,
  fallbackDistractors: string[],
  opts?: { deferCache?: boolean },
): Promise<GeneratedQuestion | null> {
  if (category === "Athlete" && isMajorTeamSportAthlete(entry.label)) return null;

  const decoysFor = (correct: string) => {
    const pool =
      category === "Athlete"
        ? fallbackDistractors.filter((d) => !isMajorTeamSportAthlete(d))
        : fallbackDistractors;
    const preferred =
      category === "Athlete"
        ? (entry.decoys ?? []).filter((d) => !isMajorTeamSportAthlete(d))
        : (entry.decoys ?? []);
    return finalizeWrongAnswers(correct, preferred, pool);
  };
  // 0. Bundled bootstrap (zero network — instant cold start).
  const boot = BOOTSTRAP.get(`${category}|${entry.label}`);
  if (boot?.image_url?.trim() && isAllowedQuizImageUrl(boot.image_url)) {
    const wrong_answers = decoysFor(boot.correct_answer);
    const payload = {
      name: boot.name,
      category: boot.category,
      image_url: boot.image_url,
      description: boot.description,
      correct_answer: boot.correct_answer,
      wrong_answers,
      poster_url: boot.poster_url ?? undefined,
      hint: boot.hint ?? undefined,
    };
    if (opts?.deferCache) {
      void saveCachedQuiz(payload).catch(() => undefined);
      return buildQuestion({
        id: `boot-${boot.name.toLowerCase().replace(/\s+/g, "-")}`,
        ...payload,
      });
    }
    const saved = await saveCachedQuiz(payload);
    return buildQuestion({ ...saved, wrong_answers });
  }

  // 1. Supabase cache (skipped on fast defer — avoids per-question DB round-trips).
  if (!opts?.deferCache) {
    let cached = await getCachedQuiz(entry.label, category);
    if (cached) {
      // Upgrade movie entries cached before the backdrop/poster/hint split.
      if (category === "Movie") {
        const needsBackdrop =
          !cached.image_url.includes("image.tmdb.org") ||
          isTmdbPosterImageUrl(cached.image_url);
        const needsPoster = !cached.poster_url;
        const needsHint = !cached.hint;
        if (needsBackdrop || needsPoster || needsHint) {
          const m = await fetchMovieData(entry.label);
          let image_url = m.backdrop_url ?? cached.image_url;
          if (isTmdbPosterImageUrl(image_url)) {
            let summary = await fetchWikipediaSummary(entry.query);
            if (!summary)
              summary = await fetchWikipediaSummary(`${entry.label} (film)`);
            if (summary?.image_url && !isTmdbPosterImageUrl(summary.image_url)) {
              image_url = summary.image_url;
            } else if (needsBackdrop) {
              image_url = cached.image_url;
            }
          }
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
      return buildQuestion({
        ...cached,
        wrong_answers: decoysFor(cached.correct_answer),
      });
    }
  }

  let image_url: string | null = null;
  let description = "";
  let poster_url: string | undefined;
  let hint: string | undefined;

  if (category === "Movie") {
    const m = await fetchMovieData(entry.label);
    let summary: Awaited<ReturnType<typeof fetchWikipediaSummary>> = null;
    image_url = m.backdrop_url;
    if (!image_url || isTmdbPosterImageUrl(image_url)) {
      summary = await fetchWikipediaSummary(entry.query);
      if (!summary) summary = await fetchWikipediaSummary(`${entry.label} (film)`);
      if (summary?.image_url && !isTmdbPosterImageUrl(summary.image_url)) {
        image_url = summary.image_url;
      }
    }
    if (!image_url || isTmdbPosterImageUrl(image_url)) return null;
    poster_url = m.poster_url ?? undefined;
    hint = m.hint ?? undefined;
    if (!summary) {
      summary = await fetchWikipediaSummary(entry.query);
      if (!summary) summary = await fetchWikipediaSummary(`${entry.label} (film)`);
    }
    description = summary?.description ?? hint ?? "";
  } else {
    const summary = await fetchWikipediaSummary(entry.query);
    if (!summary) return null;
    image_url = summary.image_url;
    description = summary.description;
  }

  if (!image_url?.trim() || !isAllowedQuizImageUrl(image_url)) return null;

  const wrong_answers = decoysFor(entry.label);

  const payload = {
    name: entry.label,
    category,
    image_url,
    description,
    correct_answer: entry.label,
    wrong_answers,
    poster_url,
    hint,
  };

  if (opts?.deferCache) {
    void saveCachedQuiz(payload).catch(() => undefined);
    return buildQuestion({
      id: `fast-${entry.label.toLowerCase().replace(/\s+/g, "-")}`,
      ...payload,
    });
  }

  const saved = await saveCachedQuiz(payload);

  return buildQuestion(saved);
}

export async function generateImageQuizBatch(
  category: string,
  count = 10,
  difficulty: Difficulty = "Medium",
  exclude?: ExcludeSet,
  options?: { cacheOnly?: boolean; fastStart?: boolean },
): Promise<GeneratedQuestion[]> {
  if (!isImageCategory(category)) return [];

  const blocked = toExcludeSet(exclude);
  const results: GeneratedQuestion[] = [];
  const usedAnswer = new Set<string>(blocked.answers);
  const usedImage = new Set<string>(blocked.images);

  const distractorPool = new Set<string>();
  for (const e of POOLS[category].entries) distractorPool.add(e.label);
  const pool = getCandidatePool(`${category}|${difficulty}`);
  for (const c of pool ?? []) {
    distractorPool.add(c.name);
    for (const d of c.decoys) distractorPool.add(d);
  }
  const distractors = [...distractorPool];

  if (options?.fastStart === true) {
    return generateFastBatch(category, count, difficulty, exclude, distractors);
  }

  // Serve from Supabase cache when available.
  const cachedRows = shuffle(await getCachedByCategory(category));
  for (const row of cachedRows) {
    if (results.length >= count) break;
    if (!row.image_url?.trim() || !isAllowedQuizImageUrl(row.image_url)) continue;
    if (category === "Athlete" && isMajorTeamSportAthlete(row.correct_answer))
      continue;
    const answerKey = row.correct_answer.toLowerCase();
    if (usedAnswer.has(answerKey) || usedImage.has(row.image_url)) continue;
    usedAnswer.add(answerKey);
    usedImage.add(row.image_url);
    const wrong =
      category === "Athlete"
        ? (row.wrong_answers.length >= 3
            ? row.wrong_answers
            : finalizeWrongAnswers(row.correct_answer, [], distractors)
          ).filter((w) => !isMajorTeamSportAthlete(w))
        : row.wrong_answers.length >= 3
          ? row.wrong_answers
          : finalizeWrongAnswers(row.correct_answer, [], distractors);
    const safeWrong =
      category === "Athlete"
        ? finalizeWrongAnswers(
            row.correct_answer,
            wrong,
            distractors.filter((d) => !isMajorTeamSportAthlete(d)),
          )
        : wrong.length >= 3
          ? wrong.slice(0, 3)
          : finalizeWrongAnswers(row.correct_answer, wrong, distractors);
    results.push(
      buildQuestion({
        id: row.id,
        category: row.category,
        image_url: row.image_url,
        description: row.description,
        correct_answer: row.correct_answer,
        wrong_answers: safeWrong,
        poster_url: row.poster_url,
        hint: row.hint,
      }),
    );
  }

  if (results.length >= count) return results.slice(0, count);

  if (options?.cacheOnly) return results;

  const concurrency = 8;

  const { entries, distractors: liveDistractors } = await workingEntries(
    category,
    count,
    difficulty,
    exclude,
  );

  const pending = entries.filter(
    (e) => !usedAnswer.has(e.label.toLowerCase()),
  );
  for (let i = 0; i < pending.length && results.length < count; i += concurrency) {
    const slice = pending.slice(i, i + concurrency);
    const qs = await Promise.all(
      slice.map((e) =>
        generateForEntry(category, e, liveDistractors).catch(() => null),
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

  if (results.length >= count) return results.slice(0, count);

  // Slow path — refresh AI pool and retry.
  const fresh = await aiCandidates(category, 36, difficulty);
  if (fresh && fresh.length > 0) {
    saveCandidatePool(`${category}|${difficulty}`, fresh);
  }
  const retry = await workingEntries(category, count, difficulty, {
    answers: [...usedAnswer],
    images: [...usedImage],
  });
  for (const e of retry.entries) {
    if (results.length >= count) break;
    if (usedAnswer.has(e.label.toLowerCase())) continue;
    const q = await generateForEntry(category, e, retry.distractors).catch(
      () => null,
    );
    if (!q) continue;
    const answerKey = q.correct_answer.toLowerCase();
    if (usedAnswer.has(answerKey) || usedImage.has(q.image_url)) continue;
    usedAnswer.add(answerKey);
    usedImage.add(q.image_url);
    results.push(q);
  }

  return results.slice(0, count);
}

export async function generateImageQuiz(
  category: string,
  difficulty: Difficulty = "Medium",
  exclude?: ExcludeSet,
): Promise<GeneratedQuestion | null> {
  const [q] = await generateImageQuizBatch(category, 1, difficulty, exclude);
  return q ?? null;
}
