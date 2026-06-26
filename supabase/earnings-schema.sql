-- Native earnings ledger (NOT Cruva). A creator's own sales + commission,
-- across every brand. Self-reported for now; auto-syncs from the TikTok Shop
-- affiliate API later (the gated TikTok integration). Run once in Supabase.

create table if not exists public.earnings (
  id          uuid primary key default gen_random_uuid(),
  creator_id  uuid not null references auth.users(id) on delete cascade,
  brand_id    uuid references auth.users(id) on delete set null,
  campaign_id uuid,
  gmv         numeric not null default 0,
  commission  numeric not null default 0,
  units       int not null default 0,
  status      text not null default 'pending' check (status in ('pending', 'paid')),
  source      text not null default 'self_report',
  created_at  timestamptz not null default now()
);
alter table public.earnings enable row level security;

-- Creators read + write their own rows.
drop policy if exists "earnings creator rw" on public.earnings;
create policy "earnings creator rw" on public.earnings
  for all using (auth.uid() = creator_id) with check (auth.uid() = creator_id);

-- Brands can read rows attributed to them.
drop policy if exists "earnings brand read" on public.earnings;
create policy "earnings brand read" on public.earnings
  for select using (auth.uid() = brand_id);
