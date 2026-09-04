"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  featured: boolean;
  visible: boolean;
  sort_order: number;
  thumbnail_url: string | null;
  github_repo_full_name: string | null;
  github_stars: number;
  github_synced_at: string | null;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchProjects = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/projects");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      } else {
        setError(data.error || "Failed to load projects");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching projects");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/projects")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!active || !data) return;
        if (data.success) setProjects(data.projects);
        else setError(data.error || "Failed to load projects");
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Error fetching projects");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, visible: !current }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, visible: !current } : p))
        );
      }
    } catch (err) {
      console.warn("Failed to toggle visibility:", err);
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, featured: !current }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, featured: !current } : p))
        );
      }
    } catch (err) {
      console.warn("Failed to toggle featured:", err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete project "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.warn("Failed to delete project:", err);
    }
  };

  const moveOrder = async (id: string, direction: "up" | "down", currentIndex: number) => {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const currentProj = projects[currentIndex];
    const targetProj = projects[targetIndex];

    try {
      await Promise.all([
        fetch("/api/admin/projects", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: currentProj.id, sort_order: targetProj.sort_order }),
        }),
        fetch("/api/admin/projects", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: targetProj.id, sort_order: currentProj.sort_order }),
        }),
      ]);
      fetchProjects();
    } catch (err) {
      console.warn("Failed to reorder:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Projects Management</h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Manage portfolio projects, visibility, featured status, and GitHub associations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/github"
            className="px-3 py-2 rounded-lg bg-[#212631] hover:bg-[#2d3748] text-xs font-medium text-white border border-[#30363d] transition-colors flex items-center gap-1.5"
          >
            <span>★</span>
            <span>Import from GitHub</span>
          </Link>
          <Link
            href="/admin/projects/new"
            className="px-3 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-xs font-medium text-white transition-colors flex items-center gap-1.5"
          >
            <span>+</span>
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12 text-xs text-[#8b949e]">
          <div className="animate-spin w-5 h-5 border-2 border-[#4e95ff] border-t-transparent rounded-full mr-2" />
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-[#12161f] border border-[#212631] rounded-xl p-8 text-center space-y-3">
          <p className="text-sm text-[#8b949e]">No projects created yet.</p>
          <div className="flex justify-center gap-3">
            <Link
              href="/admin/projects/new"
              className="px-3 py-1.5 rounded-lg bg-[#2563eb] text-xs text-white"
            >
              Create Project
            </Link>
            <Link
              href="/admin/github"
              className="px-3 py-1.5 rounded-lg bg-[#212631] text-xs text-white"
            >
              Import from GitHub
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-[#12161f] border border-[#212631] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0c10]/60 border-b border-[#212631] text-[#8b949e] font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Order</th>
                  <th className="py-3 px-4 w-16">Preview</th>
                  <th className="py-3 px-4">Title & Slug</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">GitHub Association</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-center">Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212631]/60">
                {projects.map((project, idx) => (
                  <tr key={project.id} className="hover:bg-[#1a202c]/50 transition-colors">
                    {/* Ordering controls */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 font-mono text-[11px] text-[#8b949e]">
                        <button
                          type="button"
                          onClick={() => moveOrder(project.id, "up", idx)}
                          disabled={idx === 0}
                          className="hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <span className="w-4 text-center">{project.sort_order}</span>
                        <button
                          type="button"
                          onClick={() => moveOrder(project.id, "down", idx)}
                          disabled={idx === projects.length - 1}
                          className="hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Move Down"
                        >
                          ▼
                        </button>
                      </div>
                    </td>

                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-10 h-8 rounded bg-[#1a202c] border border-[#30363d] overflow-hidden flex items-center justify-center relative">
                        {project.thumbnail_url ? (
                          <Image
                            src={project.thumbnail_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <span className="text-[10px] text-[#8b949e] font-mono">None</span>
                        )}
                      </div>
                    </td>

                    {/* Title & Slug */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white hover:text-[#4e95ff] transition-colors">
                        <Link href={`/admin/projects/${project.id}`}>
                          {project.title}
                        </Link>
                      </div>
                      <div className="font-mono text-[11px] text-[#8b949e]">
                        /{project.slug}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#212631] text-[11px] font-mono text-[#4e95ff]">
                        {project.category}
                      </span>
                    </td>

                    {/* GitHub Info */}
                    <td className="py-3 px-4">
                      {project.github_repo_full_name ? (
                        <div className="space-y-0.5">
                          <div className="font-mono text-[11px] text-white flex items-center gap-1.5">
                            <span className="text-[#8b949e]">GH:</span>
                            <span className="truncate max-w-[140px]">{project.github_repo_full_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#8b949e]">
                            <span className="text-amber-400 font-mono">★ {project.github_stars}</span>
                            {project.github_synced_at && (
                              <span className="text-[9px]">
                                Synced {new Date(project.github_synced_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#8b949e] italic">Unlinked</span>
                      )}
                    </td>

                    {/* Featured toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(project.id, project.featured)}
                        className={`text-sm transition-transform active:scale-90 cursor-pointer ${
                          project.featured ? "text-amber-400" : "text-[#484f58] hover:text-white"
                        }`}
                        title={project.featured ? "Featured on desktop" : "Not featured"}
                      >
                        {project.featured ? "★" : "☆"}
                      </button>
                    </td>

                    {/* Visibility toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleVisibility(project.id, project.visible)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium transition-colors cursor-pointer ${
                          project.visible
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                            : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {project.visible ? "Public" : "Hidden"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className="px-2.5 py-1 rounded bg-[#212631] hover:bg-[#2d3748] text-white text-xs transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(project.id, project.title)}
                          className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
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
