import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Optional Supabase admin client for server-side data caching only.
// Authentication is handled by Clerk — this client never manages user sessions.
//
// Returns null when env vars are missing, so the rest of the app can gracefully
// fall back to file/memory caches until credentials are provided in .env.local:
//
//   NEXT_PUBLIC_SUPABASE_URL=...
//   SUPABASE_SERVICE_ROLE_KEY=...   (server-only; never expose to the browser)

let cached: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY;

  cached =
    url && key
      ? createClient(url, key, { auth: { persistSession: false } })
      : null;

  return cached;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseAdmin() !== null;
}
