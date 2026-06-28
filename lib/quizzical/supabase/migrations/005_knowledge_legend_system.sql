-- Knowledge Legend Program, Atlas, Hall of Fame, Seasons, Kingdoms

-- Extended user profile fields
alter table public.user_progress
  add column if not exists knowledge_rank text not null default 'Beginner',
  add column if not exists kingdom_id text,
  add column if not exists unlocked_items text[] not null default '{}',
  add column if not exists login_streak integer not null default 0,
  add column if not exists last_login_date date,
  add column if not exists daily_reward_claimed_date date,
  add column if not exists claimed_discovery_milestones text[] not null default '{}',
  add column if not exists atlas_completion_pct integer not null default 0,
  add column if not exists achievement_score integer not null default 0,
  add column if not exists season_xp integer not null default 0,
  add column if not exists season_discoveries integer not null default 0,
  add column if not exists is_legend boolean not null default false,
  add column if not exists legend_number integer,
  add column if not exists crowned_at timestamptz;

-- Knowledge Legend status (prestigious endgame)
create table if not exists public.knowledge_legend_status (
  user_id text primary key references public.user_progress(user_id) on delete cascade,
  is_legend boolean not null default false,
  legend_number integer,
  crowned_at timestamptz,
  requirements_met jsonb not null default '{}',
  profile_frame text default 'legend-gold',
  profile_theme text default 'legend',
  hall_of_fame_entry_id bigint
);

-- Atlas progress per track (denormalized for fast reads)
create table if not exists public.atlas_progress (
  user_id text not null references public.user_progress(user_id) on delete cascade,
  track_id text not null,
  learned_count integer not null default 0,
  total_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

-- Generic unlock audit log
create table if not exists public.user_unlocks (
  id bigserial primary key,
  user_id text not null references public.user_progress(user_id) on delete cascade,
  unlock_id text not null,
  unlock_kind text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, unlock_id)
);

create index if not exists user_unlocks_user_idx on public.user_unlocks (user_id);

-- Discovery milestone claims
create table if not exists public.discovery_milestones (
  user_id text not null references public.user_progress(user_id) on delete cascade,
  milestone_id text not null,
  claimed_at timestamptz not null default now(),
  reward_xp integer not null default 0,
  reward_coins integer not null default 0,
  primary key (user_id, milestone_id)
);

-- Knowledge seasons
create table if not exists public.knowledge_seasons (
  id serial primary key,
  season_number integer not null unique,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Season rankings (frozen at season end)
create table if not exists public.season_rankings (
  id bigserial primary key,
  season_id integer not null references public.knowledge_seasons(id) on delete cascade,
  user_id text not null,
  username text not null,
  country_code text not null default 'ZA',
  rank_type text not null,
  rank_position integer not null,
  score integer not null default 0,
  frozen_at timestamptz not null default now()
);

create index if not exists season_rankings_season_idx on public.season_rankings (season_id, rank_type);

-- Hall of Fame (permanent)
create table if not exists public.hall_of_fame (
  id bigserial primary key,
  entry_kind text not null,
  title text not null,
  username text not null,
  user_id text,
  country_code text,
  season_number integer,
  emoji text,
  detail text,
  inducted_at timestamptz not null default now()
);

create index if not exists hall_of_fame_kind_idx on public.hall_of_fame (entry_kind, inducted_at desc);

-- Kingdoms
create table if not exists public.kingdoms (
  id text primary key,
  name text not null,
  emoji text not null,
  description text not null,
  color text not null default '#4d8dff'
);

insert into public.kingdoms (id, name, emoji, description, color) values
  ('explorers', 'Explorers Kingdom', '🌍', 'Geography, travel, and world knowledge', '#4d8dff'),
  ('sports', 'Sports Kingdom', '⚽', 'Athletes, football, basketball, and more', '#00a76d'),
  ('entertainment', 'Entertainment Kingdom', '🎬', 'Movies, TV, music, and pop culture', '#b15bff'),
  ('history', 'History Kingdom', '📜', 'Ancient worlds, wars, and historical figures', '#c98a3a'),
  ('science', 'Science Kingdom', '🔬', 'Nature, chemistry, space, and discovery', '#1fb6a6'),
  ('music', 'Music Kingdom', '🎵', 'Artists, genres, and music mastery', '#ff6b6b')
on conflict (id) do nothing;

create table if not exists public.kingdom_members (
  user_id text primary key references public.user_progress(user_id) on delete cascade,
  kingdom_id text not null references public.kingdoms(id),
  joined_at timestamptz not null default now()
);

-- Championship / season champion results
create table if not exists public.championship_results (
  id bigserial primary key,
  season_id integer references public.knowledge_seasons(id),
  champion_user_id text not null,
  champion_username text not null,
  country_code text,
  scope text not null default 'global',
  category text,
  xp_total integer not null default 0,
  crowned_at timestamptz not null default now()
);

-- Seed Season 1 if none exists
insert into public.knowledge_seasons (season_number, title, starts_at, ends_at, is_active)
select 1, 'Season 1 — Rise of Explorers', now(), now() + interval '30 days', true
where not exists (select 1 from public.knowledge_seasons);

-- RLS: public read for hall of fame, seasons, kingdoms
alter table public.hall_of_fame enable row level security;
alter table public.knowledge_seasons enable row level security;
alter table public.kingdoms enable row level security;
alter table public.season_rankings enable row level security;

drop policy if exists "Public read hall_of_fame" on public.hall_of_fame;
create policy "Public read hall_of_fame" on public.hall_of_fame for select using (true);

drop policy if exists "Public read knowledge_seasons" on public.knowledge_seasons;
create policy "Public read knowledge_seasons" on public.knowledge_seasons for select using (true);

drop policy if exists "Public read kingdoms" on public.kingdoms;
create policy "Public read kingdoms" on public.kingdoms for select using (true);

drop policy if exists "Public read season_rankings" on public.season_rankings;
create policy "Public read season_rankings" on public.season_rankings for select using (true);
