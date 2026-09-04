"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SkillItem {
  id?: string;
  name: string;
  category_name: string;
  focus: string;
  context: string;
  sort_order: number;
}

const BLANK_SKILL: SkillItem = {
  name: "",
  category_name: "Languages & Systems Programming",
  focus: "Production Systems",
  context: "Primary language for low-latency network daemons and concurrent workloads.",
  sort_order: 0,
};

const CATEGORIES = [
  "Languages & Systems Programming",
  "Architecture & Distributed Systems",
  "Frontend Architecture & Client Systems",
  "Infrastructure, Cloud & Observability",
  "Databases & Storage Engines",
];

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const loadSkills = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/skills");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSkills(data.skills);
      } else {
        setError(data.error || "Failed to load skills");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading skills");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/skills")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!active || !data) return;
        if (data.success) setSkills(data.skills);
        else setError(data.error || "Failed to load skills");
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Error loading skills");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const openNew = () => {
    setEditingSkill({ ...BLANK_SKILL, sort_order: skills.length });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSkill),
      });

      const data = await res.json();
      if (data.success) {
        setEditingSkill(null);
        loadSkills();
      } else {
        setError(data.error || "Failed to save skill");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving skill");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !window.confirm("Are you sure you want to delete this skill?")) return;

    try {
      const res = await fetch(`/api/admin/skills?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        loadSkills();
      }
    } catch (err) {
      console.warn("Delete error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Skills & Technical Competencies</h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Manage your technical skill groups, depth indicators, and contextual explanations.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-3 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-xs font-medium text-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>+</span>
          <span>Add Skill</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Editor Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-[#212631] rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#212631] pb-3">
              <h2 className="text-sm font-semibold text-white">
                {editingSkill.id ? "Edit Skill" : "Add New Skill"}
              </h2>
              <button
                type="button"
                onClick={() => setEditingSkill(null)}
                className="text-xs text-[#8b949e] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8b949e] mb-1 font-mono">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={editingSkill.name}
                  onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  placeholder="Go, Rust, TypeScript, Distributed Systems..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                />
              </div>

              <div>
                <label className="block text-[#8b949e] mb-1 font-mono">Category *</label>
                <input
                  type="text"
                  list="category-suggestions"
                  required
                  value={editingSkill.category_name}
                  onChange={(e) => setEditingSkill({ ...editingSkill, category_name: e.target.value })}
                  placeholder="Select or enter category"
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                />
                <datalist id="category-suggestions">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8b949e] mb-1 font-mono">Focus Area *</label>
                  <input
                    type="text"
                    required
                    value={editingSkill.focus}
                    onChange={(e) => setEditingSkill({ ...editingSkill, focus: e.target.value })}
                    placeholder="e.g. Concurrency & Microservices"
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                  />
                </div>
                <div>
                  <label className="block text-[#8b949e] mb-1 font-mono">Sort Order</label>
                  <input
                    type="number"
                    min="0"
                    value={editingSkill.sort_order}
                    onChange={(e) => setEditingSkill({ ...editingSkill, sort_order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8b949e] mb-1 font-mono">Contextual Explanation *</label>
                <textarea
                  rows={3}
                  required
                  value={editingSkill.context}
                  onChange={(e) => setEditingSkill({ ...editingSkill, context: e.target.value })}
                  placeholder="Concrete usage in production environments..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-white focus:outline-none focus:border-[#4e95ff]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#212631]">
                <button
                  type="button"
                  onClick={() => setEditingSkill(null)}
                  className="px-3 py-1.5 rounded-lg bg-[#212631] hover:bg-[#2d3748] text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skills Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-xs text-[#8b949e]">
          <div className="animate-spin w-5 h-5 border-2 border-[#4e95ff] border-t-transparent rounded-full mr-2" />
          Loading skills...
        </div>
      ) : skills.length === 0 ? (
        <div className="bg-[#12161f] border border-[#212631] rounded-xl p-8 text-center space-y-3">
          <p className="text-sm text-[#8b949e]">No skills listed yet.</p>
          <button
            type="button"
            onClick={openNew}
            className="px-3 py-1.5 rounded-lg bg-[#2563eb] text-xs text-white"
          >
            Add First Skill
          </button>
        </div>
      ) : (
        <div className="bg-[#12161f] border border-[#212631] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0c10]/60 border-b border-[#212631] text-[#8b949e] font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Order</th>
                  <th className="py-3 px-4">Skill Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Focus</th>
                  <th className="py-3 px-4">Context</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212631]/60">
                {skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-[#1a202c]/50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-[#8b949e]">
                      {skill.sort_order}
                    </td>

                    <td className="py-3 px-4 font-semibold text-white">
                      {skill.name}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#212631] text-[11px] font-mono text-[#4e95ff]">
                        {skill.category_name}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#8b949e] font-mono text-[11px]">
                      {skill.focus}
                    </td>

                    <td className="py-3 px-4 max-w-sm truncate text-[#8b949e]">
                      {skill.context}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingSkill(skill)}
                          className="px-2.5 py-1 rounded bg-[#212631] hover:bg-[#2d3748] text-white text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(skill.id)}
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
