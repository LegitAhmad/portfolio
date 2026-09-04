"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getPlaceholderSkillGroups, fetchSkillGroups, type SkillCategoryGroup } from "@/lib/data/skills";

export function SkillsApp() {
  const [groups, setGroups] = useState<readonly SkillCategoryGroup[]>(getPlaceholderSkillGroups());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchSkillGroups()
      .then((data) => {
        if (active && data) {
          setGroups(data);
        }
      })
      .catch((err) => {
        console.warn("Failed to load skills:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categoryNames = useMemo(() => {
    return ["All", ...Array.from(new Set(groups.map((g) => g.categoryName)))];
  }, [groups]);

  const filteredGroups = useMemo(() => {
    if (selectedCategory === "All") return groups;
    return groups.filter((g) => g.categoryName.toLowerCase() === selectedCategory.toLowerCase());
  }, [groups, selectedCategory]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto text-text-primary">
      {/* Header */}
      <header className="pb-3 border-b border-border-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-bold tracking-tight text-text-primary">
              Skills & Technical Systems
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Categorized by technical domain responsibility, focusing on production competency over arbitrary percentages.
            </p>
          </div>

          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.04] border border-border-subtle text-text-muted shrink-0 self-start sm:self-auto">
            {groups.reduce((acc, g) => acc + g.skills.length, 0)} Skills Verified
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1" role="tablist" aria-label="Skill categories">
          {categoryNames.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-accent/15 border border-accent/30 text-accent font-semibold"
                  : "bg-surface-raised/40 border border-border-subtle text-text-muted hover:text-text-primary hover:bg-surface-raised"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {!loading && filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center p-6 rounded-lg border border-dashed border-border-subtle bg-surface-raised/10">
          <p className="text-xs text-text-secondary font-medium">No skills found in this category</p>
          <p className="font-mono text-[11px] text-text-muted mt-1">
            Technical skill groups will populate from database.
          </p>
        </div>
      ) : (
        /* Categorized Groups */
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <section key={group.id} className="space-y-3" aria-labelledby={`group-${group.id}`}>
              {/* Category Title */}
              <div>
                <h2
                  id={`group-${group.id}`}
                  className="text-xs font-bold text-text-primary tracking-tight"
                >
                  {group.categoryName}
                </h2>
                <p className="font-mono text-[11px] text-text-muted">
                  {group.headline}
                </p>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {group.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="p-3 rounded-lg bg-surface-raised/40 border border-border-subtle hover:border-border-highlight transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-text-primary">
                        {skill.name}
                      </span>
                      <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-accent/10 text-accent border border-accent/20 shrink-0">
                        {skill.focus}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-text-muted leading-relaxed">
                      {skill.context}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
