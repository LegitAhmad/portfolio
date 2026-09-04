"use client";

import { useState, useEffect } from "react";
import { getProjectBySlug, fetchProjectBySlug, type PortfolioProject } from "@/lib/data/projects";
import { ProjectDetailView } from "./project-detail-view";

export interface ProjectDetailAppProps {
  windowId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Window component for the "project" WindowType.
 * Wraps the reusable ProjectDetailView inside the window manager runtime.
 */
export function ProjectDetailApp({ metadata }: ProjectDetailAppProps) {
  const slug = (metadata?.projectSlug as string) || "";
  const [project, setProject] = useState<PortfolioProject | null>(() => getProjectBySlug(slug) || null);
  const [loading, setLoading] = useState<boolean>(!getProjectBySlug(slug));

  useEffect(() => {
    let active = true;
    if (!project && slug) {
      fetchProjectBySlug(slug)
        .then((res) => {
          if (active) {
            setProject(res);
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
    }

    return () => {
      active = false;
    };
  }, [slug, project]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-2 bg-surface">
        <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <p className="font-mono text-xs text-text-muted">Loading project specification...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-2 bg-surface">
        <p className="font-mono text-xs text-text-muted">Project specification not found</p>
        <p className="text-xs text-text-secondary">Identifier: {slug || "unknown"}</p>
      </div>
    );
  }

  return <ProjectDetailView project={project} />;
}
