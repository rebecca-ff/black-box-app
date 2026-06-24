-- Phase 2 (Cruva) — a brand's outreach shortlist of discovered creators.
-- Run once in Supabase → SQL editor.

create table if not exists public.outreach_targets (
  id            uuid primary key default gen_random_uuid(),
  brand_id      uuid not null references auth.users(id) on delete cascade,
  handle        text not null,
  follower_count int,
  gmv           numeric,
  status        text not null default 'saved' check (status in ('saved', 'contacted', 'working')),
  created_at    timestamptz not null default now(),
  unique (brand_id, handle)
);
alter table public.outreach_targets enable row level security;

drop policy if exists "outreach own" on public.outreach_targets;
create policy "outreach own" on public.outreach_targets
  for all using (auth.uid() = brand_id) with check (auth.uid() = brand_id);
