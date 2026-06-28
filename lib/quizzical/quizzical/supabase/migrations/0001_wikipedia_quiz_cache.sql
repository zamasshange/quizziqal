-- Cache of auto-generated image quiz questions (Wikipedia image + AI wrong answers).
-- Run this in the Supabase SQL editor (or via the Supabase CLI) once you have a project.

create table if not exists public.wikipedia_quiz_cache (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Celebrity', 'Athlete', 'Movie', 'Music')),
  image_url text not null,
  description text default '',
  correct_answer text not null,
  wrong_answers jsonb not null,
  poster_url text,
  hint text,
  created_at timestamptz not null default now()
);

-- One cached entry per name + category; lets the pipeline upsert/lookup quickly.
create unique index if not exists wikipedia_quiz_cache_name_category_idx
  on public.wikipedia_quiz_cache (name, category);

-- Enable RLS. The pipeline uses the service-role key (bypasses RLS) on the server.
alter table public.wikipedia_quiz_cache enable row level security;

-- Allow anonymous read so questions can be served to players if desired.
drop policy if exists "Public read wikipedia_quiz_cache" on public.wikipedia_quiz_cache;
create policy "Public read wikipedia_quiz_cache"
  on public.wikipedia_quiz_cache
  for select
  using (true);
