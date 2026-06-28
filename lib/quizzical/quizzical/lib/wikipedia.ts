// Wikipedia REST API — used ONLY to fetch real images (+ title/description).
// Docs: https://en.wikipedia.org/api/rest_v1/

export type WikipediaSummary = {
  title: string;
  image_url: string;
  description: string;
};

export type WikipediaFact = {
  title: string;
  /** Short one-liner, e.g. "Argentine footballer". */
  description: string;
  extract: string;
  image_url: string | null;
  url: string;
};

const SUMMARY_ENDPOINT =
  "https://en.wikipedia.org/api/rest_v1/page/summary/";

const UA =
  "Quizzical/1.0 (quiz game; contact: dev@quizzical.app)";

const WIKI_API = "https://en.wikipedia.org/w/api.php";

const FETCH_OPTS = {
  headers: { accept: "application/json", "Api-User-Agent": UA },
  next: { revalidate: 60 * 60 * 24 },
} as const;

/** Alternate Wikipedia titles to try when a quiz imageQuery misses. */
export function buildImageQueryVariants(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const variants = new Set<string>([trimmed]);

  const flagOfThe = trimmed.match(/^Flag of the (.+)$/i);
  if (flagOfThe) {
    variants.add(`Flag of ${flagOfThe[1]}`);
  }

  const flagOfNoThe = trimmed.match(/^Flag of (?!the\b)(.+)$/i);
  if (flagOfNoThe) {
    variants.add(`Flag of the ${flagOfNoThe[1]}`);
  }

  if (!/^Flag of/i.test(trimmed)) {
    variants.add(`Flag of ${trimmed}`);
    variants.add(`Flag of the ${trimmed}`);
  }

  return [...variants];
}

async function searchWikipediaTitle(query: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: "opensearch",
      search: query,
      limit: "5",
      namespace: "0",
      format: "json",
    });
    const res = await fetch(`${WIKI_API}?${params}`, FETCH_OPTS);
    if (!res.ok) return null;

    const data = (await res.json()) as [string, string[]];
    const titles = data[1] ?? [];
    const lower = query.toLowerCase();

    return (
      titles.find((title) => title.toLowerCase().includes("flag")) ??
      titles.find((title) => title.toLowerCase().includes(lower)) ??
      titles[0] ??
      null
    );
  } catch {
    return null;
  }
}

async function fetchPageImage(title: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: "query",
      titles: title.replace(/ /g, "_"),
      prop: "pageimages",
      piprop: "thumbnail|original",
      pithumbsize: "640",
      format: "json",
    });
    const res = await fetch(`${WIKI_API}?${params}`, FETCH_OPTS);
    if (!res.ok) return null;

    const data = (await res.json()) as {
      query?: {
        pages?: Record<
          string,
          {
            thumbnail?: { source?: string };
            original?: { source?: string };
          }
        >;
      };
    };

    for (const page of Object.values(data.query?.pages ?? {})) {
      const image =
        page.thumbnail?.source ?? page.original?.source ?? null;
      if (image) return image;
    }

    return null;
  } catch {
    return null;
  }
}

// Like fetchWikipediaSummary but tuned for the "Did you know?" reveal card:
// returns the blurb even when there's no image, plus a link to the article.
export async function fetchWikipediaFact(
  query: string,
): Promise<WikipediaFact | null> {
  const term = query.trim();
  if (!term) return null;
  try {
    const url = `${SUMMARY_ENDPOINT}${encodeURIComponent(term.replace(/ /g, "_"))}`;
    const res = await fetch(url, {
      headers: { accept: "application/json", "Api-User-Agent": UA },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      title?: string;
      description?: string;
      extract?: string;
      thumbnail?: { source?: string };
      originalimage?: { source?: string };
      type?: string;
      content_urls?: { desktop?: { page?: string } };
    };

    if (data.type === "disambiguation") return null;
    const extract = (data.extract ?? "").trim();
    if (extract.length < 20) return null;

    return {
      title: data.title ?? term,
      description: (data.description ?? "").trim(),
      extract,
      image_url: data.thumbnail?.source ?? data.originalimage?.source ?? null,
      url:
        data.content_urls?.desktop?.page ??
        `https://en.wikipedia.org/wiki/${encodeURIComponent(term.replace(/ /g, "_"))}`,
    };
  } catch {
    return null;
  }
}

export async function fetchWikipediaSummary(
  query: string,
): Promise<WikipediaSummary | null> {
  try {
    const url = `${SUMMARY_ENDPOINT}${encodeURIComponent(query.replace(/ /g, "_"))}`;
    const res = await fetch(url, FETCH_OPTS);

    if (!res.ok) return null;

    const data = (await res.json()) as {
      title?: string;
      extract?: string;
      thumbnail?: { source?: string };
      originalimage?: { source?: string };
      type?: string;
    };

    const image_url =
      data.thumbnail?.source ?? data.originalimage?.source ?? null;

    // Skip disambiguation pages or anything without a usable image.
    if (!image_url || data.type === "disambiguation") return null;

    return {
      title: data.title ?? query,
      image_url,
      description: data.extract ?? "",
    };
  } catch {
    return null;
  }
}

/** Tries query variants, Wikipedia search, and pageimages before giving up. */
export async function fetchWikipediaSummaryWithFallback(
  query: string,
): Promise<WikipediaSummary | null> {
  const variants = buildImageQueryVariants(query);
  const tried = new Set<string>();

  for (const variant of variants) {
    tried.add(variant.toLowerCase());
    const summary = await fetchWikipediaSummary(variant);
    if (summary) return summary;
  }

  const searched = await searchWikipediaTitle(query);
  if (searched && !tried.has(searched.toLowerCase())) {
    const summary = await fetchWikipediaSummary(searched);
    if (summary) return summary;
  }

  for (const variant of variants) {
    const imageUrl = await fetchPageImage(variant);
    if (imageUrl) {
      return {
        title: variant,
        image_url: imageUrl,
        description: "",
      };
    }
  }

  if (searched) {
    const imageUrl = await fetchPageImage(searched);
    if (imageUrl) {
      return {
        title: searched,
        image_url: imageUrl,
        description: "",
      };
    }
  }

  return null;
}
