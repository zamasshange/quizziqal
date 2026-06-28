-- =============================================================================
-- Quizzical leaderboard setup — run once in Supabase SQL Editor
-- Project: https://zduvwsvlsarswoupbrdt.supabase.co
--
-- The app uses table: user_progress (NOT "quizzical")
-- After running, test: /rest/v1/user_progress?select=username,xp&order=xp.desc&limit=5
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Core progression table (profiles + XP live here)
-- ---------------------------------------------------------------------------
create table if not exists public.user_progress (
  user_id               text primary key,
  username              text not null default 'Player',
  avatar_id             text,
  xp                    integer not null default 0,
  coins                 integer not null default 0,
  level                 integer not null default 1,
  weekly_xp             integer not null default 0,
  week_started_at       date,
  current_streak        integer not null default 0,
  longest_streak        integer not null default 0,
  last_play_date        date,
  country_code          text not null default 'ZA',
  mastery               jsonb not null default '{}',
  unlocked_achievements text[] not null default '{}',
  unlocked_badges       text[] not null default '{}',
  missions              jsonb not null default '[]',
  mission_date          date,
  stats                 jsonb not null default '{"totalCorrect":0,"totalAnswered":0,"quizzesCompleted":0,"perfectQuizzes":0}',
  first_quiz_today      boolean not null default false,
  achievements_count    integer not null default 0,
  discoveries_count     integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Add columns if table already existed from an older migration
alter table public.user_progress
  add column if not exists level integer not null default 1,
  add column if not exists weekly_xp integer not null default 0,
  add column if not exists week_started_at date,
  add column if not exists achievements_count integer not null default 0,
  add column if not exists discoveries_count integer not null default 0,
  add column if not exists created_at timestamptz not null default now();

alter table public.user_progress
  alter column country_code set default 'ZA';

create index if not exists user_progress_xp_idx
  on public.user_progress (xp desc);

create index if not exists user_progress_country_xp_idx
  on public.user_progress (country_code, xp desc);

create index if not exists user_progress_weekly_xp_idx
  on public.user_progress (weekly_xp desc);

create unique index if not exists user_progress_username_lower_idx
  on public.user_progress (lower(username));

-- ---------------------------------------------------------------------------
-- 2. XP event log (weekly / monthly / category leaderboards)
-- ---------------------------------------------------------------------------
create table if not exists public.user_xp_events (
  id          bigserial primary key,
  user_id     text not null,
  xp_amount   integer not null,
  event_type  text not null,
  category    text,
  created_at  timestamptz not null default now()
);

create index if not exists user_xp_events_user_time_idx
  on public.user_xp_events (user_id, created_at desc);

create index if not exists user_xp_events_time_xp_idx
  on public.user_xp_events (created_at desc, xp_amount desc);

-- ---------------------------------------------------------------------------
-- 3. Discoveries
-- ---------------------------------------------------------------------------
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

create index if not exists user_discoveries_user_idx
  on public.user_discoveries (user_id, discovered_at desc);

-- ---------------------------------------------------------------------------
-- 4. Activity feed + content history
-- ---------------------------------------------------------------------------
create table if not exists public.activity_events (
  id            bigserial primary key,
  user_id       text not null,
  username      text not null default 'Player',
  avatar_id     text,
  country_code  text not null default 'ZA',
  event_kind    text not null,
  message       text not null,
  emoji         text,
  category      text,
  created_at    timestamptz not null default now()
);

create index if not exists activity_events_created_idx
  on public.activity_events (created_at desc);

create table if not exists public.user_content_history (
  id            bigserial primary key,
  user_id       text not null,
  content_id    text not null,
  content_type  text not null,
  category      text,
  played_at     timestamptz not null default now(),
  unique (user_id, content_id, content_type)
);

create index if not exists user_content_history_user_time_idx
  on public.user_content_history (user_id, played_at desc);

-- ---------------------------------------------------------------------------
-- 5. Profiles view (matches the schema your spec described)
-- ---------------------------------------------------------------------------
create or replace view public.profiles as
select
  user_id::text       as id,
  user_id::text       as clerk_user_id,
  username,
  avatar_id           as avatar_url,
  country_code        as country,
  xp,
  coins,
  level,
  current_streak      as streak,
  achievements_count,
  discoveries_count,
  created_at
from public.user_progress;

-- NOTE: Do NOT create a "quizzical" view if you already have a quizzical TABLE.
-- The app reads user_progress only. Drop the old table first if needed:
--   drop table if exists public.quizzical cascade;

-- ---------------------------------------------------------------------------
-- 6. Row Level Security — public READ for leaderboards + realtime
-- ---------------------------------------------------------------------------
alter table public.user_progress enable row level security;
alter table public.user_xp_events enable row level security;
alter table public.user_discoveries enable row level security;
alter table public.activity_events enable row level security;
alter table public.user_content_history enable row level security;

drop policy if exists "Public read user_progress for leaderboards" on public.user_progress;
create policy "Public read user_progress for leaderboards"
  on public.user_progress for select using (true);

drop policy if exists "Public read user_xp_events for leaderboards" on public.user_xp_events;
create policy "Public read user_xp_events for leaderboards"
  on public.user_xp_events for select using (true);

drop policy if exists "Public read activity_events" on public.activity_events;
create policy "Public read activity_events"
  on public.activity_events for select using (true);

-- Service role (your server) bypasses RLS for writes — no insert policy needed for anon

-- ---------------------------------------------------------------------------
-- 7. API grants (so REST + Realtime work with anon key)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.user_progress to anon, authenticated;
grant select on public.user_xp_events to anon, authenticated;
grant select on public.activity_events to anon, authenticated;
grant select on public.profiles to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 8. Realtime (live leaderboard updates without refresh)
-- ---------------------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.user_progress;
exception when duplicate_object then null; when undefined_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.user_xp_events;
exception when duplicate_object then null; when undefined_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.activity_events;
exception when duplicate_object then null; when undefined_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- 9. Backfill weekly_xp for any existing players
-- ---------------------------------------------------------------------------
update public.user_progress up
set
  weekly_xp = coalesce((
    select sum(e.xp_amount)
    from public.user_xp_events e
    where e.user_id = up.user_id
      and e.created_at >= date_trunc('week', now() at time zone 'utc')
  ), 0),
  week_started_at = date_trunc('week', now() at time zone 'utc')::date,
  achievements_count = coalesce(array_length(up.unlocked_achievements, 1), 0),
  discoveries_count = coalesce((
    select count(*)::integer from public.user_discoveries d where d.user_id = up.user_id
  ), 0)
where true;

-- Remove any test/demo rows (leaderboard is real Clerk users only)
delete from public.user_progress where user_id not like 'user_%';
delete from public.user_xp_events where user_id not like 'user_%';
