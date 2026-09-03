"use client";

import type { PortfolioProject } from "@/lib/data/projects";

export interface ProjectDetailViewProps {
  project: PortfolioProject;
  standalone?: boolean;
}

/**
 * Reusable Project Detail View.
 * 
 * Used both inside desktop floating windows and in standalone URL routes (/projects/[slug]).
 * Strictly renders only sections that contain actual data.
 */
export function ProjectDetailView({
  project,
  standalone = false,
}: ProjectDetailViewProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 bg-surface text-text-primary">
      {/* ----------------------------------------------------------------- */}
      {/* Header Banner: Title, Category, Status, Short Description         */}
      {/* ----------------------------------------------------------------- */}
      <header className="pb-4 border-b border-border-subtle space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent font-medium uppercase tracking-wider">
              {project.category}
            </span>
            {project.featured && (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/25 text-amber-300 font-medium">
                ★ Featured
              </span>
            )}
          </div>

          {project.status && (
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
              <span
                className={`w-2 h-2 rounded-full ${
                  project.status === "Active"
                    ? "bg-status-online shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                    : project.status === "Prototype"
                    ? "bg-status-idle"
                    : "bg-text-muted"
                }`}
              />
              <span>{project.status}</span>
            </div>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
          {project.title}
        </h1>

        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          {project.shortDescription}
        </p>

        {/* Technologies Pills */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1" aria-label="Project Technologies">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded font-mono text-xs bg-surface-raised border border-border-subtle text-text-secondary"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* External Links & Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.1] border border-border-subtle text-xs font-mono text-text-primary transition-colors cursor-pointer"
            >
              <span>GitHub Repository</span>
              {typeof project.githubStars === "number" && project.githubStars > 0 && (
                <span className="text-amber-300 font-medium">★ {project.githubStars}</span>
              )}
              <span aria-hidden="true">↗</span>
            </a>
          )}

          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent/15 hover:bg-accent/25 border border-accent/30 text-xs font-mono font-medium text-accent transition-colors cursor-pointer"
            >
              <span>Live Demonstration</span>
              <span aria-hidden="true">↗</span>
            </a>
          )}

          {!standalone && (
            <a
              href={`/projects/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Open stable standalone URL"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono text-text-muted hover:text-text-primary hover:bg-white/[0.03] transition-colors"
            >
              <span>/projects/{project.slug}</span>
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* Hero Media (Only rendered if actual hero data exists)              */}
      {/* ----------------------------------------------------------------- */}
      {project.heroMedia && (
        <section aria-label="Project Architecture Media" className="space-y-2">
          <div className="relative rounded-lg overflow-hidden border border-border-default bg-[#0d1017] p-4 sm:p-6">
            {/* Subtle decorative grid background */}
            <div className="wallpaper-grid absolute inset-0 opacity-40 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center space-y-3">
              {project.heroMedia.badge && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-accent">
                  {project.heroMedia.badge}
                </span>
              )}

              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-surface-raised border border-border-highlight text-accent shadow-inner">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                  <path d="M6 8h.01M10 8h.01M14 8h.01" />
                </svg>
              </div>

              {project.heroMedia.caption && (
                <p className="font-mono text-xs text-text-secondary max-w-md">
                  {project.heroMedia.caption}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Architectural Overview (Only rendered if overview exists)         */}
      {/* ----------------------------------------------------------------- */}
      {project.overview && (
        <section aria-labelledby="overview-heading" className="space-y-2">
          <h2
            id="overview-heading"
            className="font-mono text-xs font-semibold text-text-muted uppercase tracking-wider"
          >
            System Overview & Purpose
          </h2>
          <div className="p-4 rounded-lg bg-surface-raised/40 border border-border-subtle text-xs sm:text-sm leading-relaxed text-text-secondary">
            <p>{project.overview}</p>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Key Features (Only rendered if features exist)                     */}
      {/* ----------------------------------------------------------------- */}
      {project.features && project.features.length > 0 && (
        <section aria-labelledby="features-heading" className="space-y-2">
          <h2
            id="features-heading"
            className="font-mono text-xs font-semibold text-text-muted uppercase tracking-wider"
          >
            Key Capabilities
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2" role="list">
            {project.features.map((feature, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 p-3 rounded-md bg-surface-raised/30 border border-border-subtle text-xs text-text-secondary leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Technical Specifications (Only rendered if details exist)         */}
      {/* ----------------------------------------------------------------- */}
      {project.technicalDetails && project.technicalDetails.length > 0 && (
        <section aria-labelledby="specs-heading" className="space-y-2">
          <h2
            id="specs-heading"
            className="font-mono text-xs font-semibold text-text-muted uppercase tracking-wider"
          >
            Technical Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {project.technicalDetails.map((detail, i) => (
              <div
                key={i}
                className="p-3 rounded-md bg-white/[0.02] border border-border-subtle flex flex-col justify-center space-y-0.5"
              >
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                  {detail.label}
                </span>
                <span className="font-mono text-xs font-medium text-text-primary">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Challenges & Architectural Decisions (Only rendered if present)   */}
      {/* ----------------------------------------------------------------- */}
      {project.challengesDecisions && project.challengesDecisions.length > 0 && (
        <section aria-labelledby="decisions-heading" className="space-y-2.5">
          <h2
            id="decisions-heading"
            className="font-mono text-xs font-semibold text-text-muted uppercase tracking-wider"
          >
            Challenges & Engineering Decisions
          </h2>
          <div className="space-y-3">
            {project.challengesDecisions.map((item, i) => (
              <div
                key={i}
                className="p-3.5 rounded-lg bg-surface-raised/40 border border-border-subtle space-y-2"
              >
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-amber-300/90 uppercase tracking-wider">
                    Challenge
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {item.challenge}
                  </p>
                </div>
                <div className="pt-2 border-t border-border-subtle/50 space-y-1">
                  <span className="font-mono text-[10px] text-accent uppercase tracking-wider">
                    Architectural Decision
                  </span>
                  <p className="text-xs text-text-primary leading-relaxed font-medium">
                    {item.decision}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
