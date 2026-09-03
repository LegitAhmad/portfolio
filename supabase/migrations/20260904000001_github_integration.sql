-- ============================================================================
-- Migration: 20260904000001_github_integration.sql
-- Description: Adds GitHub App integration persistence, repository synchronization,
--              and editorial visibility controls.
-- ============================================================================

-- 1. Extend projects table with GitHub metadata and editorial visibility
alter table public.projects
  add column if not exists visible boolean not null default false,
  add column if not exists github_stars integer not null default 0,
  add column if not exists github_forks integer not null default 0,
  add column if not exists github_primary_language text,
  add column if not exists github_topics jsonb not null default '[]'::jsonb,
  add column if not exists github_last_pushed_at timestamptz,
  add column if not exists github_synced_at timestamptz;

-- Ensure pre-existing seed projects are visible
update public.projects set visible = true where visible = false;

create index if not exists idx_projects_visible on public.projects(visible);

-- 2. Discovered & Accessible GitHub Repositories Cache Table
create table if not exists public.github_repositories (
  id bigint primary key, -- GitHub numerical repository ID
  name text not null,
  full_name text not null unique,
  owner_login text not null,
  html_url text not null,
  description text,
  homepage text,
  language text,
  topics jsonb not null default '[]'::jsonb,
  stars_count integer not null default 0,
  forks_count integer not null default 0,
  open_issues_count integer not null default 0,
  default_branch text not null default 'main',
  is_private boolean not null default false,
  is_archived boolean not null default false,
  pushed_at timestamptz,
  created_at_github timestamptz,
  updated_at_github timestamptz,
  synced_at timestamptz not null default now(),
  project_id uuid references public.projects(id) on delete set null,
  visible boolean not null default false -- Default: visible = false (must not automatically become public)
);

create index if not exists idx_github_repos_full_name on public.github_repositories(full_name);
create index if not exists idx_github_repos_project_id on public.github_repositories(project_id);
create index if not exists idx_github_repos_visible on public.github_repositories(visible);

-- 3. Row Level Security for GitHub Repositories
alter table public.github_repositories enable row level security;

grant select on public.github_repositories to anon, authenticated;

-- Public can read visible linked repositories
create policy "Public read visible github repos"
  on public.github_repositories for select
  to anon, authenticated
  using (visible = true);

-- Admin mutation policy
create policy "Admin write github repos"
  on public.github_repositories for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
