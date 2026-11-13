-- ============================================================
-- SSC CGL Tracker — Supabase schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor).
-- Safe to re-run: tables use IF NOT EXISTS and policies/triggers are recreated.
-- ============================================================

create extension if not exists pgcrypto;

-- Keeps updated_at fresh on every row update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Planner tasks (one row per task on a date)
-- ------------------------------------------------------------
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null check (length(trim(title)) > 0),
  subject     text not null default 'General',
  notes       text,
  due_date    date not null,
  completed   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists tasks_user_due_idx
  on public.tasks (user_id, due_date);

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Syllabus topics (Not started → Studying → Revised)
-- ------------------------------------------------------------
create table if not exists public.syllabus_topics (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  subject     text not null,
  topic       text not null check (length(trim(topic)) > 0),
  status      text not null default 'not_started'
              check (status in ('not_started', 'studying', 'revised')),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- Makes the first-login seed insert idempotent.
  unique (user_id, subject, topic)
);

create index if not exists syllabus_user_idx
  on public.syllabus_topics (user_id, subject, sort_order);

drop trigger if exists syllabus_set_updated_at on public.syllabus_topics;
create trigger syllabus_set_updated_at
  before update on public.syllabus_topics
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security: every row is private to its owner.
-- The anon key is public, so these policies are the real lock.
-- ------------------------------------------------------------
alter table public.tasks enable row level security;
alter table public.syllabus_topics enable row level security;

-- Table privileges are checked before RLS. Some Supabase projects do not
-- grant these by default for tables created via the SQL Editor, which
-- surfaces as "permission denied for table tasks" even when signed in.
-- Only `authenticated` gets access; `anon` stays locked out entirely.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.tasks to authenticated;
grant select, insert, update, delete on table public.syllabus_topics to authenticated;

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
  on public.tasks for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
  on public.tasks for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
  on public.tasks for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
  on public.tasks for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "syllabus_select_own" on public.syllabus_topics;
create policy "syllabus_select_own"
  on public.syllabus_topics for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "syllabus_insert_own" on public.syllabus_topics;
create policy "syllabus_insert_own"
  on public.syllabus_topics for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "syllabus_update_own" on public.syllabus_topics;
create policy "syllabus_update_own"
  on public.syllabus_topics for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "syllabus_delete_own" on public.syllabus_topics;
create policy "syllabus_delete_own"
  on public.syllabus_topics for delete to authenticated
  using ((select auth.uid()) = user_id);
