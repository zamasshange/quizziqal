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
  aspect_ratio?: number;
  width?: number;
  height?: number;
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

const REVALIDATE = { next: { revalidate: 60 * 60 * 24 * 7 } } as const;

/** TMDB posters are served at w500; question backdrops use w1280. */
export function isTmdbPosterImageUrl(url: string): boolean {
  return url.includes("image.tmdb.org") && /\/w500\//.test(url);
}

async function searchMovie(
  title: string,
  token: string,
): Promise<SearchResult | null> {
  const url = `${SEARCH_ENDPOINT}?query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1`;
  const res = await fetch(url, {
    headers: authHeaders(token),
    ...REVALIDATE,
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { results?: SearchResult[] };
  return (
    data.results?.find((r) => r.backdrop_path || r.poster_path) ??
    data.results?.[0] ??
    null
  );
}

async function fetchTextlessBackdrops(
  movieId: number,
  token: string,
): Promise<ImageItem[]> {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/images?include_image_language=null`,
    { headers: authHeaders(token), ...REVALIDATE },
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { backdrops?: ImageItem[] };
  return data.backdrops ?? [];
}

function isLandscapeImage(item: ImageItem): boolean {
  if (item.aspect_ratio != null) return item.aspect_ratio >= 1.2;
  if (item.width != null && item.height != null) return item.width > item.height;
  return true;
}

// Picks a textless landscape backdrop — never falls back to titled images.
function pickTextlessBackdrop(backdrops: ImageItem[]): string | null {
  if (backdrops.length === 0) return null;

  const candidates = backdrops
    .filter((b) => b.iso_639_1 === null && isLandscapeImage(b))
    .sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));

  return candidates[0]?.file_path ?? null;
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
  teaser = teaser.split(/(?<=[.!?])\s/)[0] ?? teaser;
  if (teaser.length > 160) teaser = teaser.slice(0, 157).trimEnd() + "…";

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

    const [detailsRes, textlessBackdrops] = await Promise.all([
      fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}?append_to_response=images&language=en-US`,
        { headers: authHeaders(token), ...REVALIDATE },
      ),
      fetchTextlessBackdrops(movie.id, token),
    ]);

    let backdropPath: string | null = pickTextlessBackdrop(textlessBackdrops);
    let posterPath: string | null = movie.poster_path ?? null;
    let hint: string | null = null;

    if (detailsRes.ok) {
      const details = (await detailsRes.json()) as MovieDetails;

      if (!backdropPath) {
        backdropPath = pickTextlessBackdrop(details.images?.backdrops ?? []);
      }

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
      { headers: authHeaders(token), ...REVALIDATE },
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
