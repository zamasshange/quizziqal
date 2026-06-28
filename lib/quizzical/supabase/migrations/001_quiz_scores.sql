-- Run in Supabase SQL editor to enable global leaderboards.
create table if not exists public.quiz_scores (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  username text not null default 'Player',
  avatar_id text,
  game_key text not null,
  game_type text not null check (game_type in ('text', 'image')),
  quiz_id text not null,
  title text not null,
  score integer not null check (score >= 0),
  correct integer not null check (correct >= 0),
  total integer not null check (total > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_quiz_scores_game_score
  on public.quiz_scores (game_key, score desc);

create index if not exists idx_quiz_scores_global_score
  on public.quiz_scores (score desc);

create index if not exists idx_quiz_scores_user
  on public.quiz_scores (user_id, created_at desc);
