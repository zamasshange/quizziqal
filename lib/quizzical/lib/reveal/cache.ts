import { getSupabaseAdmin } from "../supabase";
import type { RevealData } from "./types";
import type { RevealProvider } from "./types";

const TABLE = "reveal_cache";

const memory = new Map<string, { data: RevealData | null; expiresAt: number }>();

/** Cache TTL in milliseconds by provider. */
const TTL_MS: Record<RevealProvider, number> = {
  wikipedia: 30 * 24 * 60 * 60 * 1000,
  thesportsdb: 7 * 24 * 60 * 60 * 1000,
  tmdb: 14 * 24 * 60 * 60 * 1000,
};

function ttlForProvider(provider: RevealProvider): number {
  return TTL_MS[provider] ?? TTL_MS.wikipedia;
}

function isExpired(expiresAt?: number | null): boolean {
  if (!expiresAt) return false;
  return Date.now() > expiresAt;
}

export async function getCachedReveal(
  key: string,
): Promise<RevealData | null | undefined> {
  const mem = memory.get(key);
  if (mem && !isExpired(mem.expiresAt)) return mem.data;
  if (mem && isExpired(mem.expiresAt)) memory.delete(key);

  const sb = getSupabaseAdmin();
  if (!sb) return undefined;
  try {
    const { data, error } = await sb
      .from(TABLE)
      .select("data, expires_at, provider")
      .eq("key", key)
      .maybeSingle();
    if (error || !data) return undefined;

    const expiresAt = data.expires_at
      ? new Date(data.expires_at as string).getTime()
      : null;
    if (isExpired(expiresAt)) return undefined;

    const reveal = data.data as RevealData;
    memory.set(key, {
      data: reveal,
      expiresAt: expiresAt ?? Date.now() + ttlForProvider(reveal.provider),
    });
    return reveal;
  } catch {
    return undefined;
  }
}

export async function setCachedReveal(
  key: string,
  reveal: RevealData | null,
): Promise<void> {
  if (!reveal) {
    memory.set(key, { data: null, expiresAt: Date.now() + 60_000 });
    return;
  }

  const expiresAt = Date.now() + ttlForProvider(reveal.provider);
  memory.set(key, { data: reveal, expiresAt });

  const sb = getSupabaseAdmin();
  if (!sb) return;
  try {
    await sb.from(TABLE).upsert(
      {
        key,
        provider: reveal.provider,
        kind: reveal.kind,
        data: reveal,
        expires_at: new Date(expiresAt).toISOString(),
      },
      { onConflict: "key" },
    );
  } catch {
    /* memory cache still valid */
  }
}
