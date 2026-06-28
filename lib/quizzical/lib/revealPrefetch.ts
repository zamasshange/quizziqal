import type { RevealData } from "@/lib/reveal/types";

const clientCache = new Map<string, RevealData | null>();
const inflight = new Map<string, Promise<RevealData | null>>();

/** Prefetch reveal data for the next question — shared with RevealCard. */
export function prefetchReveal(category: string, term: string): void {
  const key = `${category}|${term}`;
  if (clientCache.has(key) || inflight.has(key)) return;

  const p = fetch(
    `/api/reveal?${new URLSearchParams({ term, category }).toString()}`,
  )
    .then((r) => r.json())
    .then((d) => {
      const rd = (d?.data as RevealData) ?? null;
      clientCache.set(key, rd);
      inflight.delete(key);
      return rd;
    })
    .catch(() => {
      clientCache.set(key, null);
      inflight.delete(key);
      return null;
    });

  inflight.set(key, p);
}

export function getCachedRevealClient(key: string): RevealData | null | undefined {
  if (clientCache.has(key)) return clientCache.get(key);
  return undefined;
}

export function setCachedRevealClient(key: string, data: RevealData | null): void {
  clientCache.set(key, data);
}

export { clientCache as revealClientCache };
