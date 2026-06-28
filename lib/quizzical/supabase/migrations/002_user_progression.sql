-- Knowledge Explorer progression system
-- Run after 001_quiz_scores.sql

create table if not exists public.user_progress (
  user_id           text primary key,
  username          text not null default 'Player',
  avatar_id         text,
  xp                integer not null default 0,
  coins             integer not null default 0,
  current_streak    integer not null default 0,
  longest_streak    integer not null default 0,
  last_play_date    date,
  country_code      text not null default 'US',
  mastery           jsonb not null default '{}',
  unlocked_achievements text[] not null default '{}',
  unlocked_badges   text[] not null default '{}',
  missions          jsonb not null default '[]',
  mission_date      date,
  stats             jsonb not null default '{"totalCorrect":0,"totalAnswered":0,"quizzesCompleted":0,"perfectQuizzes":0}',
  first_quiz_today  boolean not null default false,
  updated_at        timestamptz not null default now()
);

create index if not exists user_progress_xp_idx on public.user_progress (xp desc);
create index if not exists user_progress_country_xp_idx on public.user_progress (country_code, xp desc);

create table if not exists public.user_discoveries (
  id              bigserial primary key,
  user_id         text not null references public.user_progress(user_id) on delete cascade,
  term            text not null,
  category        text not null default 'general',
  discovery_type  text not null default 'general',
  quiz_id         text,
  discovered_at   timestamptz not null default now(),
  unique (user_id, term)
);

create index if not exists user_discoveries_user_idx on public.user_discoveries (user_id, discovered_at desc);
create index if not exists user_discoveries_type_idx on public.user_discoveries (user_id, discovery_type);

create table if not exists public.user_xp_events (
  id          bigserial primary key,
  user_id     text not null,
  xp_amount   integer not null,
  event_type  text not null,
  category    text,
  created_at  timestamptz not null default now()
);

create index if not exists user_xp_events_user_time_idx on public.user_xp_events (user_id, created_at desc);
create index if not exists user_xp_events_time_xp_idx on public.user_xp_events (created_at desc, xp_amount desc);

-- Reveal cache TTL support
alter table public.reveal_cache
  add column if not exists expires_at timestamptz;

update public.reveal_cache
set expires_at = created_at + interval '30 days'
where expires_at is null;

alter table public.reveal_cache enable row level security;

alter table public.user_progress enable row level security;
alter table public.user_discoveries enable row level security;
alter table public.user_xp_events enable row level security;
