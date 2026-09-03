import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, fetchProjectBySlug, getAllProjects } from "@/lib/data/projects";
import { ProjectDetailView } from "@/components/apps/project-explorer/project-detail-view";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = (await fetchProjectBySlug(slug)) || getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found — Portfolio",
    };
  }

  return {
    title: `${project.title} — Portfolio Project`,
    description: project.shortDescription,
  };
}

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((p) => ({
    slug: p.slug,
  }));
}

/**
 * Stable standalone project route (/projects/[slug]).
 * Works independently from desktop ephemeral state.
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = (await fetchProjectBySlug(slug)) || getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent/30">
      {/* Standalone Route Header */}
      <header className="sticky top-0 z-20 h-13 border-b border-border-subtle bg-surface-taskbar backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Return to Desktop"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-border-subtle text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
          >
            <span aria-hidden="true">←</span>
            <span>Desktop</span>
          </Link>

          <div aria-hidden="true" className="w-px h-4 bg-white/10" />

          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-text-muted">
            <Link href="/" className="hover:text-text-primary transition-colors">
              Portfolio
            </Link>
            <span>/</span>
            <span>Projects</span>
            <span>/</span>
            <span className="text-text-primary font-medium">{project.title}</span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-3 py-1 rounded-md bg-accent/15 hover:bg-accent/25 border border-accent/30 text-xs font-mono text-accent transition-colors"
          >
            Launch Desktop View
          </Link>
        </div>
      </header>

      {/* Main Presentation Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <div className="rounded-xl border border-border-default bg-surface/90 shadow-2xl overflow-hidden">
          <ProjectDetailView project={project} standalone={true} />
        </div>
      </main>
    </div>
  );
}
