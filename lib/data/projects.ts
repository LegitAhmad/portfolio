/**
 * Application / Domain Data Access Layer for Projects.
 * 
 * Strict architectural rule:
 * - UI components consume this layer, never raw Supabase queries.
 * - Handles both server-side retrieval and client-side access.
 * - Gracefully produces intentional empty states when no data is found.
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface ProjectHeroMedia {
  type: "diagram" | "image" | "preview";
  caption?: string;
  badge?: string;
  accentColor?: string;
}

export interface ProjectTechnicalDetail {
  label: string;
  value: string;
}

export interface ProjectChallengeDecision {
  challenge: string;
  decision: string;
}

export interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  technologies: readonly string[];
  category: "Platform" | "Systems" | "Frontend" | "Tooling";
  featured: boolean;
  visible?: boolean;
  thumbnail?: string;
  githubUrl?: string;
  demoUrl?: string;
  githubRepoId?: number;
  githubRepoFullName?: string;
  githubStars?: number;
  githubForks?: number;
  githubPrimaryLanguage?: string;

  // Rich detail fields (rendered only if present)
  heroMedia?: ProjectHeroMedia;
  overview?: string;
  features?: readonly string[];
  technicalDetails?: readonly ProjectTechnicalDetail[];
  challengesDecisions?: readonly ProjectChallengeDecision[];
  status?: "Active" | "Completed" | "Prototype";
}

// Fallback seed records when Supabase is not yet connected
export const SEED_PROJECTS: readonly PortfolioProject[] = [
  {
    id: "proj-lms",
    slug: "lmsv2",
    title: "LMS Platform Engine",
    shortDescription:
      "Distributed learning management engine with real-time state synchronization and low-latency evaluation pipelines.",
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS", "Redis"],
    category: "Platform",
    featured: true,
    thumbnail: "/thumbnails/lms.png",
    githubUrl: "https://github.com/example/lmsv2",
    demoUrl: "https://lmsv2.example.com",
    status: "Active",
    heroMedia: {
      type: "diagram",
      caption: "Distributed evaluation and content delivery topology",
      badge: "Architecture Topology v2.4",
      accentColor: "#6a98ff",
    },
    overview:
      "LMSv2 was engineered to solve high-concurrency bottlenecking in real-time assessment environments. By isolating evaluation compute into stateless worker pools and synchronizing state over an event bus, the system maintains consistent sub-50ms response times during traffic spikes.",
    features: [
      "Stateless auto-scaling grading and evaluation worker cluster",
      "Real-time student collaboration and progress telemetry via WebSockets",
      "Fine-grained role-based permissions with PostgreSQL Row-Level Security (RLS)",
      "Automated edge caching of curriculum artifacts and assessment media",
    ],
    technicalDetails: [
      { label: "Target Latency", value: "< 50ms p95 API response" },
      { label: "State Sync", value: "Redis pub/sub with PostgreSQL WAL streaming" },
      { label: "Database Layer", value: "PostgreSQL with connection pooling (PgBouncer)" },
      { label: "Throughput", value: "Tested to 15,000 concurrent active sessions" },
    ],
    challengesDecisions: [
      {
        challenge: "Submitting simultaneous timed tests created extreme write-lock contention on central student attempt tables.",
        decision: "Decoupled attempt ingestion from score finalization using an append-only event log and idempotent workers.",
      },
      {
        challenge: "Client evaluation timeouts during intermittent user connectivity.",
        decision: "Implemented an offline-first transactional queue in IndexedDB with cryptographic proof of submission timestamp.",
      },
    ],
  },
  {
    id: "proj-desktop",
    slug: "desktop-runtime",
    title: "Desktop Runtime Environment",
    shortDescription:
      "Browser-based operating system shell featuring customizable window stacking, selective state stores, and pointer event virtualization.",
    technologies: ["React 19", "Next.js", "Zustand", "Motion", "Tailwind CSS"],
    category: "Frontend",
    featured: true,
    thumbnail: "/thumbnails/desktop.png",
    githubUrl: "https://github.com/example/desktop-runtime",
    demoUrl: "https://desktop-runtime.example.com",
    status: "Active",
    heroMedia: {
      type: "preview",
      caption: "Multi-window layout virtualization with 60fps interaction",
      badge: "Interactive Runtime",
      accentColor: "#34d399",
    },
    overview:
      "A personal developer portfolio implemented as a desktop environment running inside the browser. Built strictly with modern web primitives, it delivers window stacking, drag/resize physics, responsive taskbars, and deep application routing without third-party canvas wrappers.",
    features: [
      "Custom pointer-capture drag & 8-direction resize engine with viewport clamping",
      "Selective Zustand subscriptions preventing unneeded cross-window re-renders",
      "Decoupled application registry enabling clean extensibility for future apps",
      "Adaptive viewport layout switching to touch-friendly launcher grids on mobile",
    ],
    technicalDetails: [
      { label: "Frame Rate", value: "Steady 60fps on drag/resize" },
      { label: "State Pattern", value: "Normalized Zustand store with z-index normalization" },
      { label: "Bundle Impact", value: "Zero heavy drag libraries; native PointerEvent API" },
      { label: "Responsiveness", value: "Fluid desktop, tablet, and mobile near-fullscreen modes" },
    ],
    challengesDecisions: [
      {
        challenge: "Third-party drag-and-drop libraries caused layout thrashing and React 19 hydration issues.",
        decision: "Constructed a focused native PointerEvent interaction hook with viewport edge clamping and setPointerCapture.",
      },
      {
        challenge: "Unbounded z-index increments causing overflow or colliding with fixed overlays.",
        decision: "Implemented periodic z-index normalization keeping all windows tightly bounded between z-20 and z-39.",
      },
    ],
  },
  {
    id: "proj-telemetry",
    slug: "telemetry-metrics-daemon",
    title: "Telemetry Metrics Daemon",
    shortDescription:
      "High-throughput stream processing daemon aggregating core web vitals and edge application telemetry.",
    technologies: ["Go", "gRPC", "TimescaleDB", "Docker", "Prometheus"],
    category: "Systems",
    featured: false,
    githubUrl: "https://github.com/example/telemetry-metrics-daemon",
    status: "Active",
    overview:
      "A high-performance background daemon that ingests front-end web vital metrics, errors, and network timing beacons, batching them into partitioned time-series storage with zero memory allocations on the hot path.",
    features: [
      "Zero-allocation JSON and Protocol Buffer deserialization engine",
      "Adaptive flush intervals based on current buffer pressure and network throughput",
      "Integrated Prometheus metrics exporter and structured health probe endpoints",
    ],
    technicalDetails: [
      { label: "Ingestion Peak", value: "500,000 events per second per node" },
      { label: "Memory Footprint", value: "< 32MB steady-state RSS" },
      { label: "Transport", value: "HTTP/2 gRPC with fallback to POST beacons" },
    ],
    challengesDecisions: [
      {
        challenge: "High GC pause times when handling sudden telemetry bursts from high-traffic client errors.",
        decision: "Utilized sync.Pool buffers and reusable byte slices across ingestion workers, cutting GC pauses by 92%.",
      },
    ],
  },
  {
    id: "proj-flow",
    slug: "canvas-flow-editor",
    title: "Interactive Flow Graph Editor",
    shortDescription:
      "Infinite-canvas visual node editor for architectural modeling and distributed pipeline visualization.",
    technologies: ["TypeScript", "Canvas API", "WebGL", "Tailwind CSS"],
    category: "Frontend",
    featured: true,
    githubUrl: "https://github.com/example/canvas-flow-editor",
    demoUrl: "https://flow-editor.example.com",
    status: "Prototype",
    overview:
      "A GPU-accelerated spatial graph canvas designed for visualizing distributed service topologies and state machine diagrams. Implements spatial indexing for smooth exploration across tens of thousands of active nodes.",
    features: [
      "Infinite canvas with smooth pinch-to-zoom and momentum-based panning",
      "Spatial quadtree indexing allowing instant bounding box culling",
      "Bezier curve connection routing with collision avoidance algorithms",
    ],
    technicalDetails: [
      { label: "Canvas Engine", value: "HTML5 2D Context with WebGL fallback shaders" },
      { label: "Node Capacity", value: "10,000 interactive nodes at 60fps" },
    ],
  },
  {
    id: "proj-scaffold",
    slug: "cli-scaffold-orchestrator",
    title: "Developer Scaffold Orchestrator",
    shortDescription:
      "Command-line toolchain for opinionated monorepo bootstrapping, type contracts, and continuous delivery.",
    technologies: ["Node.js", "TypeScript", "Shell", "esbuild"],
    category: "Tooling",
    featured: false,
    githubUrl: "https://github.com/example/cli-scaffold-tool",
    status: "Completed",
    overview:
      "Automates microservice boilerplate generation, unified ESLint/TypeScript configurations, Docker compose profiles, and CI workflow pipelines for multi-package engineering monorepos.",
    features: [
      "Interactive CLI wizard with template generation based on architectural recipes",
      "Automated package dependency graph validation to prevent circular imports",
    ],
  },
] as const;

// Helper to map DB row into domain model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDatabaseRowToProject(row: any): PortfolioProject {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    category: row.category as PortfolioProject["category"],
    featured: Boolean(row.featured),
    status: row.status as PortfolioProject["status"],
    overview: row.overview || undefined,
    thumbnail: row.thumbnail_url || undefined,
    demoUrl: row.demo_url || undefined,
    githubUrl: row.github_url || undefined,
    githubRepoId: row.github_repo_id || undefined,
    githubRepoFullName: row.github_repo_full_name || undefined,
    githubStars: typeof row.github_stars === "number" ? row.github_stars : undefined,
    githubForks: typeof row.github_forks === "number" ? row.github_forks : undefined,
    githubPrimaryLanguage: row.github_primary_language || undefined,
    visible: row.visible !== undefined ? Boolean(row.visible) : true,
    technologies: Array.isArray(row.features) && row.features.length > 0 && typeof row.features[0] === "string" 
      ? (row.features as string[])
      : ["TypeScript", "Next.js"],
    features: Array.isArray(row.features) ? (row.features as string[]) : undefined,
    technicalDetails: Array.isArray(row.technical_details) ? row.technical_details : undefined,
    challengesDecisions: Array.isArray(row.challenges_decisions) ? row.challenges_decisions : undefined,
    heroMedia: row.hero_media || undefined,
  };
}

/**
 * Fetches all publicly visible projects from Supabase or fallback seeds.
 */
