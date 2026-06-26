-- Make campaigns multi-tenant and remove the demo seed brands. Run once.
-- After this: each brand sees only their own campaigns; creators see the live
-- marketplace; no fake brands appear on login.

alter table public.campaigns add column if not exists owner_id uuid references auth.users(id) on delete cascade;

-- Remove the seeded demo brands (they have no owner). Real brands create their own.
delete from public.campaigns where owner_id is null;
