/**
 * Server-side Repository synchronization and management.
 * 
 * Strict architectural rules:
 * - Discover accessible repositories through the GitHub App.
 * - Cache repositories in Supabase; never query GitHub on visitor page loads.
 * - Imported repositories must NOT automatically become public (default: visible = false).
 * - Editorial separation: GitHub sync updates stats (stars, forks, topics, language),
 *   never overwriting curated editorial descriptions, overviews, or titles.
 */

import { fetchGitHub } from "./client";
import { normalizeRepository, type NormalizedGitHubRepository } from "./normalize";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

interface GitHubInstallReposResponse {
  total_count: number;
  repositories: unknown[];
}

/**
 * Discovers all repositories accessible to the GitHub App installation.
 * Normalizes results and caches them in the `github_repositories` table.
 */
export async function discoverAccessibleRepositories(): Promise<NormalizedGitHubRepository[]> {
  if (typeof window !== "undefined") {
    throw new Error("discoverAccessibleRepositories is server-only.");
  }

  const data = await fetchGitHub<GitHubInstallReposResponse>("/installation/repositories?per_page=100");

  if (!data || !Array.isArray(data.repositories)) {
    console.warn("Could not retrieve repositories from GitHub API. Checking database cache...");
    return listCachedRepositories();
  }

  const normalized = data.repositories.map(normalizeRepository);

  // Sync to database cache if server client is available
  const supabase = getSupabaseServerClient(true);
  if (supabase) {
    for (const repo of normalized) {
      try {
        await supabase.from("github_repositories").upsert(
          {
            id: repo.id,
            name: repo.name,
            full_name: repo.fullName,
            owner_login: repo.owner,
            html_url: repo.url,
            description: repo.description,
            homepage: repo.homepage,
            language: repo.language,
            topics: [...repo.topics] as unknown as Json,
            stars_count: repo.stars,
            forks_count: repo.forks,
            open_issues_count: repo.openIssues,
            default_branch: repo.defaultBranch,
            is_private: repo.isPrivate,
            is_archived: repo.isArchived,
            pushed_at: repo.pushedAt,
            created_at_github: repo.createdAt,
            updated_at_github: repo.updatedAt,
            synced_at: new Date().toISOString(),
            // visible is NOT updated on re-sync to preserve manual editorial visibility
          },
          { onConflict: "id", ignoreDuplicates: false }
        );
      } catch (err) {
        console.warn(`Failed to cache repository [${repo.fullName}]:`, err);
      }
    }
  }

  return normalized;
}

/**
 * Returns cached repositories from the Supabase persistence layer.
 */
export async function listCachedRepositories(): Promise<NormalizedGitHubRepository[]> {
  const supabase = getSupabaseServerClient(true);
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("github_repositories")
      .select("*")
      .order("stars_count", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      fullName: row.full_name,
      owner: row.owner_login,
      description: row.description,
      url: row.html_url,
      homepage: row.homepage,
      language: row.language,
      topics: Array.isArray(row.topics) ? (row.topics as string[]) : [],
      stars: row.stars_count,
      forks: row.forks_count,
      openIssues: row.open_issues_count,
      defaultBranch: row.default_branch,
      isPrivate: row.is_private,
      isArchived: row.is_archived,
      pushedAt: row.pushed_at,
      createdAt: row.created_at_github,
      updatedAt: row.updated_at_github,
    }));
  } catch (err) {
    console.warn("Failed to query cached github_repositories:", err);
    return [];
  }
}

export interface ImportOptions {
  projectSlug?: string;
  category?: "Platform" | "Systems" | "Frontend" | "Tooling";
  customTitle?: string;
  customDescription?: string;
  visible?: boolean;
}

/**
 * Imports a GitHub repository as a portfolio project.
 * 
 * Strict rules:
 * - Default visibility is strictly `false` (must not automatically become public).
 * - Preserves editorial distinction between GitHub metadata and curated fields.
 */
export async function importRepositoryToProject(
  repoId: number,
  options: ImportOptions = {}
): Promise<{ success: boolean; projectId?: string; error?: string }> {
  const supabase = getSupabaseServerClient(true);
  if (!supabase) {
    return { success: false, error: "Database client unavailable" };
  }

  // 1. Fetch repository from cache or API
  const cachedRepos = await listCachedRepositories();
  let repo = cachedRepos.find((r) => r.id === repoId);

  if (!repo) {
    const discovered = await discoverAccessibleRepositories();
    repo = discovered.find((r) => r.id === repoId);
  }

  if (!repo) {
    return { success: false, error: `Repository ID ${repoId} not found or inaccessible` };
  }

  const slug = (
    options.projectSlug ||
    repo.name.toLowerCase().replace(/[^a-z0-9_-]/g, "-")
  ).slice(0, 48);

  const title = options.customTitle || repo.name;
  const description = options.customDescription || repo.description || "Project imported from GitHub repository.";
  const category = options.category || "Tooling";

  // Visibility: Default is strictly FALSE unless explicitly set
  const visible = Boolean(options.visible ?? false);

  try {
    // 2. Insert or update project while keeping editorial separation
    const { data: project, error: projError } = await supabase
      .from("projects")
      .upsert(
        {
          slug,
          title,
          short_description: description,
          category,
          featured: false,
          visible, // Enforce explicit editorial visibility
          status: repo.isArchived ? "Completed" : "Active",
          github_url: repo.url,
          demo_url: repo.homepage || undefined,
          github_repo_id: repo.id,
          github_repo_full_name: repo.fullName,
          github_stars: repo.stars,
          github_forks: repo.forks,
          github_primary_language: repo.language,
          github_topics: [...repo.topics] as unknown as Json,
          github_last_pushed_at: repo.pushedAt,
          github_synced_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (projError || !project) {
      return { success: false, error: projError?.message || "Failed to create project record" };
    }

    // 3. Link repository row to project
    await supabase
      .from("github_repositories")
      .update({
        project_id: project.id,
        visible,
      })
      .eq("id", repo.id);

    return { success: true, projectId: project.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error during import" };
  }
}

/**
 * Associates an existing portfolio project with a GitHub repository.
 * Strictly respects editorial separation: updates GitHub stats only.
 */
export async function associateRepositoryWithProject(
  repoId: number,
  projectId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseServerClient(true);
  if (!supabase) {
    return { success: false, error: "Database client unavailable" };
  }

  const cachedRepos = await listCachedRepositories();
  const repo = cachedRepos.find((r) => r.id === repoId);

  if (!repo) {
    return { success: false, error: `Repository ${repoId} not found in cache` };
  }

  try {
    // Update project stats without touching curated editorial fields
    const { error: projError } = await supabase
      .from("projects")
      .update({
        github_repo_id: repo.id,
        github_repo_full_name: repo.fullName,
        github_url: repo.url,
        github_stars: repo.stars,
        github_forks: repo.forks,
        github_primary_language: repo.language,
        github_topics: [...repo.topics] as unknown as Json,
        github_last_pushed_at: repo.pushedAt,
        github_synced_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (projError) {
      return { success: false, error: projError.message };
    }

    // Update repository row link
    await supabase
      .from("github_repositories")
      .update({ project_id: projectId })
      .eq("id", repoId);

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