export async function fetchProjects(): Promise<PortfolioProject[]> {
  const client = typeof window === "undefined" 
    ? getSupabaseServerClient() 
    : getSupabaseBrowserClient();

  if (!client) {
    return [...SEED_PROJECTS];
  }

  try {
    const { data, error } = await client
      .from("projects")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true });

    if (error || !data) {
      console.warn("Supabase projects query returned error/null:", error?.message);
      return [];
    }

    return data.map(mapDatabaseRowToProject);
  } catch (err) {
    console.warn("Failed to query Supabase projects:", err);
    return [];
  }
}

/**
 * Fetches a single project by slug.
 */
export async function fetchProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  const client = typeof window === "undefined" 
    ? getSupabaseServerClient() 
    : getSupabaseBrowserClient();

  if (!client) {
    return SEED_PROJECTS.find((p) => p.slug === slug) || null;
  }

  try {
    const { data, error } = await client
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("visible", true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDatabaseRowToProject(data);
  } catch (err) {
    console.warn("Failed to query Supabase project by slug:", err);
    return null;
  }
}

// Synchronous helpers for client components / initial render
export function getAllProjects(): readonly PortfolioProject[] {
  return SEED_PROJECTS;
}

export function getFeaturedProjects(): readonly PortfolioProject[] {
  return SEED_PROJECTS.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): PortfolioProject | undefined {
  return SEED_PROJECTS.find((p) => p.slug === slug);
}

export function getProjectCategories(): readonly string[] {
  return ["All", "Platform", "Systems", "Frontend", "Tooling"];
}
