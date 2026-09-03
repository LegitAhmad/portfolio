export type ApplicationId =
  | "projects"
  | "about"
  | "links"
  | "experience"
  | "skills"
  | "resume";

export interface DesktopAppDefinition {
  id: ApplicationId;
  title: string;
  shortLabel: string;
  description: string;
  isDocument?: boolean;
  shortcut?: string;
  badge?: string;
}

export const DESKTOP_APPLICATIONS: readonly DesktopAppDefinition[] = [
  {
    id: "projects",
    title: "Project Explorer",
    shortLabel: "Projects",
    description: "Browse curated engineering projects, technical demos, and repositories.",
  },
  {
    id: "about",
    title: "About Me",
    shortLabel: "About",
    description: "Background, engineering philosophy, and personal narrative.",
  },
  {
    id: "links",
    title: "Links",
    shortLabel: "Links",
    description: "Online profiles, social channels, and public presence.",
  },
  {
    id: "experience",
    title: "Experience",
    shortLabel: "Experience",
    description: "Career history, leadership roles, and company timelines.",
  },
  {
    id: "skills",
    title: "Skills",
    shortLabel: "Skills",
    description: "Core technologies, architectures, systems, and toolchains.",
  },
  {
    id: "resume",
    title: "Resume",
    shortLabel: "Resume",
    description: "Downloadable PDF curriculum vitae.",
    isDocument: true,
    badge: "PDF",
  },
] as const;

export const DESKTOP_APPS_BY_ID = Object.fromEntries(
  DESKTOP_APPLICATIONS.map((app) => [app.id, app])
) as Record<ApplicationId, DesktopAppDefinition>;
