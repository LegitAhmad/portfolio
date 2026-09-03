/**
 * Normalization layer for GitHub API objects.
 * 
 * Strict architectural rule:
 * - Convert external GitHub API responses to domain models.
 * - Raw GitHub payloads must NEVER reach UI components.
 * - Extracts only useful fields and guarantees clean types.
 */

export interface NormalizedGitHubRepository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  topics: readonly string[];
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  isPrivate: boolean;
  isArchived: boolean;
  pushedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeRepository(raw: any): NormalizedGitHubRepository {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid GitHub repository payload: expected object");
  }

  const owner =
    typeof raw.owner === "object" && raw.owner !== null
      ? raw.owner.login || ""
      : typeof raw.owner === "string"
      ? raw.owner
      : "";

  const topics: string[] = Array.isArray(raw.topics)
    ? raw.topics.map((t: unknown) => String(t).toLowerCase())
    : [];

  return {
    id: Number(raw.id) || 0,
    name: String(raw.name || ""),
    fullName: String(raw.full_name || raw.name || ""),
    owner,
    description: raw.description ? String(raw.description).trim() : null,
    url: String(raw.html_url || raw.url || ""),
    homepage: raw.homepage ? String(raw.homepage).trim() : null,
    language: raw.language ? String(raw.language) : null,
    topics,
    stars: Number(raw.stargazers_count ?? raw.stars ?? 0),
    forks: Number(raw.forks_count ?? raw.forks ?? 0),
    openIssues: Number(raw.open_issues_count ?? raw.open_issues ?? 0),
    defaultBranch: String(raw.default_branch || "main"),
    isPrivate: Boolean(raw.private),
    isArchived: Boolean(raw.archived),
    pushedAt: raw.pushed_at ? new Date(raw.pushed_at).toISOString() : null,
    createdAt: raw.created_at ? new Date(raw.created_at).toISOString() : null,
    updatedAt: raw.updated_at ? new Date(raw.updated_at).toISOString() : null,
  };
}
