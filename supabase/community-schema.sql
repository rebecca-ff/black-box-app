-- Phase 1 — Community + Academy. Run once in Supabase → SQL editor.

-- Community feed: any signed-in user can read; you can post/delete your own.
create table if not exists public.community_posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  body        text not null,
  author_role text,
  created_at  timestamptz not null default now()
);
alter table public.community_posts enable row level security;

drop policy if exists "community read" on public.community_posts;
create policy "community read" on public.community_posts for select using (true);

drop policy if exists "community insert own" on public.community_posts;
create policy "community insert own" on public.community_posts
  for insert with check (auth.uid() = user_id);

drop policy if exists "community delete own" on public.community_posts;
create policy "community delete own" on public.community_posts
  for delete using (auth.uid() = user_id);

-- Academy progress: each user tracks which training modules they've completed.
create table if not exists public.training_progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  module_key   text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, module_key)
);
alter table public.training_progress enable row level security;

drop policy if exists "training own" on public.training_progress;
create policy "training own" on public.training_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
