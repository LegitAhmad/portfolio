/**
 * Application / Domain Data Access Layer for Experience Timeline.
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface ExperienceRecord {
  id: string;
  roleTitle: string;
  companyPlaceholder: string;
  location: string;
  timeframe: string;
  isCurrent: boolean;
  summary: string;
  achievements: readonly string[];
  technologies: readonly string[];
}

export const SEED_EXPERIENCE: readonly ExperienceRecord[] = [
  {
    id: "exp-1",
    roleTitle: "Staff Software Engineer (Placeholder)",
    companyPlaceholder: "Platform Infrastructure Inc.",
    location: "Remote",
    timeframe: "2024 — Present",
    isCurrent: true,
    summary:
      "Led the architectural migration of core customer-facing applications toward event-driven micro-frontends, reducing critical p99 page latency by 45%.",
    achievements: [
      "Engineered an edge-cached routing layer handling 250M+ requests per month with 99.99% reliability.",
      "Established strict type safety standards across 8 engineering squads.",
      "Mentored senior engineers in distributed systems design, observability, and performance optimization.",
    ],
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Go", "Vercel", "Kafka"],
  },
  {
    id: "exp-2",
    roleTitle: "Senior Software Engineer (Placeholder)",
    companyPlaceholder: "Enterprise Cloud Systems",
    location: "San Francisco, CA (Hybrid)",
    timeframe: "2021 — 2024",
    isCurrent: false,
    summary:
      "Spearheaded real-time collaboration services and graphical workflow visualization tools for enterprise cloud monitoring dashboards.",
    achievements: [
      "Built a high-performance WebGL canvas rendering 50,000 live telemetry nodes with smooth 60fps interaction.",
      "Architected secure role-based access control (RBAC) and row-level security (RLS) policies for multi-tenant data isolation.",
      "Reduced CI build times from 18 minutes to 3.5 minutes by introducing incremental dependency caching.",
    ],
    technologies: ["React", "Node.js", "GraphQL", "Docker", "Redis", "Tailwind CSS"],
  },
  {
    id: "exp-3",
    roleTitle: "Software Engineer (Placeholder)",
    companyPlaceholder: "Digital Systems Studio",
    location: "Boston, MA",
    timeframe: "2019 — 2021",
    isCurrent: false,
    summary:
      "Developed responsive customer portals, billing integration pipelines, and custom administrative interfaces.",
    achievements: [
      "Implemented resilient payment gateways with idempotent webhook validation and automated retry queues.",
      "Refactored legacy single-page applications into modular component libraries with automated end-to-end testing.",
    ],
    technologies: ["TypeScript", "React", "PostgreSQL", "Jest", "Tailwind CSS"],
  },
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDatabaseRowToExperience(row: any): ExperienceRecord {
  return {
    id: row.id,
    roleTitle: row.role_title,
    companyPlaceholder: row.company_name,
    location: row.location,
    timeframe: row.timeframe,
    isCurrent: Boolean(row.is_current),
    summary: row.summary,
    achievements: Array.isArray(row.achievements) ? row.achievements : [],
    technologies: Array.isArray(row.technologies) ? row.technologies : [],
  };
}

export async function fetchExperience(): Promise<ExperienceRecord[]> {
  const client = typeof window === "undefined"
    ? getSupabaseServerClient()
    : getSupabaseBrowserClient();

  if (!client) {
    return [...SEED_EXPERIENCE];
  }

  try {
    const { data, error } = await client
      .from("experience")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data) {
      console.warn("Supabase experience query error:", error?.message);
      return [];
    }

    return data.map(mapDatabaseRowToExperience);
  } catch (err) {
    console.warn("Failed to query Supabase experience:", err);
    return [];
  }
}

export function getPlaceholderExperience(): readonly ExperienceRecord[] {
  return SEED_EXPERIENCE;
}
