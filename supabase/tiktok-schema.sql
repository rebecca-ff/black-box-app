-- Direct TikTok integration: OAuth token store + video→campaign attribution.
-- Run once in Supabase → SQL editor. Safe to re-run.

-- TikTok OAuth tokens. SERVICE ROLE ONLY: RLS is enabled with NO policies, so
-- neither anon nor authenticated browser clients can ever read these rows — only
-- server routes using the service-role key touch them. This keeps each creator's
-- access/refresh tokens entirely off the client.
create table if not exists public.tiktok_tokens (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  open_id            text,
  access_token       text not null,
  refresh_token      text,
  scope              text,
  expires_at         timestamptz,
  refresh_expires_at timestamptz,
  updated_at         timestamptz not null default now()
);
alter table public.tiktok_tokens enable row level security;
-- (intentionally no policies — server-only access)

-- Which TikTok video a creator posted for which in-app campaign (brand). Lets us
-- roll the real-time TikTok metrics up per brand the creator works with here.
-- Creators read/write only their own rows.
create table if not exists public.creator_video_links (
  creator_id  uuid not null references auth.users(id) on delete cascade,
  video_id    text not null,
  campaign_id text,
  created_at  timestamptz not null default now(),
  primary key (creator_id, video_id)
);
alter table public.creator_video_links enable row level security;

drop policy if exists "video_links own" on public.creator_video_links;
create policy "video_links own" on public.creator_video_links
  for all using (auth.uid() = creator_id) with check (auth.uid() = creator_id);
