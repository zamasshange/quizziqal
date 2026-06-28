// TMDB (The Movie Database) — powers "Guess the Movie".
//
// The QUESTION shows a textless still/backdrop (a scene with no title on it, so
// it's an actual guess), the REVEAL shows the official poster, and a spoiler-free
// HINT (genre · year · short teaser) can be offered while guessing.
// Requires a v4 read access token in TMDB_READ_TOKEN.

const SEARCH_ENDPOINT = "https://api.themoviedb.org/3/search/movie";
const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

export type MovieData = {
  /** Poster (has title art) — shown on the reveal. */
  poster_url: string | null;
  /** Textless scene/backdrop — shown as the question (no spoilers). */
  backdrop_url: string | null;
  /** Spoiler-free hint shown on demand while guessing. */
  hint: string | null;
};

type SearchResult = {
  id: number;
  poster_path?: string | null;
  backdrop_path?: string | null;
};

type ImageItem = {
  file_path: string;
  iso_639_1: string | null;
  vote_count?: number;
};

type MovieDetails = {
  title?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  tagline?: string;
  overview?: string;
  genres?: { name: string }[];
  images?: { backdrops?: ImageItem[]; posters?: ImageItem[] };
};

function authHeaders(token: string) {
  return { accept: "application/json", Authorization: `Bearer ${token}` };
}

async function searchMovie(
  title: string,
  token: string,
): Promise<SearchResult | null> {
  const url = `${SEARCH_ENDPOINT}?query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1`;
  const res = await fetch(url, {
    headers: authHeaders(token),
    next: { revalidate: 60 * 60 * 24 * 7 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { results?: SearchResult[] };
  return (
    data.results?.find((r) => r.backdrop_path || r.poster_path) ??
    data.results?.[0] ??
    null
  );
}

// Picks a backdrop with NO language tag (textless = no title/logo overlay),
// falling back to the most-voted backdrop available.
function pickTextlessBackdrop(backdrops: ImageItem[]): string | null {
  if (backdrops.length === 0) return null;
  const sorted = [...backdrops].sort(
    (a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0),
  );
  const textless = sorted.find((b) => b.iso_639_1 === null);
  return (textless ?? sorted[0]).file_path;
}

// Builds a short, spoiler-free hint and strips the title out just in case.
function buildHint(details: MovieDetails): string | null {
  const parts: string[] = [];
  const genres = (details.genres ?? [])
    .map((g) => g.name)
    .slice(0, 2)
    .join(" / ");
  const year = details.release_date?.slice(0, 4);
  if (genres) parts.push(genres);
  if (year) parts.push(year);

  let teaser = (details.tagline || details.overview || "").trim();
  // Keep it to one sentence and a sane length.
  teaser = teaser.split(/(?<=[.!?])\s/)[0] ?? teaser;
  if (teaser.length > 160) teaser = teaser.slice(0, 157).trimEnd() + "…";

  // Redact the title so the hint never gives away the answer.
  const title = (details.title ?? "").trim();
  if (title) {
    const safe = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    teaser = teaser.replace(new RegExp(safe, "gi"), "this film");
  }

  const head = parts.join(" · ");
  const hint = [head, teaser].filter(Boolean).join(" — ");
  return hint.length >= 4 ? hint : null;
}

export async function fetchMovieData(title: string): Promise<MovieData> {
  const token = process.env.TMDB_READ_TOKEN;
  const empty: MovieData = { poster_url: null, backdrop_url: null, hint: null };
  if (!token) return empty;

  try {
    const movie = await searchMovie(title, token);
    if (!movie) return empty;

    // One call gets details + the full image set.
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movie.id}?append_to_response=images&language=en-US`,
      { headers: authHeaders(token), next: { revalidate: 60 * 60 * 24 * 7 } },
    );

    let backdropPath: string | null = movie.backdrop_path ?? null;
    let posterPath: string | null = movie.poster_path ?? null;
    let hint: string | null = null;

    if (res.ok) {
      const details = (await res.json()) as MovieDetails;
      const textless = pickTextlessBackdrop(details.images?.backdrops ?? []);
      if (textless) backdropPath = textless;
      else if (details.backdrop_path) backdropPath = details.backdrop_path;
      if (!posterPath) {
        posterPath =
          details.images?.posters?.[0]?.file_path ??
          details.poster_path ??
          null;
      }
      hint = buildHint(details);
    }

    return {
      poster_url: posterPath ? `${POSTER_BASE}${posterPath}` : null,
      backdrop_url: backdropPath ? `${BACKDROP_BASE}${backdropPath}` : null,
      hint,
    };
  } catch {
    return empty;
  }
}

export type MovieFacts = {
  poster_url: string | null;
  year: string | null;
  genres: string[];
  rating: number | null;
  overview: string | null;
};

// Unified MovieReveal shape for the provider-based reveal engine.
export async function fetchMovieReveal(
  title: string,
): Promise<import("./reveal/types").MovieReveal | null> {
  const facts = await fetchMovieFacts(title);
  if (!facts) return null;
  // Require at least an overview or poster to be worth showing.
  if (!facts.overview && !facts.poster_url) return null;
  return {
    kind: "movie",
    provider: "tmdb",
    title,
    poster_url: facts.poster_url,
    year: facts.year,
    genres: facts.genres,
    rating: facts.rating,
    overview: facts.overview,
  };
}

// Richer structured facts for the movie reveal card.
export async function fetchMovieFacts(title: string): Promise<MovieFacts | null> {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) return null;
  try {
    const movie = await searchMovie(title, token);
    if (!movie) return null;
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movie.id}?language=en-US`,
      { headers: authHeaders(token), next: { revalidate: 60 * 60 * 24 * 7 } },
    );
    if (!res.ok) return null;
    const d = (await res.json()) as MovieDetails & { vote_average?: number };
    return {
      poster_url: d.poster_path ? `${POSTER_BASE}${d.poster_path}` : null,
      year: d.release_date?.slice(0, 4) || null,
      genres: (d.genres ?? []).map((g) => g.name).slice(0, 3),
      rating:
        typeof d.vote_average === "number" && d.vote_average > 0
          ? d.vote_average
          : null,
      overview: d.overview?.trim() || null,
    };
  } catch {
    return null;
  }
}
