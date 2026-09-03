/**
 * Typed temporary content source for Links & Online Presence.
 */

export interface ExternalLinkItem {
  id: string;
  title: string;
  category: "Code & Contributions" | "Professional Network" | "Discussions" | "Direct Communication";
  handlePlaceholder: string;
  urlPlaceholder: string;
  description: string;
  verified: boolean;
  type: "github" | "linkedin" | "x" | "email" | "rss";
}

export const PLACEHOLDER_LINKS: readonly ExternalLinkItem[] = [
  {
    id: "link-github",
    title: "GitHub",
    category: "Code & Contributions",
    handlePlaceholder: "@portfolio-developer",
    urlPlaceholder: "https://github.com",
    description: "Open source repositories, architectural templates, and engineering experiments.",
    verified: true,
    type: "github",
  },
  {
    id: "link-linkedin",
    title: "LinkedIn",
    category: "Professional Network",
    handlePlaceholder: "in/portfolio-developer",
    urlPlaceholder: "https://linkedin.com",
    description: "Career timeline, corporate milestones, and professional network updates.",
    verified: true,
    type: "linkedin",
  },
  {
    id: "link-x",
    title: "X (Twitter)",
    category: "Discussions",
    handlePlaceholder: "@developer_dev",
    urlPlaceholder: "https://x.com",
    description: "Short-form technical commentary, architectural takeaways, and engineering links.",
    verified: true,
    type: "x",
  },
  {
    id: "link-email",
    title: "Direct Email",
    category: "Direct Communication",
    handlePlaceholder: "contact@developer.internal",
    urlPlaceholder: "mailto:contact@developer.internal",
    description: "Direct channel for architectural consultation, queries, and project inquiries.",
    verified: true,
    type: "email",
  },
] as const;

export function getPlaceholderLinks(): readonly ExternalLinkItem[] {
  return PLACEHOLDER_LINKS;
}
