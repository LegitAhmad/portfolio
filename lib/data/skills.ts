/**
 * Typed temporary content source for Skills & Competencies.
 * Strict rule: No fake proficiency percentages. Categorized by technical domain.
 */

export interface SkillItem {
  name: string;
  focus: string;
  context: string;
}

export interface SkillCategoryGroup {
  id: string;
  categoryName: string;
  headline: string;
  skills: readonly SkillItem[];
}

export const PLACEHOLDER_SKILL_GROUPS: readonly SkillCategoryGroup[] = [
  {
    id: "frontend-arch",
    categoryName: "Frontend & Interface Architecture",
    headline: "High-fidelity, responsive client-side platforms and interaction design",
    skills: [
      { name: "TypeScript", focus: "Strict typing", context: "Generics, conditional types, and schema inference" },
      { name: "React 19 / 18", focus: "Component architecture", context: "Server Components, hooks, reconciliation, concurrent modes" },
      { name: "Next.js", focus: "App Router & SSR", context: "Server Actions, streaming, route handlers, metadata caching" },
      { name: "Tailwind CSS", focus: "Utility & Design Tokens", context: "CSS variables, themes, fluid responsive layouts" },
      { name: "Zustand & Motion", focus: "State & Animation", context: "Selective store subscriptions, physics-based springs" },
      { name: "Web APIs & DOM", focus: "Platform primitives", context: "Pointer events, canvas, intersection observers, accessibility" },
    ],
  },
  {
    id: "backend-persistence",
    categoryName: "Backend & Data Persistence",
    headline: "Reliable database modeling, serverless endpoints, and API design",
    skills: [
      { name: "PostgreSQL", focus: "Relational Modeling", context: "Indexes, foreign keys, views, complex joins" },
      { name: "Supabase", focus: "BaaS & Auth", context: "Row-level security (RLS), Postgres functions, storage" },
      { name: "Node.js & Go", focus: "Server Runtimes", context: "RESTful endpoints, asynchronous pipelines, CLI tooling" },
      { name: "Redis", focus: "In-Memory Caching", context: "Session state, rate limiting, pub/sub signaling" },
      { name: "GraphQL & REST", focus: "API Contracts", context: "Typed query resolution, pagination, error schemas" },
    ],
  },
  {
    id: "systems-devops",
    categoryName: "Systems & Infrastructure",
    headline: "Deployment automation, environment orchestration, and monitoring",
    skills: [
      { name: "Vercel & Cloudflare", focus: "Edge / Serverless", context: "Edge middleware, global distribution, zero-config deploys" },
      { name: "Docker", focus: "Containerization", context: "Multi-stage builds, compose networks, reproducible environments" },
      { name: "Git & GitHub Apps", focus: "VCS & Automation", context: "Branching strategies, CI/CD actions, webhook verification" },
      { name: "Linux / POSIX", focus: "System Administration", context: "Shell scripting, process management, performance diagnostics" },
    ],
  },
  {
    id: "engineering-practices",
    categoryName: "Engineering Discipline",
    headline: "Principles governing code quality, maintainability, and delivery",
    skills: [
      { name: "Strict Type Safety", focus: "End-to-End Typing", context: "Eliminating runtime unexpected values through strict boundaries" },
      { name: "Accessibility (a11y)", focus: "Inclusive Standards", context: "ARIA specifications, keyboard traversal, screen reader parity" },
      { name: "Performance Profiling", focus: "Web Vitals", context: "INP, LCP, CLS tracking, avoiding layout thrashing" },
      { name: "Test-Driven Design", focus: "Behavior Verification", context: "Unit tests, integration pipelines, regression prevention" },
    ],
  },
] as const;

export function getPlaceholderSkillGroups(): readonly SkillCategoryGroup[] {
  return PLACEHOLDER_SKILL_GROUPS;
}
