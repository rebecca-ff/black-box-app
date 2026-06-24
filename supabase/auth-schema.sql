-- Auth schema for callsheet: per-user profile (role) + linked social accounts.
-- Run once in Supabase → SQL editor. Safe to re-run.

-- One profile per auth user; role drives which portal they land in.
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null check (role in ('brand', 'creator')),
  display_name text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

-- Linked TikTok / Instagram / Meta accounts. follower_count powers the
-- 1,000-follower TikTok-affiliate qualification meter later.
create table if not exists public.connected_accounts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  platform       text not null check (platform in ('tiktok', 'instagram', 'meta')),
  handle         text,
  follower_count int,
  connected_at   timestamptz not null default now(),
  unique (user_id, platform)
);

alter table public.connected_accounts enable row level security;

drop policy if exists "connected_accounts own" on public.connected_accounts;
create policy "connected_accounts own" on public.connected_accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
