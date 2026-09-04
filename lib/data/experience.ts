/**
 * Application / Domain Data Access Layer for Experience Timeline.
 * 
 * Rules:
 * - Support: organization, role, start, end, description, highlights, technologies.
 * - Backed by Supabase PostgreSQL (experience table).
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface ExperienceRecord {
  id: string;
  organization: string;
  role: string;
  start: string;
  end: string;
  timeframe: string;
  location: string;
  isCurrent: boolean;
  description: string;
  highlights: readonly string[];
  technologies: readonly string[];

  // Compatibility aliases
  roleTitle?: string;
  companyPlaceholder?: string;
  summary?: string;
  achievements?: readonly string[];
}

export const SEED_EXPERIENCE: readonly ExperienceRecord[] = [
  {
    id: "exp-1",
    organization: "Platform Infrastructure Inc.",
    role: "Staff Software Engineer (Placeholder)",
    start: "2024",
    end: "Present",
    timeframe: "2024 — Present",
    location: "Remote",
    isCurrent: true,
    description:
      "Led the architectural migration of core customer-facing applications toward event-driven micro-frontends, reducing critical p99 page latency by 45%.",
    highlights: [
      "Engineered an edge-cached routing layer handling 250M+ requests per month with 99.99% reliability.",
      "Established strict type safety standards across 8 engineering squads.",
      "Mentored senior engineers in distributed systems design, observability, and performance optimization.",
    ],
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Go", "Vercel", "Kafka"],
    roleTitle: "Staff Software Engineer (Placeholder)",
    companyPlaceholder: "Platform Infrastructure Inc.",
    summary:
      "Led the architectural migration of core customer-facing applications toward event-driven micro-frontends, reducing critical p99 page latency by 45%.",
    achievements: [
      "Engineered an edge-cached routing layer handling 250M+ requests per month with 99.99% reliability.",
      "Established strict type safety standards across 8 engineering squads.",
      "Mentored senior engineers in distributed systems design, observability, and performance optimization.",
    ],
  },
  {
    id: "exp-2",
    organization: "Enterprise Cloud Systems",
    role: "Senior Software Engineer (Placeholder)",
    start: "2021",
    end: "2024",
    timeframe: "2021 — 2024",
    location: "San Francisco, CA (Hybrid)",
    isCurrent: false,
    description:
      "Spearheaded real-time collaboration services and graphical workflow visualization tools for enterprise cloud monitoring dashboards.",
    highlights: [
      "Built a high-performance WebGL canvas rendering 50,000 live telemetry nodes with smooth 60fps interaction.",
      "Architected secure role-based access control (RBAC) and row-level security (RLS) policies for multi-tenant data isolation.",
      "Reduced CI build times from 18 minutes to 3.5 minutes by introducing incremental dependency caching.",
    ],
    technologies: ["React", "Node.js", "GraphQL", "Docker", "Redis", "Tailwind CSS"],
    roleTitle: "Senior Software Engineer (Placeholder)",
    companyPlaceholder: "Enterprise Cloud Systems",
    summary:
      "Spearheaded real-time collaboration services and graphical workflow visualization tools for enterprise cloud monitoring dashboards.",
    achievements: [
      "Built a high-performance WebGL canvas rendering 50,000 live telemetry nodes with smooth 60fps interaction.",
      "Architected secure role-based access control (RBAC) and row-level security (RLS) policies for multi-tenant data isolation.",
      "Reduced CI build times from 18 minutes to 3.5 minutes by introducing incremental dependency caching.",
    ],
  },
  {
    id: "exp-3",
    organization: "Digital Systems Studio",
    role: "Software Engineer (Placeholder)",
    start: "2019",
    end: "2021",
    timeframe: "2019 — 2021",
    location: "Boston, MA",
    isCurrent: false,
    description:
      "Developed responsive customer portals, billing integration pipelines, and custom administrative interfaces.",
    highlights: [
      "Implemented resilient payment gateways with idempotent webhook validation and automated retry queues.",
      "Refactored legacy single-page applications into modular component libraries with automated end-to-end testing.",
    ],
    technologies: ["TypeScript", "React", "PostgreSQL", "Jest", "Tailwind CSS"],
    roleTitle: "Software Engineer (Placeholder)",
    companyPlaceholder: "Digital Systems Studio",
    summary:
      "Developed responsive customer portals, billing integration pipelines, and custom administrative interfaces.",
    achievements: [
      "Implemented resilient payment gateways with idempotent webhook validation and automated retry queues.",
      "Refactored legacy single-page applications into modular component libraries with automated end-to-end testing.",
    ],
  },
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDatabaseRowToExperience(row: any): ExperienceRecord {
  const timeframeParts = String(row.timeframe || "").split("—").map((s) => s.trim());
  const start = row.start_date || timeframeParts[0] || "";
  const end = row.is_current ? "Present" : row.end_date || timeframeParts[1] || "";
  const achievements = Array.isArray(row.achievements) ? (row.achievements as string[]) : [];
  const technologies = Array.isArray(row.technologies) ? (row.technologies as string[]) : [];

  return {
    id: row.id,
    organization: row.company_name,
    role: row.role_title,
    start,
    end,
    timeframe: row.timeframe,
    location: row.location || "Remote",
    isCurrent: Boolean(row.is_current),
    description: row.summary,
    highlights: achievements,
    technologies,
    roleTitle: row.role_title,
    companyPlaceholder: row.company_name,
    summary: row.summary,
    achievements,
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
      return [...SEED_EXPERIENCE];
    }

    return data.map(mapDatabaseRowToExperience);
  } catch (err) {
    console.warn("Failed to fetch experience from Supabase:", err);
    return [...SEED_EXPERIENCE];
  }
}

export function getPlaceholderExperience(): readonly ExperienceRecord[] {
  return SEED_EXPERIENCE;
}
