"use client";

import { useMemo } from "react";
import { getPlaceholderAbout } from "@/lib/data/about";
import { AboutMeGlyph } from "@/components/desktop/icons/icon-glyphs";

export function AboutApp() {
  const data = useMemo(() => getPlaceholderAbout(), []);

  return (
    <article className="flex flex-col h-full overflow-y-auto p-4 sm:p-6 space-y-6 bg-surface text-text-primary">
      {/* Header Profile Section */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-border-subtle">
        <div className="w-14 h-14 rounded-xl bg-surface-raised border border-border-highlight flex items-center justify-center text-accent shadow-sm shrink-0">
          <AboutMeGlyph size={32} />
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-border-subtle text-text-muted uppercase tracking-wider">
              Profile Overview
            </span>
            <span className="font-mono text-[10px] text-text-muted">
              {data.locationPlaceholder}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-text-primary truncate">
            {data.roleHeadline}
          </h1>
        </div>
      </header>

      {/* Narrative Section */}
      <section className="space-y-3" aria-labelledby="narrative-heading">
        <h2
          id="narrative-heading"
          className="font-mono text-[11px] text-text-muted uppercase tracking-wider font-semibold"
        >
          Engineering Focus
        </h2>
        <div className="space-y-2.5 text-xs sm:text-sm text-text-secondary leading-relaxed">
          {data.narrativeOverview.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* Core Principles */}
      <section className="space-y-3" aria-labelledby="principles-heading">
        <h2
          id="principles-heading"
          className="font-mono text-[11px] text-text-muted uppercase tracking-wider font-semibold"
        >
          Core Engineering Principles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.principles.map((p) => (
            <div
              key={p.title}
              className="p-3.5 rounded-lg bg-surface-raised/40 border border-border-subtle space-y-1.5"
            >
              <div className="text-xs font-semibold text-text-primary">
                {p.title}
              </div>
              <p className="text-xs text-text-secondary font-medium">
                {p.statement}
              </p>
              <p className="font-mono text-[11px] text-text-muted leading-relaxed">
                {p.rationale}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Toolchain & System Preferences */}
      <section className="space-y-3 pt-2 border-t border-border-subtle" aria-labelledby="stack-preferences-heading">
        <h2
          id="stack-preferences-heading"
          className="font-mono text-[11px] text-text-muted uppercase tracking-wider font-semibold"
        >
          Architectural Preferences
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {data.toolchainPreferences.map((tool) => (
            <span
              key={tool}
              className="px-2 py-1 rounded font-mono text-xs bg-white/[0.03] border border-white/[0.07] text-text-secondary"
            >
              {tool}
            </span>
          ))}
        </div>
      </section>
    </article>
  );
}
