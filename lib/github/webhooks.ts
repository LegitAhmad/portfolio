/**
 * Server-side GitHub Webhook signature verification and event processing.
 * 
 * Rules:
 * - Constant-time timing-safe HMAC-SHA256 signature verification.
 * - Handle only relevant event types: push, repository, star.
 * - Decouple: Updates GitHub stats, never overwrites curated editorial fields.
 * - Designed within Vercel execution constraints (fast asynchronous DB updates).
 */

import crypto from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeRepository } from "./normalize";
import type { Json } from "@/lib/supabase/types";

/**
 * Validates the HMAC-SHA256 signature provided in the `x-hub-signature-256` header.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | null = process.env.GITHUB_WEBHOOK_SECRET || null
): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  // Header format is "sha256=<hex_digest>"
  const parts = signatureHeader.split("=");
  if (parts.length !== 2 || parts[0] !== "sha256") {
    return false;
  }

  const signatureHash = parts[1];

  try {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(rawBody);
    const expectedHash = hmac.digest("hex");

    const expectedBuffer = Buffer.from(expectedHash, "hex");
    const signatureBuffer = Buffer.from(signatureHash, "hex");

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (err) {
    console.warn("Error during timingSafeEqual signature check:", err);
    return false;
  }
}

export async function handleWebhookEvent(
  event: string,
  payload: Record<string, unknown>
): Promise<{ handled: boolean; action?: string; error?: string }> {
  if (!payload || typeof payload !== "object") {
    return { handled: false, error: "Invalid webhook payload" };
  }

  const supabase = getSupabaseServerClient(true);
  if (!supabase) {
    return { handled: false, error: "Database client unavailable" };
  }

  try {
    switch (event) {
      case "push": {
        const repo = payload.repository as Record<string, unknown> | undefined;
        if (!repo || !repo.id) return { handled: false, error: "Missing repository in push payload" };

        const repoId = Number(repo.id);
        const pushedAt = repo.pushed_at ? new Date(String(repo.pushed_at)).toISOString() : new Date().toISOString();

        // Update repository cache
        await supabase
          .from("github_repositories")
          .update({
            pushed_at: pushedAt,
            synced_at: new Date().toISOString(),
          })
          .eq("id", repoId);

        // Update associated project stats (editorial separation preserved)
        await supabase
          .from("projects")
          .update({
            github_last_pushed_at: pushedAt,
            github_synced_at: new Date().toISOString(),
          })
          .eq("github_repo_id", repoId);

        return { handled: true, action: "push_updated" };
      }

      case "repository": {
        const action = String(payload.action || "");
        const repoRaw = payload.repository as Record<string, unknown> | undefined;
        if (!repoRaw || !repoRaw.id) return { handled: false, error: "Missing repository payload" };

        const repo = normalizeRepository(repoRaw);

        if (action === "deleted") {
          // Remove from github_repositories cache and unlink from projects
          await supabase.from("github_repositories").delete().eq("id", repo.id);
          await supabase
            .from("projects")
            .update({
              github_repo_id: null,
              github_repo_full_name: null,
            })
            .eq("github_repo_id", repo.id);

          return { handled: true, action: "repository_deleted" };
        }

        // Handle edited, renamed, archived, unarchived
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
            synced_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

        // Update linked project stats without overwriting curated editorial fields
        await supabase
          .from("projects")
          .update({
            github_repo_full_name: repo.fullName,
            github_url: repo.url,
            github_stars: repo.stars,
            github_forks: repo.forks,
            github_primary_language: repo.language,
            github_topics: [...repo.topics] as unknown as Json,
            github_last_pushed_at: repo.pushedAt,
            github_synced_at: new Date().toISOString(),
            status: repo.isArchived ? "Completed" : "Active",
          })
          .eq("github_repo_id", repo.id);

        return { handled: true, action: `repository_${action}` };
      }

      case "star": {
        const repo = payload.repository as Record<string, unknown> | undefined;
        if (!repo || !repo.id) return { handled: false };

        const repoId = Number(repo.id);
        const starsCount = Number(repo.stargazers_count ?? 0);

        await supabase
          .from("github_repositories")
          .update({ stars_count: starsCount })
          .eq("id", repoId);

        await supabase
          .from("projects")
          .update({ github_stars: starsCount })
          .eq("github_repo_id", repoId);

        return { handled: true, action: "star_updated" };
      }

      default:
        // Ignore unhandled event types gracefully
        return { handled: false, action: `ignored_${event}` };
    }
  } catch (err) {
    console.warn(`Webhook error handling event [${event}]:`, err);
    return { handled: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
