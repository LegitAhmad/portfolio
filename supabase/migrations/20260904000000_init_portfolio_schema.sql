-- ============================================================================
-- Migration: 20260904000000_init_portfolio_schema.sql
-- Description: Core schema for portfolio persistence layer on Supabase PostgreSQL.
-- Entities:
--   - projects
--   - project_images
--   - technologies
--   - project_technologies
--   - experience
--   - skills
--   - links
-- Includes:
--   - Constraints, indexes, foreign keys, timestamps
--   - GitHub association columns for future sync
--   - Row Level Security (RLS) policies and role grants
--   - Public storage bucket definition for portfolio-media
-- ============================================================================

-- 1. Projects Table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text not null,
  overview text,
  category text not null,
  featured boolean not null default false,
  status text not null default 'Active' check (status in ('Active', 'Completed', 'Prototype', 'Archived')),
  thumbnail_url text,
  demo_url text,
  github_url text,
  github_repo_id bigint, -- Future GitHub App repository association
  github_repo_full_name text,
  sort_order integer not null default 0,
  features jsonb not null default '[]'::jsonb,
  technical_details jsonb not null default '[]'::jsonb,
  challenges_decisions jsonb not null default '[]'::jsonb,
  hero_media jsonb default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Project Images Table
create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 3. Technologies Table
create table if not exists public.technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  category text,
  created_at timestamptz not null default now()
);

-- 4. Project Technologies (Junction Table)
create table if not exists public.project_technologies (
  project_id uuid not null references public.projects(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (project_id, technology_id)
);

-- 5. Experience Timeline Table
create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  role_title text not null,
  company_name text not null,
  location text not null default 'Remote',
  timeframe text not null,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  summary text not null,
  achievements jsonb not null default '[]'::jsonb,
  technologies jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Skills Table
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_name text not null,
  focus text not null,
  context text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 7. Links Table
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  handle text not null,
  url text not null,
  description text not null,
  type text not null default 'github',
  verified boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Performance Indexes
-- ============================================================================
create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_projects_featured on public.projects(featured);
create index if not exists idx_projects_category on public.projects(category);
create index if not exists idx_projects_sort on public.projects(sort_order, created_at desc);
create index if not exists idx_projects_github_repo on public.projects(github_repo_id) where github_repo_id is not null;

create index if not exists idx_project_images_project_id on public.project_images(project_id);
create index if not exists idx_project_technologies_proj on public.project_technologies(project_id);
create index if not exists idx_project_technologies_tech on public.project_technologies(technology_id);

create index if not exists idx_experience_sort on public.experience(sort_order, start_date desc);
create index if not exists idx_skills_cat_sort on public.skills(category_name, sort_order);
create index if not exists idx_links_sort on public.links(sort_order);

-- ============================================================================
-- Row Level Security (RLS) Configuration
-- ============================================================================
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.technologies enable row level security;
alter table public.project_technologies enable row level security;
alter table public.experience enable row level security;
alter table public.skills enable row level security;
alter table public.links enable row level security;

-- Grants for Data API
grant select on public.projects to anon, authenticated;
grant select on public.project_images to anon, authenticated;
grant select on public.technologies to anon, authenticated;
grant select on public.project_technologies to anon, authenticated;
grant select on public.experience to anon, authenticated;
grant select on public.skills to anon, authenticated;
grant select on public.links to anon, authenticated;

-- Public read-only policies (using modern TO clause)
create policy "Public read projects"
  on public.projects for select
  to anon, authenticated
  using (true);

create policy "Public read project_images"
  on public.project_images for select
  to anon, authenticated
  using (true);

create policy "Public read technologies"
  on public.technologies for select
  to anon, authenticated
  using (true);

create policy "Public read project_technologies"
  on public.project_technologies for select
  to anon, authenticated
  using (true);

create policy "Public read experience"
  on public.experience for select
  to anon, authenticated
  using (true);

create policy "Public read skills"
  on public.skills for select
  to anon, authenticated
  using (true);

create policy "Public read links"
  on public.links for select
  to anon, authenticated
  using (true);

-- Admin mutation policies (protected by app_metadata role check)
create policy "Admin write projects"
  on public.projects for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin write project_images"
  on public.project_images for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin write technologies"
  on public.technologies for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin write project_technologies"
  on public.project_technologies for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin write experience"
  on public.experience for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin write skills"
  on public.skills for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin write links"
  on public.links for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================================================
-- Supabase Storage: Public portfolio-media bucket
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

create policy "Public view portfolio-media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'portfolio-media');
