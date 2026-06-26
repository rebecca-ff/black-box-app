-- Noise-style campaign fields (deal model + tier + budget). Run once.
alter table public.campaigns add column if not exists deal_type      text default 'commission'; -- 'commission' | 'paid'
alter table public.campaigns add column if not exists cpm            numeric;     -- $ per 1,000 views (paid)
alter table public.campaigns add column if not exists max_payout     numeric;     -- max $ per post (paid)
alter table public.campaigns add column if not exists bonus_per_post numeric;
alter table public.campaigns add column if not exists bonuses_per_day int;
alter table public.campaigns add column if not exists budget         numeric;
alter table public.campaigns add column if not exists start_date     date;
alter table public.campaigns add column if not exists end_date       date;
alter table public.campaigns add column if not exists max_creators   int;
alter table public.campaigns add column if not exists creator_tier   text default 'basic'; -- 'basic' | 'premium'
