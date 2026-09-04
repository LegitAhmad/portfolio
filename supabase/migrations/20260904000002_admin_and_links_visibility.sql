-- ============================================================================
-- Migration: 20260904000002_admin_and_links_visibility.sql
-- Description: Adds visibility controls to external links and configures RLS.
-- ============================================================================

-- 1. Add visibility column to links table
alter table public.links
  add column if not exists visible boolean not null default true;

create index if not exists idx_links_visible on public.links(visible);

-- 2. Update public read policy for links to enforce visibility
drop policy if exists "Public read links" on public.links;

create policy "Public read visible links"
  on public.links for select
  to anon, authenticated
  using (visible = true);
