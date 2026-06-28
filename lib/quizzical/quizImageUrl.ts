/** Smaller/faster image URLs for in-quiz display (Wikipedia + TMDB). */

const WIKI_MAX_PX = 480;
const TMDB_QUIZ_BACKDROP = "w780";
const TMDB_QUIZ_POSTER = "w342";
const TMDB_REVEAL_POSTER = "w500";

const ALLOWED_IMAGE_HOSTS = [
  "upload.wikimedia.org",
  "image.tmdb.org",
  "flagcdn.com",
];

export function normalizeImageUrl(url: string): string {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return "";
  return trimmed.replace(/^http:\/\//i, "https://");
}

export function isAllowedQuizImageUrl(url: string): boolean {
  const normalized = normalizeImageUrl(url);
  if (!normalized.startsWith("https://")) return false;
  try {
    const host = new URL(normalized).hostname;
    return ALLOWED_IMAGE_HOSTS.some(
      (h) => host === h || host.endsWith(`.${h}`),
    );
  } catch {
    return false;
  }
}

/** Downscale Wikipedia thumbs only — never rewrite to a larger size (avoids 404s). */
export function optimizeQuizImageUrl(url: string): string {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return "";

  if (normalized.includes("upload.wikimedia.org") && normalized.includes("/thumb/")) {
    return normalized.replace(/\/(\d+)px-/g, (_match, px: string) => {
      const current = parseInt(px, 10);
      const target = Number.isFinite(current)
        ? Math.min(current, WIKI_MAX_PX)
        : WIKI_MAX_PX;
      return `/${target}px-`;
    });
  }

  if (normalized.includes("image.tmdb.org")) {
    return normalized
      .replace("/w1280/", `/${TMDB_QUIZ_BACKDROP}/`)
      .replace("/w500/", `/${TMDB_QUIZ_POSTER}/`);
  }

  return normalized;
}

/** Same-origin proxy — reliable on production when hotlink/referrer rules block direct loads. */
export function proxiedQuizImageUrl(url: string): string {
  const optimized = optimizeQuizImageUrl(url);
  if (!optimized || !isAllowedQuizImageUrl(optimized)) return optimized;
  return `/api/img?u=${encodeURIComponent(optimized)}`;
}

/** HD poster URL for movie reveal (portrait, not downscaled like quiz thumbnails). */
export function proxiedRevealPosterUrl(url: string): string {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return "";
  let target = normalized;
  if (normalized.includes("image.tmdb.org")) {
    target = normalized.replace(/\/w\d+\//, `/${TMDB_REVEAL_POSTER}/`);
  }
  if (!isAllowedQuizImageUrl(target)) return target;
  return `/api/img?u=${encodeURIComponent(target)}`;
}

/** URLs to preload for one question (backdrop + optional poster). */
export function questionPrefetchUrls(
  imageUrl: string,
  revealUrl?: string,
  revealIsPoster = false,
): string[] {
  const urls: string[] = [];
  const main = proxiedQuizImageUrl(imageUrl);
  if (main) urls.push(main);
  if (revealUrl) {
    const reveal = revealIsPoster
      ? proxiedRevealPosterUrl(revealUrl)
      : proxiedQuizImageUrl(revealUrl);
    if (reveal) urls.push(reveal);
  }
  return urls;
}

/** Browser-side preload — pass already-proxied URLs or raw URLs. */
export function prefetchImages(urls: string[]): Promise<void> {
  const unique = [
    ...new Set(
      urls
        .map((u) => {
          const t = u.trim();
          if (!t) return "";
          if (t.startsWith("/api/img")) return t;
          return proxiedQuizImageUrl(t);
        })
        .filter((u) => u.length > 0),
    ),
  ];
  if (unique.length === 0) return Promise.resolve();

  return Promise.all(
    unique.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.referrerPolicy = "no-referrer";
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  ).then(() => undefined);
}

/** Preload the next few questions while the player is on the current one. */
export function prefetchUpcoming(
  questions: { image_url: string; reveal_image_url?: string }[],
  fromIndex: number,
  count = 3,
  revealIsPoster = false,
): void {
  const slice = questions.slice(fromIndex, fromIndex + count);
  const urls = slice.flatMap((q) =>
    questionPrefetchUrls(q.image_url, q.reveal_image_url, revealIsPoster),
  );
  void prefetchImages(urls);
}

export function quizImageFallbacks(
  url: string,
  opts?: { posterReveal?: boolean },
): string[] {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return [];

  if (trimmed.startsWith("/api/img")) {
    return [trimmed];
  }

  const normalized = normalizeImageUrl(trimmed);
  if (!normalized) return [];

  if (opts?.posterReveal && normalized.includes("image.tmdb.org")) {
    const hd = proxiedRevealPosterUrl(normalized);
    return hd ? [hd] : [];
  }

  const optimized = optimizeQuizImageUrl(normalized);
  return [
    ...new Set(
      [
        proxiedQuizImageUrl(normalized),
        normalized !== optimized ? proxiedQuizImageUrl(optimized) : "",
        normalized,
        optimized !== normalized ? optimized : "",
      ].filter(Boolean),
    ),
  ];
}
