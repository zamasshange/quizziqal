-- Cache for the provider-based reveal engine (TheSportsDB / TMDB / Wikipedia).
-- Run once in the Supabase SQL editor. The server writes with the service-role
-- key, so RLS can stay enabled with no public policies.

create table if not exists public.reveal_cache (
  key         text primary key,
  provider    text not null,
  kind        text not null,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

create index if not exists reveal_cache_provider_idx
  on public.reveal_cache (provider);

alter table public.reveal_cache enable row level security;
