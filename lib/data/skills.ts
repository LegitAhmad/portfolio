/**
 * Application / Domain Data Access Layer for Skills & Competencies.
 * 
 * Strict rule: No fake proficiency percentages.
 * Categorized technical skill groups:
 * - Languages
 * - Frontend
 * - Backend
 * - Databases
 * - Infrastructure
 * - Tools
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface SkillItem {
  id?: string;
  name: string;
  focus: string;
  context: string;
  sortOrder?: number;
}

export interface SkillCategoryGroup {
  id: string;
  categoryName: string;
  headline: string;
  skills: readonly SkillItem[];
}

export const SEED_SKILL_GROUPS: readonly SkillCategoryGroup[] = [
  {
    id: "languages",
    categoryName: "Languages",
    headline: "Core programming languages utilized in production systems and scripting",
    skills: [
      { name: "TypeScript", focus: "Static Type Systems", context: "Strict typing, conditional generics, and end-to-end schema validation" },
      { name: "Go", focus: "Systems & Concurrency", context: "High-throughput services, goroutines, and low-latency network daemons" },
      { name: "Rust", focus: "Memory Safety", context: "Systems programming, zero-cost abstractions, and CLI tooling" },
      { name: "SQL", focus: "Query Optimization", context: "Declarative schemas, indexing strategies, CTEs, and relational algebra" },
      { name: "Bash / Shell", focus: "OS Automation", context: "POSIX scripts, build pipelines, and system maintenance utilities" },
    ],
  },
  {
    id: "frontend",
    categoryName: "Frontend",
    headline: "Client-side platforms, component architecture, and responsive user interfaces",
    skills: [
      { name: "React 19 / 18", focus: "Component Model", context: "Server Components, hooks, concurrent scheduling, and reconciliation" },
      { name: "Next.js", focus: "App Router & SSR", context: "Server Actions, route handlers, dynamic streaming, and edge caching" },
      { name: "Tailwind CSS", focus: "Utility Architecture", context: "Design token systems, CSS variables, and fluid responsive layouts" },
      { name: "Zustand & Motion", focus: "State & Transitions", context: "Deterministic store subscriptions and physics-based motion" },
      { name: "Web APIs & a11y", focus: "Browser Primitives", context: "Pointer events, canvas, ARIA patterns, and screen reader parity" },
    ],
  },
  {
    id: "backend",
    categoryName: "Backend",
    headline: "API contracts, asynchronous microservices, and server runtimes",
    skills: [
      { name: "Node.js", focus: "Event-Loop Runtime", context: "Asynchronous I/O pipelines, streaming buffers, and HTTP endpoints" },
      { name: "REST & GraphQL", focus: "API Contracts", context: "Type-safe schemas, pagination, rate limiting, and idempotent mutations" },
      { name: "Event Architecture", focus: "Asynchronous Messaging", context: "Webhook verification, queue processing, and decoupled worker models" },
      { name: "Auth & Security", focus: "Access Control", context: "Timing-safe HMAC validation, JWT authentication, and token revocation" },
    ],
  },
  {
    id: "databases",
    categoryName: "Databases",
    headline: "Relational persistence, in-memory caching, and security policies",
    skills: [
      { name: "PostgreSQL", focus: "Relational Engine", context: "Schema modeling, constraints, transactional isolation, and indexes" },
      { name: "Supabase", focus: "Backend-as-a-Service", context: "Row Level Security (RLS), Postgres functions, and Storage buckets" },
      { name: "Redis", focus: "In-Memory Store", context: "Key-value caching, ephemeral session state, and atomic counters" },
    ],
  },
  {
    id: "infrastructure",
    categoryName: "Infrastructure",
    headline: "Containerization, cloud deployment, and system administration",
    skills: [
      { name: "Linux / POSIX", focus: "System Administration", context: "Process supervision, systemd, resource monitoring, and permissions" },
      { name: "Docker", focus: "Containerization", context: "Multi-stage builds, isolated networks, and reproducible runtimes" },
      { name: "Vercel & Edge", focus: "Cloud Distribution", context: "Serverless execution limits, edge middleware, and zero-downtime deploys" },
      { name: "CI / CD", focus: "Automation Pipelines", context: "GitHub Actions workflows, build matrix testing, and artifact publishing" },
    ],
  },
  {
    id: "tools",
    categoryName: "Tools",
    headline: "Developer tooling, version control, and diagnostic instrumentation",
    skills: [
      { name: "Git & GitHub", focus: "Version Control", context: "Trunk-based workflow, interactive rebase, and GitHub Apps integration" },
      { name: "Turbopack & Vite", focus: "Build Tooling", context: "Incremental compilation, HMR optimization, and bundle minimization" },
      { name: "Playwright & Vitest", focus: "Testing Suites", context: "End-to-end integration flows and regression prevention" },
      { name: "Web Vitals Profiling", focus: "Performance Diagnostics", context: "LCP, INP, CLS optimization, and avoiding main-thread bottlenecks" },
    ],
  },
] as const;

export async function fetchSkillGroups(): Promise<SkillCategoryGroup[]> {
  const client = typeof window === "undefined"
    ? getSupabaseServerClient()
    : getSupabaseBrowserClient();

  if (!client) {
    return [...SEED_SKILL_GROUPS];
  }

  try {
    const { data, error } = await client
      .from("skills")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return [...SEED_SKILL_GROUPS];
    }

    // Group items by category_name
    const map = new Map<string, SkillItem[]>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const row of (data as any[])) {
      const cat = row.category_name || "General";
      const items = map.get(cat) || [];
      items.push({
        id: row.id,
        name: row.name,
        focus: row.focus,
        context: row.context,
        sortOrder: row.sort_order,
      });
      map.set(cat, items);
    }

    const groups: SkillCategoryGroup[] = [];
    for (const [categoryName, skills] of map.entries()) {
      const id = categoryName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      groups.push({
        id,
        categoryName,
        headline: `Technical proficiencies in ${categoryName.toLowerCase()}`,
        skills,
      });
    }

    return groups;
  } catch (err) {
    console.warn("Failed to fetch skills from Supabase:", err);
    return [...SEED_SKILL_GROUPS];
  }
}

export function getPlaceholderSkillGroups(): readonly SkillCategoryGroup[] {
  return SEED_SKILL_GROUPS;
}
