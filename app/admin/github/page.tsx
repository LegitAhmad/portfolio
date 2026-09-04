"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface DiscoveredRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  isPrivate: boolean;
  isArchived: boolean;
  pushedAt: string | null;
}

export default function AdminGitHubPage() {
  const router = useRouter();
  const [repos, setRepos] = useState<DiscoveredRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadRepos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/github/repositories");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.repositories)) {
        setRepos(data.repositories);
      } else {
        setError(data.error || "Could not load accessible repositories");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load repositories");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    fetch("/api/github/repositories")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!active || !data) return;
        if (data.success && Array.isArray(data.repositories)) {
          setRepos(data.repositories);
        } else {
          setError(data.error || "Could not load accessible repositories");
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load repositories");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const handleImport = async (repo: DiscoveredRepo) => {
    setImportingId(repo.id);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/github/repositories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import",
          repoId: repo.id,
          options: {
            customTitle: repo.name,
            customDescription: repo.description || undefined,
            visible: false, // Strict rule: Imported repositories default to hidden
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          `Repository "${repo.fullName}" imported successfully with visibility set to Hidden. You can now curate its editorial fields.`
        );
        if (data.projectId) {
          setTimeout(() => {
            router.push(`/admin/projects/${data.projectId}`);
          }, 1200);
        }
      } else {
        setError(data.error || "Failed to import repository");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error during import");
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">GitHub Repositories</h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Discover accessible repositories, import them into your portfolio, and synchronize metadata.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRepos}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-[#212631] hover:bg-[#2d3748] text-xs font-medium text-white border border-[#30363d] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
        >
          <span>↻</span>
          <span>Refresh Repositories</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
          {successMsg}
        </div>
      )}

      <div className="p-4 rounded-xl bg-[#12161f] border border-[#212631] text-xs space-y-2">
        <div className="flex items-center gap-2 text-white font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Server-Only GitHub App Integration</span>
        </div>
        <p className="text-[#8b949e]">
          The portfolio uses a secure GitHub App with read-only repository permissions.
          Imported repositories are created with <strong>visible = false</strong> by default so you can curate title, architectural overview, and screenshots before making them public.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-xs text-[#8b949e]">
          <div className="animate-spin w-5 h-5 border-2 border-[#4e95ff] border-t-transparent rounded-full mr-2" />
          Discovering accessible repositories...
        </div>
      ) : repos.length === 0 ? (
        <div className="bg-[#12161f] border border-[#212631] rounded-xl p-8 text-center space-y-3">
          <p className="text-sm text-[#8b949e]">
            No accessible repositories discovered. Ensure your GitHub App has repository permissions and is installed on your account or organization.
          </p>
        </div>
      ) : (
        <div className="bg-[#12161f] border border-[#212631] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0c10]/60 border-b border-[#212631] text-[#8b949e] font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Repository</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Topics</th>
                  <th className="py-3 px-4 text-center">Stars</th>
                  <th className="py-3 px-4 text-center">Forks</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212631]/60">
                {repos.map((repo) => (
                  <tr key={repo.id} className="hover:bg-[#1a202c]/50 transition-colors">
                    <td className="py-3 px-4">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-white hover:text-[#4e95ff] transition-colors flex items-center gap-1"
                      >
                        <span>{repo.fullName}</span>
                        <span className="text-[10px] text-[#8b949e]">↗</span>
                      </a>
                      <div className="text-[10px] font-mono text-[#8b949e]">
                        Branch: {repo.defaultBranch}
                        {repo.isPrivate && <span className="ml-2 text-amber-400">Private</span>}
                        {repo.isArchived && <span className="ml-2 text-rose-400">Archived</span>}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-[#8b949e]">
                      {repo.description || <span className="italic text-[#484f58]">No description</span>}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-white">
                      {repo.language || "—"}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {repo.topics.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded bg-[#212631] text-[9px] font-mono text-[#8b949e]"
                          >
                            {t}
                          </span>
                        ))}
                        {repo.topics.length > 3 && (
                          <span className="text-[9px] text-[#8b949e]">+{repo.topics.length - 3}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-amber-400">
                      ★ {repo.stars}
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-[#8b949e]">
                      ⑂ {repo.forks}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleImport(repo)}
                        disabled={importingId === repo.id}
                        className="px-3 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {importingId === repo.id ? "Importing..." : "Import as Project"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
