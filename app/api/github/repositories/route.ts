import { NextResponse } from "next/server";
import {
  discoverAccessibleRepositories,
  listCachedRepositories,
  importRepositoryToProject,
  associateRepositoryWithProject,
} from "@/lib/github/repositories";

/**
 * Server endpoint for discovering and importing GitHub repositories.
 * 
 * Rules:
 * - Server-only.
 * - Discovers repositories accessible through the GitHub App installation.
 * - Imports repositories with `visible = false` by default.
 */
export async function GET() {
  try {
    const repos = await discoverAccessibleRepositories();
    return NextResponse.json({ success: true, repositories: repos });
  } catch (err) {
    console.warn("Failed to discover GitHub repositories:", err);
    // Fall back to cached repositories if GitHub is unreachable
    const cached = await listCachedRepositories();
    return NextResponse.json({ success: true, repositories: cached, fallback: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, repoId, projectId, options } = body;

    if (!repoId) {
      return NextResponse.json({ error: "Missing repoId" }, { status: 400 });
    }

    if (action === "associate") {
      if (!projectId) {
        return NextResponse.json({ error: "Missing projectId for associate action" }, { status: 400 });
      }

      const result = await associateRepositoryWithProject(Number(repoId), String(projectId));
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    // Default action: import
    const result = await importRepositoryToProject(Number(repoId), options || {});
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err) {
    console.warn("Error in repository management POST handler:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 500 }
    );
  }
}
