-- Admin-managed image quiz questions (dashboard CRUD).
-- Run in the Supabase SQL editor when NEXT_PUBLIC_SUPABASE_URL is configured.

create table if not exists public.image_questions (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('Celebrity', 'Athlete', 'Movie', 'Music')),
  type text not null default 'image-guess',
  image_url text not null,
  question text not null default 'Who is this?',
  correct_answer text not null,
  wrong_answers jsonb not null,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  created_at timestamptz not null default now()
);

create index if not exists image_questions_category_idx
  on public.image_questions (category);

create index if not exists image_questions_created_at_idx
  on public.image_questions (created_at desc);

alter table public.image_questions enable row level security;

drop policy if exists "Public read image_questions" on public.image_questions;
create policy "Public read image_questions"
  on public.image_questions
  for select
  using (true);
