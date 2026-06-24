-- callsheet — database schema
-- Run this once in your Supabase project: Dashboard → SQL Editor → paste → Run.
--
-- Access model (v1): the app reads/writes through Next.js server routes using
-- the SERVICE ROLE key (server-only). RLS is ON with no public policies, so the
-- tables are locked to anon/public clients and only reachable via our server.
-- When we add real brand/creator login later, we add per-user RLS policies.

create extension if not exists pgcrypto;

-- ── campaigns (a brand's product + deal + AI brief) ───────────────────────────
create table if not exists public.campaigns (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,                 -- brand name
  product       text not null,
  category      text,
  commission    int  not null default 20,
  sample        boolean not null default true,
  collab        text not null default 'Open',  -- Open | Targeted
  tier          text not null default 'Micro', -- Nano | Micro | Mid
  color         text not null default '#FF3B1D',
  ink           text not null default '#33080b',
  vibe          text,
  compliance    text,
  status        text not null default 'Draft', -- Draft | Live
  brief         jsonb,
  joined_count  int  not null default 0,
  posted_count  int  not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists campaigns_status_idx on public.campaigns (status);
create index if not exists campaigns_created_idx on public.campaigns (created_at desc);

-- ── participations (a creator's relationship to a campaign) ───────────────────
-- v1 identifies a creator by an anonymous key generated on their device and
-- stored in localStorage. Swap for auth.uid() when login lands.
create table if not exists public.participations (
  id                uuid primary key default gen_random_uuid(),
  campaign_id       uuid not null references public.campaigns (id) on delete cascade,
  creator_key       text not null,
  joined            boolean not null default false,
  posted            boolean not null default false,
  sample_requested  boolean not null default false,
  filmed            boolean not null default false,
  remix             jsonb,
  updated_at        timestamptz not null default now(),
  unique (campaign_id, creator_key)
);

create index if not exists participations_creator_idx on public.participations (creator_key);

-- ── counters: keep joined/posted on the campaign in sync ──────────────────────
create or replace function public.sync_campaign_counts()
returns trigger language plpgsql as $$
declare cid uuid;
begin
  cid := coalesce(new.campaign_id, old.campaign_id);
  update public.campaigns c set
    joined_count = (select count(*) from public.participations p where p.campaign_id = cid and p.joined),
    posted_count = (select count(*) from public.participations p where p.campaign_id = cid and p.posted)
  where c.id = cid;
  return null;
end $$;

drop trigger if exists participations_counts on public.participations;
create trigger participations_counts
  after insert or update or delete on public.participations
  for each row execute function public.sync_campaign_counts();

-- ── storage bucket for filmed clips ───────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('clips', 'clips', true)
on conflict (id) do nothing;

-- ── hooks_cache (top hooks per category, refreshed daily from Kalopilot) ──────
-- Briefs read this instantly; the slow Kalopilot call happens in a daily cron.
create table if not exists public.hooks_cache (
  category   text primary key,
  hooks      jsonb not null default '[]'::jsonb,
  source     text,
  fetched_at timestamptz not null default now()
);

-- ── lock down: RLS on, no public policies (server-only via service role) ──────
alter table public.campaigns      enable row level security;
alter table public.participations enable row level security;
alter table public.hooks_cache    enable row level security;
