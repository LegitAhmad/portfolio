"use client";

import { useState, useMemo, type KeyboardEvent } from "react";
import {
  getAllProjects,
  getProjectCategories,
  type PortfolioProject,
} from "@/lib/data/projects";
import { useWindowStore } from "@/stores/window-store";
import { APP_REGISTRY } from "@/lib/app-registry";

type ViewMode = "grid" | "list";
type FilterSection = "all" | "featured" | string;

/**
 * Project Explorer Application.
 * 
 * Styled as an interactive, modern project and file workspace navigator.
 * Supports:
 * - Sidebar navigation (Featured, All Projects, Category filters)
 * - Real-time client-side search across title, description, technologies, and category
 * - Grid and List view layouts
 * - Single-click selection & double-click / Enter activation
 * - Dispatches window openings as `project:${slug}` ensuring duplicate prevention
 */
export function ProjectExplorerApp() {
  const [activeFilter, setActiveFilter] = useState<FilterSection>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const openWindow = useWindowStore((state) => state.openWindow);
  const projects = useMemo(() => getAllProjects(), []);
  const categories = useMemo(() => getProjectCategories().filter((c) => c !== "All"), []);

  // Filter projects by category/featured and search query
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // 1. Sidebar filter check
      if (activeFilter === "featured" && !project.featured) {
        return false;
      } else if (
        activeFilter !== "all" &&
        activeFilter !== "featured" &&
        project.category !== activeFilter
      ) {
        return false;
      }

      // 2. Search query check (title, description, technology, category)
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      const titleMatch = project.title.toLowerCase().includes(q);
      const descMatch = project.shortDescription.toLowerCase().includes(q);
      const catMatch = project.category.toLowerCase().includes(q);
      const techMatch = project.technologies.some((t) =>
        t.toLowerCase().includes(q)
      );

      return titleMatch || descMatch || catMatch || techMatch;
    });
  }, [projects, activeFilter, searchQuery]);

  // Project opening dispatcher using `project:${slug}` as required
  const handleOpenProject = (project: PortfolioProject) => {
    const windowId = `project:${project.slug}`;
    const appDef = APP_REGISTRY.project;

    openWindow("project", {
      id: windowId,
      title: project.title,
      defaultSize: appDef.defaultSize,
      minSize: appDef.minSize,
      metadata: { projectSlug: project.slug },
    });
  };

  const handleKeyDown = (e: KeyboardEvent, project: PortfolioProject) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleOpenProject(project);
    } else if (e.key === " ") {
      e.preventDefault();
      setSelectedSlug(project.slug);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden bg-surface text-text-primary select-none">
      {/* ----------------------------------------------------------------- */}
      {/* Sidebar: Project Navigation Tree                                  */}
      {/* ----------------------------------------------------------------- */}
      <aside
        aria-label="Explorer Sidebar"
        className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-border-subtle bg-surface-raised/35 p-2.5 sm:p-3 flex md:flex-col justify-between overflow-x-auto md:overflow-y-auto"
      >
        <div className="w-full space-y-4">
          {/* Main Collection Group */}
          <div>
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 mb-1 font-mono text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              <span>Explorer</span>
            </div>
            <nav className="flex md:flex-col gap-1 w-full" aria-label="Collections">
              {/* All Projects */}
              <button
                type="button"
                onClick={() => {
                  setActiveFilter("all");
                  setSelectedSlug(null);
                }}
                className={`
                  flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left shrink-0 cursor-pointer
                  ${
                    activeFilter === "all"
                      ? "bg-accent/15 text-accent border border-accent/30 font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <rect x="2" y="2" width="12" height="12" rx="2" />
                    <path d="M2 6h12" />
                  </svg>
                  <span>All Projects</span>
                </div>
                <span className="font-mono text-[10px] text-text-muted">
                  {projects.length}
                </span>
              </button>

              {/* Featured */}
              <button
                type="button"
                onClick={() => {
                  setActiveFilter("featured");
                  setSelectedSlug(null);
                }}
                className={`
                  flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left shrink-0 cursor-pointer
                  ${
                    activeFilter === "featured"
                      ? "bg-accent/15 text-accent border border-accent/30 font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <polygon points="8,2 10,6 14.5,6.8 11.2,10 12,14.5 8,12.2 4,14.5 4.8,10 1.5,6.8 6,6" />
                  </svg>
                  <span>Featured</span>
                </div>
                <span className="font-mono text-[10px] text-text-muted">
                  {projects.filter((p) => p.featured).length}
                </span>
              </button>
            </nav>
          </div>

          {/* Categories Group */}
          <div className="hidden md:block">
            <div className="flex items-center gap-1.5 px-2 py-1 mb-1 font-mono text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              <span>Categories</span>
            </div>
            <nav className="flex flex-col gap-1 w-full" aria-label="Categories">
              {categories.map((cat) => {
                const count = projects.filter((p) => p.category === cat).length;
                const isSelected = activeFilter === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setActiveFilter(cat);
                      setSelectedSlug(null);
                    }}
                    className={`
                      flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left cursor-pointer
                      ${
                        isSelected
                          ? "bg-accent/15 text-accent border border-accent/30 font-semibold"
                          : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                      <span>{cat}</span>
                    </div>
                    <span className="font-mono text-[10px] text-text-muted">
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Details */}
        <div className="hidden md:block pt-3 border-t border-border-subtle text-[10px] font-mono text-text-muted">
          <span>Target: Window ID `project:&lt;slug&gt;`</span>
        </div>
      </aside>

      {/* ----------------------------------------------------------------- */}
      {/* Main Workspace: Toolbar, Content Grid/List, Status Bar            */}
      {/* ----------------------------------------------------------------- */}
      <section className="flex-1 flex flex-col min-w-0 min-h-0 bg-surface">
        {/* Workspace Toolbar */}
        <header className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 sm:px-4 sm:py-2 border-b border-border-subtle bg-surface-raised/20 shrink-0">
          {/* Left: Path Breadcrumbs */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-text-muted truncate">
            <span>projects</span>
            <span>/</span>
            <span className="text-text-primary font-medium capitalize">
              {activeFilter === "all"
                ? "all-projects"
                : activeFilter === "featured"
                ? "featured"
                : activeFilter.toLowerCase()}
            </span>
          </div>

          {/* Right: Search Input & View Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Real-time Search Box */}
            <div className="relative w-44 sm:w-60">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-text-muted">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="7" cy="7" r="5" />
                  <path d="M11 11l3.5 3.5" strokeLinecap="round" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                aria-label="Search projects by title, description, tech, or category"
                className="w-full pl-7 pr-6 py-1 rounded-md bg-white/[0.04] border border-border-subtle focus:border-accent text-xs text-text-primary placeholder:text-text-muted outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 1l10 10M11 1L1 11" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-md border border-border-subtle p-0.5 bg-white/[0.02]">
              <button
                type="button"
                aria-label="Grid view"
                title="Grid view"
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded cursor-pointer ${
                  viewMode === "grid" ? "bg-white/[0.1] text-text-primary" : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="5" height="5" rx="1" />
                  <rect x="9" y="2" width="5" height="5" rx="1" />
                  <rect x="2" y="9" width="5" height="5" rx="1" />
                  <rect x="9" y="9" width="5" height="5" rx="1" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="List view"
                title="List view"
                onClick={() => setViewMode("list")}
                className={`p-1 rounded cursor-pointer ${
                  viewMode === "list" ? "bg-white/[0.1] text-text-primary" : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="2" y1="4" x2="14" y2="4" />
                  <line x1="2" y1="8" x2="14" y2="8" />
                  <line x1="2" y1="12" x2="14" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Project Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-6 rounded-lg border border-dashed border-border-subtle bg-surface-raised/10">
              <p className="text-xs text-text-secondary font-medium">No projects matched your criteria</p>
              <p className="font-mono text-[11px] text-text-muted mt-1">Try resetting the search or category</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="mt-3 px-3 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] border border-border-subtle text-xs font-mono text-accent cursor-pointer transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* ------------------------------------------------------------- */
            /* Grid View: Interactive Project Explorer Items                 */
            /* ------------------------------------------------------------- */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="list">
              {filteredProjects.map((project) => {
                const isSelected = selectedSlug === project.slug;

                return (
                  <article
                    key={project.id}
                    role="listitem"
                    tabIndex={0}
                    onClick={() => setSelectedSlug(project.slug)}
                    onDoubleClick={() => handleOpenProject(project)}
                    onKeyDown={(e) => handleKeyDown(e, project)}
                    className={`
                      group flex flex-col justify-between p-3.5 rounded-lg transition-all outline-none cursor-pointer
                      focus-visible:ring-1 focus-visible:ring-accent
                      ${
                        isSelected
                          ? "bg-accent/10 border border-accent/40 shadow-[0_0_0_1px_rgba(106,152,255,0.25)]"
                          : "bg-surface-raised/40 border border-border-subtle hover:border-border-highlight hover:bg-surface-raised/70"
                      }
                    `}
                  >
                    <div className="space-y-2">
                      {/* Category, Status & Featured Badge */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-white/[0.04] border border-border-subtle text-text-muted uppercase">
                            {project.category}
                          </span>
                          {project.featured && (
                            <span className="font-mono text-[9px] text-amber-300">
                              ★
                            </span>
                          )}
                        </div>

                        {project.status && (
                          <div className="flex items-center gap-1 font-mono text-[10px] text-text-muted">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                project.status === "Active"
                                  ? "bg-status-online"
                                  : project.status === "Prototype"
                                  ? "bg-status-idle"
                                  : "bg-text-muted"
                              }`}
                            />
                            <span>{project.status}</span>
                          </div>
                        )}
                      </div>

                      {/* Project Title */}
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded bg-white/[0.04] border border-white/[0.06] text-accent shrink-0">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="2.5" y="3" width="11" height="10" rx="1.5" />
                            <path d="M2.5 7h11" />
                          </svg>
                        </span>
                        <h3 className="text-xs sm:text-sm font-semibold text-text-primary tracking-tight group-hover:text-accent transition-colors truncate">
                          {project.title}
                        </h3>
                      </div>

                      {/* Short Description */}
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                        {project.shortDescription}
                      </p>

                      {/* Technologies Pills */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {project.technologies.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-white/[0.03] border border-white/[0.06] text-text-muted"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Action Bar */}
                    <div className="mt-3.5 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-text-muted truncate max-w-[140px]">
                        project:{project.slug}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProject(project);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded bg-accent/15 hover:bg-accent/25 border border-accent/30 text-[11px] font-mono font-medium text-accent transition-colors cursor-pointer"
                      >
                        <span>Open Detail</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* ------------------------------------------------------------- */
            /* List View: Modern Detail File Explorer Layout                 */
            /* ------------------------------------------------------------- */
            <div className="rounded-lg border border-border-subtle overflow-hidden bg-surface-raised/20" role="table">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-border-subtle font-mono text-[10px] text-text-muted uppercase tracking-wider bg-white/[0.02]">
                <div className="col-span-5 sm:col-span-4">Project Name</div>
                <div className="col-span-3 sm:col-span-2">Category</div>
                <div className="hidden sm:block sm:col-span-4">Stack</div>
                <div className="col-span-4 sm:col-span-2 text-right">Action</div>
              </div>

              <div className="divide-y divide-border-subtle/40">
                {filteredProjects.map((project) => {
                  const isSelected = selectedSlug === project.slug;

                  return (
                    <div
                      key={project.id}
                      role="row"
                      tabIndex={0}
                      onClick={() => setSelectedSlug(project.slug)}
                      onDoubleClick={() => handleOpenProject(project)}
                      onKeyDown={(e) => handleKeyDown(e, project)}
                      className={`
                        grid grid-cols-12 gap-2 items-center px-3 py-2.5 text-xs transition-colors cursor-pointer outline-none
                        focus-visible:ring-1 focus-visible:ring-accent
                        ${
                          isSelected
                            ? "bg-accent/12 text-text-primary"
                            : "hover:bg-white/[0.04] text-text-secondary"
                        }
                      `}
                    >
                      <div className="col-span-5 sm:col-span-4 flex items-center gap-2 min-w-0">
                        <span className="text-accent shrink-0">▤</span>
                        <span className="font-medium text-text-primary truncate">
                          {project.title}
                        </span>
                      </div>

                      <div className="col-span-3 sm:col-span-2 font-mono text-[11px] text-text-muted">
                        {project.category}
                      </div>

                      <div className="hidden sm:block sm:col-span-4 font-mono text-[10px] text-text-muted truncate">
                        {project.technologies.join(" · ")}
                      </div>

                      <div className="col-span-4 sm:col-span-2 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProject(project);
                          }}
                          className="px-2 py-0.5 rounded bg-accent/15 hover:bg-accent/25 border border-accent/30 text-[10px] font-mono text-accent transition-colors cursor-pointer"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <footer className="flex items-center justify-between px-3 py-1.5 border-t border-border-subtle bg-surface-raised/30 font-mono text-[10px] text-text-muted shrink-0">
          <div className="flex items-center gap-2">
            <span>{filteredProjects.length} projects listed</span>
            {selectedSlug && (
              <>
                <span>•</span>
                <span className="text-accent">Selected: {selectedSlug}</span>
              </>
            )}
          </div>
          <div className="hidden sm:block">
            Double-click or press Enter to launch window
          </div>
        </footer>
      </section>
    </div>
  );
}
