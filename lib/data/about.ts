/**
 * Typed temporary content source for About Me.
 * Identified as structural placeholder data per Rule 10.
 */

export interface EngineeringPrinciple {
  title: string;
  statement: string;
  rationale: string;
}

export interface AboutData {
  roleHeadline: string;
  locationPlaceholder: string;
  narrativeOverview: readonly string[];
  principles: readonly EngineeringPrinciple[];
  architecturalInterests: readonly string[];
  toolchainPreferences: readonly string[];
}

export const PLACEHOLDER_ABOUT: AboutData = {
  roleHeadline: "Senior Software Engineer & Systems Architect (Placeholder)",
  locationPlaceholder: "Global / Remote",
  narrativeOverview: [
    "Specializing in high-performance web systems, distributed application platforms, and distinctive client-side browser interfaces.",
    "Driven by building software where mechanical sympathy meets intentional visual design — prioritizing clarity, strict typing, responsive feedback, and minimal operational overhead.",
    "Focused on scalable cloud-native architectures, modular full-stack codebases, and developer tools that eliminate friction.",
  ],
  principles: [
    {
      title: "Simple > Clever",
      statement: "The clearest solution is almost always the most maintainable one.",
      rationale:
        "Avoid unnecessary layers of abstraction until concrete architectural constraints demand them.",
    },
    {
      title: "Mechanical Sympathy",
      statement: "Respect the underlying platform primitives.",
      rationale:
        "Leverage web standards, native browser scheduling, and efficient data layouts instead of piling on heavy dependencies.",
    },
    {
      title: "Zero Operational Mystery",
      statement: "Systems should be observable, predictable, and resilient.",
      rationale:
        "Failures should produce structured signals and graceful fallbacks, never silent corruption or obscure trace noise.",
    },
    {
      title: "Intentional Aesthetics",
      statement: "Design is part of the engineering specification.",
      rationale:
        "Visual hierarchy, typography, and motion directly govern how effectively humans interact with software.",
    },
  ],
  architecturalInterests: [
    "Event-Driven Microservices",
    "Client-Side State Engines",
    "Serverless & Edge Compute",
    "Relational Schema Design & RLS",
    "Stream Processing & Telemetry",
  ],
  toolchainPreferences: [
    "TypeScript / Strict Typing",
    "Next.js / App Router",
    "PostgreSQL / Supabase",
    "Tailwind CSS / CSS Variables",
    "Linux / Shell Automation",
  ],
};

export function getPlaceholderAbout(): AboutData {
  return PLACEHOLDER_ABOUT;
}
