-- Live knowledge platform: content dedup, activity feed, realtime
-- Run after 002_user_progression.sql

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

create index if not exists user_content_history_user_type_time_idx
  on public.user_content_history (user_id, content_type, played_at desc);

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

create index if not exists activity_events_kind_time_idx
  on public.activity_events (event_kind, created_at desc);

alter table public.user_content_history enable row level security;
alter table public.activity_events enable row level security;

-- Realtime (enable in Supabase dashboard if publication missing)
do $$
begin
  alter publication supabase_realtime add table public.activity_events;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.user_progress;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
