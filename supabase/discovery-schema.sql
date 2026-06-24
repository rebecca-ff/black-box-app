-- Phase 2 — Discovery + outreach. Run once in Supabase → SQL editor.

-- Let any signed-in user read linked accounts, so brands can browse the
-- creator directory (handles + follower counts are non-sensitive).
drop policy if exists "connected_accounts discoverable" on public.connected_accounts;
create policy "connected_accounts discoverable" on public.connected_accounts
  for select using (true);

-- Brand → creator invitations.
create table if not exists public.invitations (
  id          uuid primary key default gen_random_uuid(),
  brand_id    uuid not null references auth.users(id) on delete cascade,
  creator_id  uuid not null references auth.users(id) on delete cascade,
  campaign_id text,
  message     text,
  status      text not null default 'sent' check (status in ('sent', 'accepted', 'declined')),
  created_at  timestamptz not null default now(),
  unique (brand_id, creator_id)
);
alter table public.invitations enable row level security;

drop policy if exists "invitations brand insert" on public.invitations;
create policy "invitations brand insert" on public.invitations
  for insert with check (auth.uid() = brand_id);

drop policy if exists "invitations read party" on public.invitations;
create policy "invitations read party" on public.invitations
  for select using (auth.uid() = brand_id or auth.uid() = creator_id);

drop policy if exists "invitations creator update" on public.invitations;
create policy "invitations creator update" on public.invitations
  for update using (auth.uid() = creator_id) with check (auth.uid() = creator_id);
