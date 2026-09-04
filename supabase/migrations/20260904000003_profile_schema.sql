-- ============================================================================
-- Migration: 20260904000003_profile_schema.sql
-- Description: Adds profile table for About Me data structure and personal CMS.
-- ============================================================================

create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role_headline text not null,
  location text not null default 'Remote',
  avatar_url text,
  bio_paragraphs jsonb not null default '[]'::jsonb,
  current_focus jsonb not null default '[]'::jsonb,
  education jsonb not null default '[]'::jsonb,
  interests jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profile enable row level security;

-- Public can read profile
create policy "Public read profile"
  on public.profile for select
  to anon, authenticated
  using (true);

-- Admin mutation policy
create policy "Admin write profile"
  on public.profile for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant select on public.profile to anon, authenticated;

-- Insert baseline profile record if table is empty
insert into public.profile (
  full_name,
  role_headline,
  location,
  bio_paragraphs,
  current_focus,
  education,
  interests
)
select
  'Software Engineer',
  'Systems & Web Applications Architect',
  'Global / Remote',
  '[
    "Specializing in high-performance web systems, distributed application platforms, and distinctive client-side browser interfaces.",
    "Driven by building software where mechanical sympathy meets intentional visual design — prioritizing clarity, strict typing, responsive feedback, and minimal operational overhead."
  ]'::jsonb,
  '[
    {
      "topic": "Event-Driven Client Runtimes",
      "details": "Developing modular browser window environments and zero-overhead state machines."
    },
    {
      "topic": "Resilient Data Synchronization",
      "details": "Designing asynchronous webhook ingestion engines with strict cryptographic verification."
    }
  ]'::jsonb,
  '[
    {
      "degree": "B.S. in Computer Science",
      "institution": "University Computer Science Program",
      "year": "2018 — 2022",
      "details": "Focus on Distributed Systems, Algorithms, and Operating System Primitives."
    }
  ]'::jsonb,
  '[
    {
      "title": "Distributed State Engines",
      "description": "Raft consensus implementations, replicated state logs, and conflict-free data types."
    },
    {
      "title": "Browser Sandboxing & Microkernels",
      "description": "Virtual filesystem abstractions, process isolation, and web assembly runtimes."
    }
  ]'::jsonb
where not exists (select 1 from public.profile);
