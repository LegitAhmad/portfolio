-- ============================================================================
-- Seed data for Supabase Portfolio Database
-- ============================================================================

-- Technologies
insert into public.technologies (name, slug, category) values
  ('TypeScript', 'typescript', 'language'),
  ('Next.js', 'nextjs', 'framework'),
  ('React', 'react', 'framework'),
  ('PostgreSQL', 'postgresql', 'database'),
  ('Supabase', 'supabase', 'platform'),
  ('Tailwind CSS', 'tailwindcss', 'styling'),
  ('Go', 'go', 'language'),
  ('Docker', 'docker', 'devops'),
  ('Redis', 'redis', 'database'),
  ('Zustand', 'zustand', 'library'),
  ('Motion', 'motion', 'library')
on conflict (slug) do nothing;

-- Projects
insert into public.projects (
  slug,
  title,
  short_description,
  overview,
  category,
  featured,
  status,
  demo_url,
  github_url,
  sort_order,
  features,
  technical_details,
  challenges_decisions,
  hero_media
) values (
  'lmsv2',
  'LMS Platform Engine',
  'Distributed learning management service with real-time state synchronization and low-latency evaluation pipelines.',
  'LMSv2 was engineered to solve high-concurrency bottlenecking in real-time assessment environments. By isolating evaluation compute into stateless worker pools and synchronizing state over an event bus, the system maintains consistent sub-50ms response times during traffic spikes.',
  'Platform',
  true,
  'Active',
  'https://lmsv2.example.com',
  'https://github.com/example/lmsv2',
  1,
  '["Stateless auto-scaling grading worker cluster", "Real-time collaboration over WebSockets", "Row-Level Security for multi-tenant isolation", "Automated edge caching"]'::jsonb,
  '[{"label": "Target Latency", "value": "< 50ms p95 response"}, {"label": "Database", "value": "PostgreSQL with connection pooling"}]'::jsonb,
  '[{"challenge": "Concurrent test submissions caused lock contention.", "decision": "Decoupled evaluation using append-only event logs."}]'::jsonb,
  '{"type": "diagram", "caption": "Distributed evaluation and content delivery topology", "badge": "Architecture Topology v2.4"}'::jsonb
), (
  'desktop-runtime',
  'Desktop Runtime Environment',
  'Browser-based operating system shell featuring customizable window stacking, selective state stores, and pointer event virtualization.',
  'A personal developer portfolio implemented as a desktop environment running inside the browser. Built strictly with modern web primitives, it delivers window stacking, drag/resize physics, responsive taskbars, and deep application routing without third-party canvas wrappers.',
  'Frontend',
  true,
  'Active',
  'https://desktop-runtime.example.com',
  'https://github.com/example/desktop-runtime',
  2,
  '["Custom pointer-capture drag engine", "Selective Zustand subscriptions", "Decoupled application registry"]'::jsonb,
  '[{"label": "Frame Rate", "value": "Steady 60fps"}, {"label": "State Model", "value": "Zustand with z-index normalization"}]'::jsonb,
  '[{"challenge": "Third-party drag libraries caused layout thrashing.", "decision": "Built custom PointerEvent hook with viewport clamping."}]'::jsonb,
  '{"type": "preview", "caption": "Multi-window layout virtualization with 60fps interaction", "badge": "Interactive Runtime"}'::jsonb
) on conflict (slug) do nothing;

-- Experience
insert into public.experience (
  role_title,
  company_name,
  location,
  timeframe,
  is_current,
  summary,
  achievements,
  technologies,
  sort_order
) values (
  'Staff Software Engineer (Placeholder)',
  'Platform Infrastructure Inc.',
  'Remote',
  '2024 — Present',
  true,
  'Led the architectural migration of core customer-facing applications toward event-driven micro-frontends, reducing critical p99 page latency by 45%.',
  '["Engineered an edge-cached routing layer handling 250M+ requests per month with 99.99% reliability.", "Established strict type safety standards across 8 engineering squads.", "Mentored senior engineers in distributed systems design."]'::jsonb,
  '["Next.js", "TypeScript", "PostgreSQL", "Go", "Vercel", "Kafka"]'::jsonb,
  1
), (
  'Senior Software Engineer (Placeholder)',
  'Enterprise Cloud Systems',
  'San Francisco, CA (Hybrid)',
  '2021 — 2024',
  false,
  'Spearheaded real-time collaboration services and graphical workflow visualization tools for enterprise cloud monitoring dashboards.',
  '["Built a high-performance WebGL canvas rendering 50,000 live telemetry nodes.", "Architected secure role-based access control and row-level security policies."]'::jsonb,
  '["React", "Node.js", "GraphQL", "Docker", "Redis", "Tailwind CSS"]'::jsonb,
  2
);

-- Skills
insert into public.skills (name, category_name, focus, context, sort_order) values
  ('TypeScript', 'Frontend & Interface Architecture', 'Strict typing', 'Generics, conditional types, and schema inference', 1),
  ('React 19 / 18', 'Frontend & Interface Architecture', 'Component architecture', 'Server Components, hooks, reconciliation', 2),
  ('Next.js', 'Frontend & Interface Architecture', 'App Router & SSR', 'Server Actions, streaming, route handlers', 3),
  ('PostgreSQL', 'Backend & Data Persistence', 'Relational Modeling', 'Indexes, foreign keys, views, complex joins', 4),
  ('Supabase', 'Backend & Data Persistence', 'BaaS & Auth', 'Row-level security (RLS), Postgres functions, storage', 5),
  ('Docker', 'Systems & Infrastructure', 'Containerization', 'Multi-stage builds, compose networks', 6),
  ('Strict Type Safety', 'Engineering Discipline', 'End-to-End Typing', 'Eliminating runtime unexpected values', 7);

-- Links
insert into public.links (title, category, handle, url, description, type, verified, sort_order) values
  ('GitHub', 'Code & Contributions', '@portfolio-developer', 'https://github.com', 'Open source repositories and architectural templates.', 'github', true, 1),
  ('LinkedIn', 'Professional Network', 'in/portfolio-developer', 'https://linkedin.com', 'Career timeline and professional network.', 'linkedin', true, 2),
  ('X (Twitter)', 'Discussions', '@developer_dev', 'https://x.com', 'Short-form technical commentary and updates.', 'x', true, 3),
  ('Direct Email', 'Direct Communication', 'contact@developer.internal', 'mailto:contact@developer.internal', 'Direct channel for inquiries.', 'email', true, 4);
