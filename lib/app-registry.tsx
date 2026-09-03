"use client";

import type { ComponentType, JSX } from "react";
import type { WindowType } from "@/stores/window-store";
import {
  ProjectExplorerGlyph,
  AboutMeGlyph,
  LinksGlyph,
  ExperienceGlyph,
  SkillsGlyph,
} from "@/components/desktop/icons/icon-glyphs";

// Import decoupled application component trees
import { ProjectExplorerApp } from "@/components/apps/project-explorer/project-explorer-app";
import { ProjectDetailApp } from "@/components/apps/project-explorer/project-detail-app";
import { AboutApp } from "@/components/apps/about/about-app";
import { LinksApp } from "@/components/apps/links/links-app";
import { ExperienceApp } from "@/components/apps/experience/experience-app";
import { SkillsApp } from "@/components/apps/skills/skills-app";

export interface AppProps {
  windowId: string;
  metadata?: Record<string, unknown>;
}

export interface AppRegistryItem {
  type: WindowType;
  title: string;
  shortLabel: string;
  description: string;
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  isSingleton: boolean;
  allowResize?: boolean;
  allowMaximize?: boolean;
  icon: (props: { size?: number; className?: string }) => JSX.Element;
  component: ComponentType<AppProps>;
}

/**
 * Central Application Registry.
 * 
 * Maps WindowType to metadata and independent component trees.
 * Adding an application only requires an entry here without altering desktop infrastructure.
 */
export const APP_REGISTRY: Record<WindowType, AppRegistryItem> = {
  projects: {
    type: "projects",
    title: "Project Explorer",
    shortLabel: "Projects",
    description: "Browse curated engineering projects, technical demos, and repositories.",
    defaultSize: { width: 780, height: 520 },
    minSize: { width: 360, height: 280 },
    isSingleton: true,
    allowResize: true,
    allowMaximize: true,
    icon: (props) => <ProjectExplorerGlyph {...props} />,
    component: ProjectExplorerApp,
  },
  about: {
    type: "about",
    title: "About Me",
    shortLabel: "About",
    description: "Background, engineering philosophy, and personal narrative.",
    defaultSize: { width: 580, height: 480 },
    minSize: { width: 340, height: 260 },
    isSingleton: true,
    allowResize: true,
    allowMaximize: true,
    icon: (props) => <AboutMeGlyph {...props} />,
    component: AboutApp,
  },
  links: {
    type: "links",
    title: "Links",
    shortLabel: "Links",
    description: "Online profiles, social channels, and public presence.",
    defaultSize: { width: 500, height: 440 },
    minSize: { width: 320, height: 240 },
    isSingleton: true,
    allowResize: true,
    allowMaximize: true,
    icon: (props) => <LinksGlyph {...props} />,
    component: LinksApp,
  },
  experience: {
    type: "experience",
    title: "Experience",
    shortLabel: "Experience",
    description: "Career history, leadership roles, and company timelines.",
    defaultSize: { width: 640, height: 500 },
    minSize: { width: 340, height: 280 },
    isSingleton: true,
    allowResize: true,
    allowMaximize: true,
    icon: (props) => <ExperienceGlyph {...props} />,
    component: ExperienceApp,
  },
  skills: {
    type: "skills",
    title: "Skills",
    shortLabel: "Skills",
    description: "Core technologies, architectures, systems, and toolchains.",
    defaultSize: { width: 620, height: 480 },
    minSize: { width: 340, height: 260 },
    isSingleton: true,
    allowResize: true,
    allowMaximize: true,
    icon: (props) => <SkillsGlyph {...props} />,
    component: SkillsApp,
  },
  project: {
    type: "project",
    title: "Project Detail",
    shortLabel: "Project",
    description: "Dedicated project detail window.",
    defaultSize: { width: 680, height: 520 },
    minSize: { width: 360, height: 300 },
    isSingleton: false,
    allowResize: true,
    allowMaximize: true,
    icon: (props) => <ProjectExplorerGlyph {...props} />,
    component: ProjectDetailApp,
  },
};
