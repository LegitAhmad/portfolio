"use client";

import { useMemo } from "react";
import { getProjectBySlug } from "@/lib/data/projects";
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
  const project = useMemo(() => getProjectBySlug(slug), [slug]);

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
