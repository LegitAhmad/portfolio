"use client";

import React, { useState, useEffect } from "react";
import { getPlaceholderExperience, fetchExperience, type ExperienceRecord } from "@/lib/data/experience";

export function ExperienceApp() {
  const [experiences, setExperiences] = useState<readonly ExperienceRecord[]>(getPlaceholderExperience());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchExperience()
      .then((data) => {
        if (active && data) {
          setExperiences(data);
        }
      })
      .catch((err) => {
        console.warn("Failed to load experience:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto text-text-primary">
      {/* Header */}
      <header className="pb-3 border-b border-border-subtle space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold tracking-tight text-text-primary">
            Career Timeline & Experience
          </h1>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.04] border border-border-subtle text-text-muted">
            Chronological History
          </span>
        </div>
        <p className="text-xs text-text-muted">
          Software engineering milestones, architectural leadership, and production impact.
        </p>
      </header>

      {!loading && experiences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center p-6 rounded-lg border border-dashed border-border-subtle bg-surface-raised/10">
          <p className="text-xs text-text-secondary font-medium">No experience records found</p>
          <p className="font-mono text-[11px] text-text-muted mt-1">
            Timeline entries will appear once populated in database.
          </p>
        </div>
      ) : (
        /* Timeline Section */
        <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border-subtle">
          {experiences.map((exp) => (
            <article key={exp.id} className="relative space-y-2.5">
              {/* Timeline node marker */}
              <div
                aria-hidden="true"
                className={`
                  absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-[#10141d]
                  ${exp.isCurrent ? "bg-accent shadow-[0_0_8px_rgba(106,152,255,0.8)] animate-pulse" : "bg-text-muted"}
                `}
              />

              {/* Role & Organization Header */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <h2 className="text-sm font-bold text-text-primary tracking-tight">
                    {exp.role || exp.roleTitle}
                  </h2>
                  <div className="flex items-center gap-2 font-mono text-xs text-accent mt-0.5">
                    <span>{exp.organization || exp.companyPlaceholder}</span>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-muted">{exp.location}</span>
                  </div>
                </div>

                <div className="font-mono text-xs text-text-muted shrink-0 flex items-center gap-1.5">
                  <span>{exp.start && exp.end ? `${exp.start} — ${exp.end}` : exp.timeframe}</span>
                  {exp.isCurrent && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-medium">
                      Active
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-text-secondary leading-relaxed">
                {exp.description || exp.summary}
              </p>

              {/* Highlights List */}
              {(exp.highlights || exp.achievements || []).length > 0 && (
                <ul className="space-y-1.5 pl-4 list-disc text-xs text-text-secondary leading-relaxed marker:text-text-muted">
                  {(exp.highlights || exp.achievements || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}

              {/* Technologies */}
              {exp.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-white/[0.03] border border-white/[0.06] text-text-muted"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
