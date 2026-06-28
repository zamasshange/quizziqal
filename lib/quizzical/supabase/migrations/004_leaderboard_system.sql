-- Leaderboard system: profile fields, weekly XP, RLS for public reads, realtime

-- Extend user_progress with leaderboard/profile fields
alter table public.user_progress
  add column if not exists level integer not null default 1,
  add column if not exists weekly_xp integer not null default 0,
  add column if not exists week_started_at date,
  add column if not exists achievements_count integer not null default 0,
  add column if not exists discoveries_count integer not null default 0,
  add column if not exists created_at timestamptz not null default now();

alter table public.user_progress
  alter column country_code set default 'ZA';

create unique index if not exists user_progress_username_lower_idx
  on public.user_progress (lower(username));

create index if not exists user_progress_weekly_xp_idx
  on public.user_progress (weekly_xp desc);

-- Profiles view (maps user_progress to expected profile shape)
create or replace view public.profiles as
select
  user_id::text                    as id,
  user_id::text                    as clerk_user_id,
  username,
  avatar_id                        as avatar_url,
  country_code                     as country,
  xp,
  coins,
  level,
  current_streak                   as streak,
  achievements_count,
  discoveries_count,
  created_at
from public.user_progress;

-- Public read policies for leaderboards and realtime (anon + authenticated)
create policy "Public read user_progress for leaderboards"
  on public.user_progress
  for select
  using (true);

create policy "Public read user_xp_events for leaderboards"
  on public.user_xp_events
  for select
  using (true);

create policy "Public read activity_events"
  on public.activity_events
  for select
  using (true);

-- Realtime for XP event stream (weekly/category boards)
do $$
begin
  alter publication supabase_realtime add table public.user_xp_events;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- Backfill weekly_xp from current week's events for existing players
update public.user_progress up
set weekly_xp = coalesce((
  select sum(xp_amount)
  from public.user_xp_events e
  where e.user_id = up.user_id
    and e.created_at >= date_trunc('week', now() at time zone 'utc')
), 0),
week_started_at = date_trunc('week', now() at time zone 'utc')::date;
