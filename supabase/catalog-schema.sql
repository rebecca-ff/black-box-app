-- Brand product catalog + creator sample requests. Run once in Supabase.
--
-- A brand's products are its catalog: added manually now, imported from TikTok
-- Shop later (source='tiktok_shop'). Creators browse/search every brand's active
-- products across the platform and request free samples.

create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users(id) on delete cascade,
  -- Denormalized brand identity so the creator marketplace can show who sells a
  -- product without reading other users' profiles (RLS forbids that).
  brand_name       text not null,
  brand_color      text,
  title            text not null,
  description      text,
  category         text,
  price            numeric,
  image_url        text,
  sku              text,
  external_id      text,                      -- TikTok Shop product id (null = manual)
  source           text not null default 'manual' check (source in ('manual', 'tiktok_shop')),
  commission       int  not null default 20,
  sample_available boolean not null default true,
  status           text not null default 'active' check (status in ('active', 'archived')),
  created_at       timestamptz not null default now(),
  unique (owner_id, external_id)
);
alter table public.products enable row level security;

-- A brand fully manages its own products (any status).
drop policy if exists "products owner rw" on public.products;
create policy "products owner rw" on public.products
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Any signed-in user can browse active products — this is the shared marketplace
-- catalog creators search. (Policies are OR'd, so a brand still sees its own
-- archived rows via the owner policy above.)
drop policy if exists "products read active" on public.products;
create policy "products read active" on public.products
  for select using (status = 'active');

-- A creator requests a free sample of a catalog product from its brand.
create table if not exists public.sample_requests (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  creator_id  uuid not null references auth.users(id) on delete cascade,
  brand_id    uuid not null references auth.users(id) on delete cascade,
  product_title text,                          -- snapshot so the brand sees it without a join
  handle      text,                            -- creator's TikTok handle at request time
  note        text,                            -- creator's pitch / shipping note
  status      text not null default 'requested' check (status in ('requested', 'approved', 'shipped', 'declined')),
  created_at  timestamptz not null default now(),
  unique (product_id, creator_id)
);
alter table public.sample_requests enable row level security;

-- Creator manages their own requests.
drop policy if exists "sample_requests creator rw" on public.sample_requests;
create policy "sample_requests creator rw" on public.sample_requests
  for all using (auth.uid() = creator_id) with check (auth.uid() = creator_id);

-- Brand reads + acts on requests for its products.
drop policy if exists "sample_requests brand read" on public.sample_requests;
create policy "sample_requests brand read" on public.sample_requests
  for select using (auth.uid() = brand_id);

drop policy if exists "sample_requests brand update" on public.sample_requests;
create policy "sample_requests brand update" on public.sample_requests
  for update using (auth.uid() = brand_id) with check (auth.uid() = brand_id);
