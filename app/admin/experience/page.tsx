"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ExperienceRecord {
  id?: string;
  role_title: string;
  company_name: string;
  location: string;
  timeframe: string;
  is_current: boolean;
  summary: string;
  achievements: string[];
  technologies: string[];
  sort_order: number;
}

const BLANK_FORM: ExperienceRecord = {
  role_title: "",
  company_name: "",
  location: "Remote",
  timeframe: "",
  is_current: false,
  summary: "",
  achievements: [],
  technologies: [],
  sort_order: 0,
};

export default function AdminExperiencePage() {
  const [items, setItems] = useState<ExperienceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ExperienceRecord | null>(null);
  const [achievementsText, setAchievementsText] = useState("");
  const [techText, setTechText] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/experience");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setItems(data.experience);
      } else {
        setError(data.error || "Failed to load experience");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading data");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/experience")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!active || !data) return;
        if (data.success) setItems(data.experience);
        else setError(data.error || "Failed to load experience");
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Error loading data");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const openEdit = (item: ExperienceRecord) => {
    setEditingItem(item);
    setAchievementsText(Array.isArray(item.achievements) ? item.achievements.join("\n") : "");
    setTechText(Array.isArray(item.technologies) ? item.technologies.join(", ") : "");
  };

  const openNew = () => {
    setEditingItem({ ...BLANK_FORM, sort_order: items.length });
    setAchievementsText("");
    setTechText("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    setError(null);

    const achievements = achievementsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const technologies = techText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      ...editingItem,
      achievements,
      technologies,
    };

    try {
      const res = await fetch("/api/admin/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setEditingItem(null);
        loadData();
      } else {
        setError(data.error || "Failed to save experience record");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !window.confirm("Are you sure you want to delete this experience record?")) return;

    try {
      const res = await fetch(`/api/admin/experience?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.warn("Delete error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Experience Timeline</h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Manage your career history, roles, key accomplishments, and technical stacks.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-3 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-xs font-medium text-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>+</span>
          <span>Add Position</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Editor Modal / Drawer */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12161f] border border-[#212631] rounded-xl w-full max-w-xl p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#212631] pb-3">
              <h2 className="text-sm font-semibold text-white">
                {editingItem.id ? "Edit Position" : "Add New Position"}
              </h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-xs text-[#8b949e] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8b949e] mb-1 font-mono">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.role_title}
                    onChange={(e) => setEditingItem({ ...editingItem, role_title: e.target.value })}
                    placeholder="Staff Infrastructure Engineer"
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                  />
                </div>
                <div>
                  <label className="block text-[#8b949e] mb-1 font-mono">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.company_name}
                    onChange={(e) => setEditingItem({ ...editingItem, company_name: e.target.value })}
                    placeholder="Acme Cloud Systems"
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#8b949e] mb-1 font-mono">Location</label>
                  <input
                    type="text"
                    value={editingItem.location}
                    onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                    placeholder="San Francisco / Remote"
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                  />
                </div>
                <div>
                  <label className="block text-[#8b949e] mb-1 font-mono">Timeframe *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.timeframe}
                    onChange={(e) => setEditingItem({ ...editingItem, timeframe: e.target.value })}
                    placeholder="2023 — Present"
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                  />
                </div>
                <div>
                  <label className="block text-[#8b949e] mb-1 font-mono">Order</label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem.sort_order}
                    onChange={(e) => setEditingItem({ ...editingItem, sort_order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8b949e] mb-1 font-mono">Executive Summary *</label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.summary}
                  onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                  placeholder="Architectural scope, organizational impact, leadership context..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                />
              </div>

              <div>
                <label className="block text-[#8b949e] mb-1 font-mono">Key Accomplishments (one per line)</label>
                <textarea
                  rows={4}
                  value={achievementsText}
                  onChange={(e) => setAchievementsText(e.target.value)}
                  placeholder="Led migration of core ingestion pipeline...&#10;Decreased p99 latencies by 42%..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                />
              </div>

              <div>
                <label className="block text-[#8b949e] mb-1 font-mono">Technologies (comma-separated)</label>
                <input
                  type="text"
                  value={techText}
                  onChange={(e) => setTechText(e.target.value)}
                  placeholder="Go, Rust, Kubernetes, Kafka, PostgreSQL"
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_current"
                  checked={editingItem.is_current}
                  onChange={(e) => setEditingItem({ ...editingItem, is_current: e.target.checked })}
                  className="rounded bg-[#0a0c10] border-[#212631] text-[#4e95ff]"
                />
                <label htmlFor="is_current" className="text-white cursor-pointer">
                  Current active position
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#212631]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 rounded-lg bg-[#212631] hover:bg-[#2d3748] text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Position"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table view */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-xs text-[#8b949e]">
          <div className="animate-spin w-5 h-5 border-2 border-[#4e95ff] border-t-transparent rounded-full mr-2" />
          Loading experience...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-[#12161f] border border-[#212631] rounded-xl p-8 text-center space-y-3">
          <p className="text-sm text-[#8b949e]">No experience items yet.</p>
          <button
            type="button"
            onClick={openNew}
            className="px-3 py-1.5 rounded-lg bg-[#2563eb] text-xs text-white"
          >
            Add First Position
          </button>
        </div>
      ) : (
        <div className="bg-[#12161f] border border-[#212631] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0c10]/60 border-b border-[#212631] text-[#8b949e] font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Order</th>
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-4">Timeframe</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212631]/60">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1a202c]/50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-[#8b949e]">
                      {item.sort_order}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{item.role_title}</div>
                      <div className="font-mono text-[11px] text-[#4e95ff] flex items-center gap-1.5">
                        <span>{item.company_name}</span>
                        {item.is_current && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px]">
                            Current
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#8b949e]">
                      {item.timeframe}
                    </td>

                    <td className="py-3 px-4 text-[#8b949e]">
                      {item.location}
                    </td>

                    <td className="py-3 px-4 max-w-sm truncate text-[#8b949e]">
                      {item.summary}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="px-2.5 py-1 rounded bg-[#212631] hover:bg-[#2d3748] text-white text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
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
