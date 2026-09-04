"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LinkItem {
  id?: string;
  title: string;
  category: string;
  handle: string;
  url: string;
  description: string;
  type: "github" | "linkedin" | "x" | "email" | "rss";
  verified: boolean;
  visible: boolean;
  sort_order: number;
}

const BLANK_LINK: LinkItem = {
  title: "",
  category: "Code & Contributions",
  handle: "",
  url: "",
  description: "",
  type: "github",
  verified: true,
  visible: true,
  sort_order: 0,
};

export default function AdminLinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const loadLinks = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/links");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setLinks(data.links);
      } else {
        setError(data.error || "Failed to load links");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading links");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/links")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!active || !data) return;
        if (data.success) setLinks(data.links);
        else setError(data.error || "Failed to load links");
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Error loading links");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const openNew = () => {
    setEditingLink({ ...BLANK_LINK, sort_order: links.length });
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin/links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, visible: !current }),
      });
      if (res.ok) {
        setLinks((prev) =>
          prev.map((l) => (l.id === id ? { ...l, visible: !current } : l))
        );
      }
    } catch (err) {
      console.warn("Visibility toggle error:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingLink),
      });

      const data = await res.json();
      if (data.success) {
        setEditingLink(null);
        loadLinks();
      } else {
        setError(data.error || "Failed to save link");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving link");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !window.confirm("Are you sure you want to delete this link?")) return;

    try {
      const res = await fetch(`/api/admin/links?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        loadLinks();
      }
    } catch (err) {
      console.warn("Delete error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">External Links & Presence</h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Manage your online presence, social links, direct email, and cryptographic verification status.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-3 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-xs font-medium text-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>+</span>
          <span>Add Link</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Editor Modal */}
      {editingLink && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-[#212631] rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#212631] pb-3">
              <h2 className="text-sm font-semibold text-white">
                {editingLink.id ? "Edit Link" : "Add New Link"}
              </h2>
              <button
                type="button"
                onClick={() => setEditingLink(null)}
                className="text-xs text-[#8b949e] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8b949e] mb-1 font-mono">Title *</label>
                  <input
                    type="text"
                    required
                    value={editingLink.title}
                    onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                    placeholder="GitHub, LinkedIn, Email..."
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                  />
                </div>
                <div>
                  <label className="block text-[#8b949e] mb-1 font-mono">Platform Type *</label>
                  <select
                    value={editingLink.type}
                    onChange={(e) => setEditingLink({ ...editingLink, type: e.target.value as LinkItem["type"] })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                  >
                    <option value="github">GitHub</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="x">X (Twitter)</option>
                    <option value="email">Direct Email</option>
                    <option value="rss">RSS Feed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8b949e] mb-1 font-mono">Category *</label>
                  <input
                    type="text"
                    required
                    value={editingLink.category}
                    onChange={(e) => setEditingLink({ ...editingLink, category: e.target.value })}
                    placeholder="Professional Network, Code..."
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                  />
                </div>
                <div>
                  <label className="block text-[#8b949e] mb-1 font-mono">Handle / Display Text *</label>
                  <input
                    type="text"
                    required
                    value={editingLink.handle}
                    onChange={(e) => setEditingLink({ ...editingLink, handle: e.target.value })}
                    placeholder="@username, in/profile..."
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8b949e] mb-1 font-mono">Destination URL *</label>
                <input
                  type="text"
                  required
                  value={editingLink.url}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  placeholder="https://... or mailto:..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                />
              </div>

              <div>
                <label className="block text-[#8b949e] mb-1 font-mono">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={editingLink.description}
                  onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                  placeholder="Brief note on what content or discussions live here..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[#8b949e] mb-1 font-mono">Sort Order</label>
                  <input
                    type="number"
                    min="0"
                    value={editingLink.sort_order}
                    onChange={(e) => setEditingLink({ ...editingLink, sort_order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                  />
                </div>
                <div className="flex flex-col justify-end gap-1 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLink.visible}
                      onChange={(e) => setEditingLink({ ...editingLink, visible: e.target.checked })}
                      className="rounded bg-[#0a0c10] border-[#212631] text-[#4e95ff]"
                    />
                    <span className="text-white">Visible on Desktop</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLink.verified}
                      onChange={(e) => setEditingLink({ ...editingLink, verified: e.target.checked })}
                      className="rounded bg-[#0a0c10] border-[#212631] text-emerald-400"
                    />
                    <span className="text-white">Verified Channel</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#212631]">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-3 py-1.5 rounded-lg bg-[#212631] hover:bg-[#2d3748] text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-xs text-[#8b949e]">
          <div className="animate-spin w-5 h-5 border-2 border-[#4e95ff] border-t-transparent rounded-full mr-2" />
          Loading links...
        </div>
      ) : links.length === 0 ? (
        <div className="bg-[#12161f] border border-[#212631] rounded-xl p-8 text-center space-y-3">
          <p className="text-sm text-[#8b949e]">No links configured yet.</p>
          <button
            type="button"
            onClick={openNew}
            className="px-3 py-1.5 rounded-lg bg-[#2563eb] text-xs text-white"
          >
            Add First Link
          </button>
        </div>
      ) : (
        <div className="bg-[#12161f] border border-[#212631] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0c10]/60 border-b border-[#212631] text-[#8b949e] font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Order</th>
                  <th className="py-3 px-4">Title & Handle</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4 text-center">Verified</th>
                  <th className="py-3 px-4 text-center">Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212631]/60">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-[#1a202c]/50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-[#8b949e]">
                      {link.sort_order}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{link.title}</div>
                      <div className="font-mono text-[11px] text-[#8b949e]">{link.handle}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#212631] text-[11px] font-mono text-[#4e95ff]">
                        {link.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate font-mono text-[11px] text-[#8b949e]">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white underline underline-offset-2"
                      >
                        {link.url}
                      </a>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-xs ${
                          link.verified ? "text-emerald-400" : "text-[#484f58]"
                        }`}
                      >
                        {link.verified ? "✓" : "—"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => link.id && handleToggleVisibility(link.id, link.visible)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium transition-colors cursor-pointer ${
                          link.visible
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                            : "bg-zinc-800 border border-zinc-700 text-zinc-400"
                        }`}
                      >
                        {link.visible ? "Public" : "Hidden"}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingLink(link)}
                          className="px-2.5 py-1 rounded bg-[#212631] hover:bg-[#2d3748] text-white text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(link.id)}
                          className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-colors"
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
