/**
 * Server-only GitHub API HTTP client.
 * 
 * Rules:
 * - Strictly server-only.
 * - Authenticates requests via installation access tokens.
 * - Handles rate limits, timeouts, and connection failures gracefully.
 */

import { getInstallationAccessToken } from "./app";

const GITHUB_API_BASE = "https://api.github.com";

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

/**
 * Performs an authenticated HTTP request to the GitHub REST API.
 */
export async function fetchGitHub<T = unknown>(
  endpoint: string,
  init: RequestInit = {}
): Promise<T | null> {
  if (typeof window !== "undefined") {
    throw new Error("fetchGitHub cannot be invoked from client components.");
  }

  const token = await getInstallationAccessToken();
  if (!token) {
    console.warn("GitHub App installation token is not available.");
    return null;
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${GITHUB_API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "Portfolio-GitHub-Sync/1.0",
    "X-GitHub-Api-Version": "2022-11-28",
    ...((init.headers as Record<string, string>) || {}),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`GitHub API error on [${url}] (${response.status}):`, errorText);
      return null;
    }

    // If 204 No Content
    if (response.status === 204) {
      return null;
    }

    return (await response.json()) as T;
  } catch (err) {
    console.warn(`GitHub API request failed for [${url}]:`, err);
    return null;
  }
}
