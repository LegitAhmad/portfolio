/**
 * Application / Domain Data Access Layer for Links & Online Presence.
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface ExternalLinkItem {
  id: string;
  title: string;
  category: string;
  handlePlaceholder: string;
  urlPlaceholder: string;
  description: string;
  verified: boolean;
  visible?: boolean;
  type: "github" | "linkedin" | "x" | "email" | "rss";
}

export const SEED_LINKS: readonly ExternalLinkItem[] = [
  {
    id: "link-github",
    title: "GitHub",
    category: "Code & Contributions",
    handlePlaceholder: "@portfolio-developer",
    urlPlaceholder: "https://github.com",
    description: "Open source repositories, architectural templates, and engineering experiments.",
    verified: true,
    visible: true,
    type: "github",
  },
  {
    id: "link-linkedin",
    title: "LinkedIn",
    category: "Professional Network",
    handlePlaceholder: "in/portfolio-developer",
    urlPlaceholder: "https://linkedin.com",
    description: "Career timeline, corporate milestones, and professional network updates.",
    verified: true,
    visible: true,
    type: "linkedin",
  },
  {
    id: "link-x",
    title: "X (Twitter)",
    category: "Discussions",
    handlePlaceholder: "@developer_dev",
    urlPlaceholder: "https://x.com",
    description: "Short-form technical commentary, architectural takeaways, and engineering links.",
    verified: true,
    visible: true,
    type: "x",
  },
  {
    id: "link-email",
    title: "Direct Email",
    category: "Direct Communication",
    handlePlaceholder: "contact@developer.internal",
    urlPlaceholder: "mailto:contact@developer.internal",
    description: "Direct channel for architectural consultation, queries, and project inquiries.",
    verified: true,
    visible: true,
    type: "email",
  },
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDatabaseRowToLink(row: any): ExternalLinkItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    handlePlaceholder: row.handle,
    urlPlaceholder: row.url,
    description: row.description,
    verified: Boolean(row.verified),
    visible: row.visible !== undefined ? Boolean(row.visible) : true,
    type: (row.type as ExternalLinkItem["type"]) || "github",
  };
}

export async function fetchLinks(): Promise<ExternalLinkItem[]> {
  const client = typeof window === "undefined"
    ? getSupabaseServerClient()
    : getSupabaseBrowserClient();

  if (!client) {
    return [...SEED_LINKS];
  }

  try {
    const { data, error } = await client
      .from("links")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true });

    if (error || !data) {
      console.warn("Supabase links query error:", error?.message);
      return [...SEED_LINKS];
    }

    return data.map(mapDatabaseRowToLink);
  } catch (err) {
    console.warn("Failed to query Supabase links:", err);
    return [...SEED_LINKS];
  }
}

export function getPlaceholderLinks(): readonly ExternalLinkItem[] {
  return SEED_LINKS;
}
