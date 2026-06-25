-- Saved hooks library — creators (and brands) save hooks from the Hook Lab,
-- then pull them into a campaign brief. Run once in Supabase → SQL editor.

create table if not exists public.saved_hooks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  hook       text not null,
  product    text,
  category   text,
  created_at timestamptz not null default now()
);
alter table public.saved_hooks enable row level security;

drop policy if exists "saved_hooks own" on public.saved_hooks;
create policy "saved_hooks own" on public.saved_hooks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
