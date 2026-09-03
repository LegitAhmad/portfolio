"use client";

import { useState, useEffect } from "react";
import { getPlaceholderSkillGroups, fetchSkillGroups, type SkillCategoryGroup } from "@/lib/data/skills";

export function SkillsApp() {
  const [groups, setGroups] = useState<readonly SkillCategoryGroup[]>(getPlaceholderSkillGroups());

  useEffect(() => {
    fetchSkillGroups().then((data) => {
      if (data && data.length > 0) {
        setGroups(data);
      }
    });
  }, []);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-6 space-y-6 bg-surface text-text-primary">
      {/* Header */}
      <header className="pb-3 border-b border-border-subtle space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold tracking-tight text-text-primary">
            Skills & Technical Systems
          </h1>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.04] border border-border-subtle text-text-muted">
            Categorized Domains
          </span>
        </div>
        <p className="text-xs text-text-muted">
          Organized by domain responsibility, focusing on architectural competency over arbitrary percentages.
        </p>
      </header>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center p-6 rounded-lg border border-dashed border-border-subtle bg-surface-raised/10">
          <p className="text-xs text-text-secondary font-medium">No skill categories found</p>
          <p className="font-mono text-[11px] text-text-muted mt-1">Technical skill groups will populate from database.</p>
        </div>
      ) : (
        /* Categorized Groups */
        <div className="space-y-6">
        {groups.map((group) => (
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
                  className="p-3 rounded-lg bg-surface-raised/40 border border-border-subtle hover:border-border-highlight transition-all space-y-1"
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
