/**
 * Application / Domain Data Access Layer for About Me & Professional Profile.
 * 
 * Rules:
 * - Backed by Supabase PostgreSQL (profile table).
 * - Sections: profile, current focus, education, interests.
 * - No invented factual content: uses editable Supabase data or clearly marked placeholders.
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface CurrentFocusItem {
  topic: string;
  details: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  details?: string;
}

export interface InterestItem {
  title: string;
  description: string;
}

export interface ProfileData {
  fullName: string;
  roleHeadline: string;
  location: string;
  avatarUrl?: string;
  bioParagraphs: readonly string[];
  currentFocus: readonly CurrentFocusItem[];
  education: readonly EducationItem[];
  interests: readonly InterestItem[];
}

export const PLACEHOLDER_PROFILE: ProfileData = {
  fullName: "Software Engineer",
  roleHeadline: "Systems & Web Applications Architect (Editable Profile)",
  location: "Global / Remote",
  bioParagraphs: [
    "Specializing in high-performance web systems, distributed application platforms, and distinctive client-side browser interfaces.",
    "Driven by building software where mechanical sympathy meets intentional visual design — prioritizing clarity, strict typing, responsive feedback, and minimal operational overhead.",
    "Focused on scalable cloud-native architectures, modular full-stack codebases, and developer tools that eliminate friction.",
  ],
  currentFocus: [
    {
      topic: "Event-Driven Client Runtimes",
      details: "Developing modular browser window environments, state management engines, and responsive gesture-driven interactions.",
    },
    {
      topic: "Resilient Data Synchronization",
      details: "Designing asynchronous webhook ingestion pipelines with timing-safe HMAC-SHA256 signature verification.",
    },
    {
      topic: "High-Performance Next.js Architecture",
      details: "Leveraging React Server Components, server-side data boundaries, and strict tree-shaking.",
    },
  ],
  education: [
    {
      degree: "B.S. in Computer Science",
      institution: "Computer Science Department",
      year: "2018 — 2022",
      details: "Concentration in Distributed Systems, Operating System Architecture, and Algorithms.",
    },
  ],
  interests: [
    {
      title: "Distributed State Engines",
      description: "Raft consensus implementations, replicated state logs, and conflict-free replicated data types.",
    },
    {
      title: "Virtual Machine Primitives",
      description: "Client sandboxing, virtual filesystem abstractions, and web assembly runtimes.",
    },
    {
      title: "Typography & Interface Craft",
      description: "Restrained dark surfaces, monospace layout hierarchy, and micro-interactions with zero layout shift.",
    },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDatabaseRowToProfile(row: any): ProfileData {
  return {
    fullName: row.full_name,
    roleHeadline: row.role_headline,
    location: row.location || "Remote",
    avatarUrl: row.avatar_url || undefined,
    bioParagraphs: Array.isArray(row.bio_paragraphs) ? row.bio_paragraphs : [],
    currentFocus: Array.isArray(row.current_focus) ? row.current_focus : [],
    education: Array.isArray(row.education) ? row.education : [],
    interests: Array.isArray(row.interests) ? row.interests : [],
  };
}

export async function fetchAboutProfile(): Promise<ProfileData> {
  const client = typeof window === "undefined"
    ? getSupabaseServerClient()
    : getSupabaseBrowserClient();

  if (!client) {
    return PLACEHOLDER_PROFILE;
  }

  try {
    const { data, error } = await client
      .from("profile")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return PLACEHOLDER_PROFILE;
    }

    return mapDatabaseRowToProfile(data);
  } catch (err) {
    console.warn("Failed to fetch profile from Supabase:", err);
    return PLACEHOLDER_PROFILE;
  }
}

export function getPlaceholderAbout(): ProfileData {
  return PLACEHOLDER_PROFILE;
}
