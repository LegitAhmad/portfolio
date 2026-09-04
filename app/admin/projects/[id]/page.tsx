"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface ProjectFormData {
  id?: string;
  slug: string;
  title: string;
  short_description: string;
  overview: string;
  category: "Platform" | "Systems" | "Frontend" | "Tooling";
  status: "Active" | "Completed" | "Archived";
  featured: boolean;
  visible: boolean;
  sort_order: number;
  thumbnail_url: string;
  demo_url: string;
  github_url: string;
  featuresText: string; // Comma or newline separated
  // Synchronized GitHub metadata (read-only)
  github_repo_id?: number | null;
  github_repo_full_name?: string | null;
  github_stars?: number;
  github_forks?: number;
  github_primary_language?: string | null;
  github_last_pushed_at?: string | null;
  github_synced_at?: string | null;
}

export default function ProjectEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === "new";

  const [form, setForm] = useState<ProjectFormData>({
    slug: "",
    title: "",
    short_description: "",
    overview: "",
    category: "Platform",
    status: "Active",
    featured: false,
    visible: false, // Default: visible = false
    sort_order: 0,
    thumbnail_url: "",
    demo_url: "",
    github_url: "",
    featuresText: "TypeScript, Next.js, React",
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isNew) return;

    async function loadProject() {
      try {
        const res = await fetch("/api/admin/projects");
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        if (data.success) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const match = data.projects.find((p: any) => p.id === resolvedParams.id);
          if (match) {
            setForm({
              id: match.id,
              slug: match.slug,
              title: match.title,
              short_description: match.short_description,
              overview: match.overview || "",
              category: match.category,
              status: match.status || "Active",
              featured: Boolean(match.featured),
              visible: Boolean(match.visible),
              sort_order: match.sort_order || 0,
              thumbnail_url: match.thumbnail_url || "",
              demo_url: match.demo_url || "",
              github_url: match.github_url || "",
              featuresText: Array.isArray(match.features)
                ? match.features.join(", ")
                : "",
              github_repo_id: match.github_repo_id,
              github_repo_full_name: match.github_repo_full_name,
              github_stars: match.github_stars,
              github_forks: match.github_forks,
              github_primary_language: match.github_primary_language,
              github_last_pushed_at: match.github_last_pushed_at,
              github_synced_at: match.github_synced_at,
            });
          } else {
            setError("Project not found");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [isNew, resolvedParams.id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "thumbnail");
    formData.append("slug", form.slug || "project");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, thumbnail_url: data.url }));
      } else {
        setError(data.error || "Image upload failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const features = form.featuresText
      .split(/[,\n]/)
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      ...(form.id ? { id: form.id } : {}),
      slug: form.slug,
      title: form.title,
      short_description: form.short_description,
      overview: form.overview || null,
      category: form.category,
      status: form.status,
      featured: form.featured,
      visible: form.visible,
      sort_order: Number(form.sort_order),
      thumbnail_url: form.thumbnail_url || null,
      demo_url: form.demo_url || null,
      github_url: form.github_url || null,
      features,
    };

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        if (isNew && data.project?.id) {
          router.push(`/admin/projects/${data.project.id}`);
        }
      } else {
        setError(data.error || "Failed to save project");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving project");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-xs text-[#8b949e]">
        <div className="animate-spin w-5 h-5 border-2 border-[#4e95ff] border-t-transparent rounded-full mr-2" />
        Loading project data...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/projects"
            className="text-xs font-mono text-[#8b949e] hover:text-white transition-colors"
          >
            ← Back to Projects
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            {isNew ? "Create New Project" : `Edit Project: ${form.title}`}
          </h1>
        </div>

        {form.slug && (
          <Link
            href={`/projects/${form.slug}`}
            target="_blank"
            className="px-3 py-1.5 rounded-lg bg-[#212631] hover:bg-[#2d3748] text-xs font-mono text-white border border-[#30363d] transition-colors"
          >
            View Live ↗
          </Link>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
          Project saved successfully.
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. Synchronized GitHub Metadata (Strictly Distinct / Read-Only) */}
      {/* ------------------------------------------------------------- */}
      {form.github_repo_full_name && (
        <div className="bg-[#12161f] border border-[#212631] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#212631] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[#4e95ff] text-sm">★</span>
              <h2 className="text-sm font-semibold text-white">GitHub Repository Data</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-amber-300">
              Synchronized Metadata
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[#8b949e] block text-[10px] uppercase font-mono">Repository</span>
              <span className="text-white font-mono font-medium truncate block">
                {form.github_repo_full_name}
              </span>
            </div>
            <div>
              <span className="text-[#8b949e] block text-[10px] uppercase font-mono">Stars / Forks</span>
              <span className="text-white font-mono">
                ★ {form.github_stars ?? 0} &nbsp;|&nbsp; ⑂ {form.github_forks ?? 0}
              </span>
            </div>
            <div>
              <span className="text-[#8b949e] block text-[10px] uppercase font-mono">Language</span>
              <span className="text-white font-mono">
                {form.github_primary_language || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[#8b949e] block text-[10px] uppercase font-mono">Last Synced</span>
              <span className="text-[#8b949e] font-mono text-[11px]">
                {form.github_synced_at
                  ? new Date(form.github_synced_at).toLocaleDateString()
                  : "Pending"}
              </span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-[#8b949e] bg-[#0a0c10]/40 p-2.5 rounded-lg border border-[#212631]/60">
            ℹ <strong>Editorial Separation:</strong> GitHub statistics and commit timestamps update automatically via webhooks. Your custom editorial fields below are fully protected and will never be overwritten.
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. Portfolio Editorial Fields (Editable Personal CMS Content) */}
      {/* ------------------------------------------------------------- */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#12161f] border border-[#212631] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white border-b border-[#212631] pb-3">
            Editorial Content & Presentation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Project Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. Distributed Cache Engine"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-xs text-white placeholder:text-[#484f58] focus:outline-none focus:border-[#4e95ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                URL Slug <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                required
                placeholder="e.g. distributed-cache-engine"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-xs text-white placeholder:text-[#484f58] focus:outline-none focus:border-[#4e95ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1">
              Short Description <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              required
              placeholder="High-density summary rendered in desktop explorer cards"
              className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-xs text-white placeholder:text-[#484f58] focus:outline-none focus:border-[#4e95ff]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as ProjectFormData["category"] })}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-xs text-white focus:outline-none focus:border-[#4e95ff]"
              >
                <option value="Platform">Platform</option>
                <option value="Systems">Systems</option>
                <option value="Frontend">Frontend</option>
                <option value="Tooling">Tooling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ProjectFormData["status"] })}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-xs text-white focus:outline-none focus:border-[#4e95ff]"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Sort Order
              </label>
              <input
                type="number"
                min="0"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-xs text-white focus:outline-none focus:border-[#4e95ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1">
              Architectural Overview & Engineering Decisions
            </label>
            <textarea
              rows={5}
              value={form.overview}
              onChange={(e) => setForm({ ...form, overview: e.target.value })}
              placeholder="In-depth technical breakdown rendered in the project detail view..."
              className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-xs text-white placeholder:text-[#484f58] focus:outline-none focus:border-[#4e95ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1">
              Key Technologies / Features (comma-separated)
            </label>
            <input
              type="text"
              value={form.featuresText}
              onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
              placeholder="e.g. Go, Raft Consensus, Docker, Zero-copy"
              className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-xs text-white placeholder:text-[#484f58] focus:outline-none focus:border-[#4e95ff]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Live Demonstration URL
              </label>
              <input
                type="url"
                value={form.demo_url}
                onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
                placeholder="https://demo.example.com"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-xs text-white placeholder:text-[#484f58] focus:outline-none focus:border-[#4e95ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                placeholder="https://github.com/username/repo"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-xs text-white placeholder:text-[#484f58] focus:outline-none focus:border-[#4e95ff]"
              />
            </div>
          </div>

          {/* Image Upload Component */}
          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1">
              Project Thumbnail Image (Supabase Storage)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-12 rounded bg-[#0a0c10] border border-[#212631] overflow-hidden relative flex items-center justify-center">
                {form.thumbnail_url ? (
                  <Image
                    src={form.thumbnail_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <span className="text-[10px] text-[#484f58] font-mono">No Img</span>
                )}
              </div>

              <div className="space-y-1">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="text-xs text-[#8b949e] file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-[#212631] file:text-white hover:file:bg-[#2d3748] cursor-pointer"
                />
                <p className="text-[10px] text-[#8b949e]">
                  Max 5MB (PNG, JPEG, WebP, AVIF). Automatically sanitized and stored.
                </p>
              </div>
            </div>
          </div>

          {/* Visibility and Featured Controls */}
          <div className="pt-2 border-t border-[#212631] flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                className="rounded bg-[#0a0c10] border-[#212631] text-[#4e95ff] focus:ring-0"
              />
              <span className="text-xs font-medium text-white">Public Visibility</span>
              <span className="text-[10px] text-[#8b949e] font-mono">
                ({form.visible ? "Visible on desktop" : "Hidden from public"})
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="rounded bg-[#0a0c10] border-[#212631] text-amber-400 focus:ring-0"
              />
              <span className="text-xs font-medium text-white">Featured Project</span>
              <span className="text-[10px] text-[#8b949e] font-mono">
                (Pinned on desktop)
              </span>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/projects"
            className="px-4 py-2 rounded-lg bg-[#212631] hover:bg-[#2d3748] text-xs font-medium text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-xs font-medium text-white transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/10"
          >
            {saving ? "Saving Changes..." : "Save Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
