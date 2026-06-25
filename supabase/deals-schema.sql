-- Phase 3 — Deal engine. Adds flat fee + bonus to campaigns.
-- Run once in Supabase → SQL editor.

alter table public.campaigns add column if not exists flat_fee numeric;
alter table public.campaigns add column if not exists bonus text;
