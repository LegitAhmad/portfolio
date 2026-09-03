import type { SVGProps } from "react";
import type { ApplicationId } from "@/lib/desktop-apps";

interface GlyphProps extends SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export function ProjectExplorerGlyph({
  size = 24,
  className = "",
  ...props
}: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Window / folder frame */}
      <rect x="3" y="4" width="18" height="16" rx="2.5" className="fill-white/[0.04]" />
      {/* Top divider */}
      <path d="M3 9h18" strokeOpacity="0.4" />
      {/* Left sidebar divider */}
      <path d="M8.5 9v11" strokeOpacity="0.3" />
      {/* Sidebar file indicators */}
      <rect x="5" y="11.5" width="2" height="2" rx="0.5" className="fill-accent/60 stroke-none" />
      <rect x="5" y="15" width="2" height="2" rx="0.5" className="fill-white/30 stroke-none" />
      {/* Grid content blocks */}
      <rect x="11" y="12" width="7" height="2" rx="0.5" strokeOpacity="0.5" />
      <rect x="11" y="16" width="4.5" height="2" rx="0.5" strokeOpacity="0.3" />
      {/* Status dot */}
      <circle cx="5.5" cy="6.5" r="0.75" className="fill-accent stroke-none" />
      <circle cx="8" cy="6.5" r="0.75" className="fill-white/40 stroke-none" />
    </svg>
  );
}

export function AboutMeGlyph({
  size = 24,
  className = "",
  ...props
}: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Identity badge boundary */}
      <rect x="3.5" y="4" width="17" height="16" rx="3" className="fill-white/[0.04]" />
      {/* Badge clip hole */}
      <rect x="9.5" y="2.5" width="5" height="2.5" rx="1.25" strokeOpacity="0.6" className="fill-[#090b10]" />
      {/* Avatar head */}
      <circle cx="12" cy="10" r="2.75" strokeOpacity="0.9" className="fill-white/[0.08]" />
      {/* Avatar shoulders */}
      <path d="M7.5 17c0-2.2 2-3.5 4.5-3.5s4.5 1.3 4.5 3.5" strokeOpacity="0.9" />
      {/* Accent dot on corner */}
      <circle cx="17.5" cy="7" r="1" className="fill-accent stroke-none" />
    </svg>
  );
}

export function LinksGlyph({
  size = 24,
  className = "",
  ...props
}: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Outer subtle frame */}
      <rect x="3" y="3" width="18" height="18" rx="3" className="fill-white/[0.03]" strokeOpacity="0.3" />
      {/* Connected nodes */}
      <circle cx="8" cy="8" r="2" className="fill-accent/20 stroke-accent" />
      <circle cx="16" cy="9" r="2" className="fill-white/[0.08]" />
      <circle cx="13" cy="16" r="2" className="fill-white/[0.08]" />
      {/* Edge links */}
      <path d="M9.8 8.8l4.4.7" strokeOpacity="0.5" />
      <path d="M9.2 9.5l2.6 5" strokeOpacity="0.5" />
      <path d="M15.2 10.7l-1.5 3.8" strokeOpacity="0.4" />
      {/* Arrow outbound pip */}
      <path d="M17.5 4.5l2 2m0 0h-2m2 0v-2" strokeOpacity="0.8" className="stroke-accent" />
    </svg>
  );
}

export function ExperienceGlyph({
  size = 24,
  className = "",
  ...props
}: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Case body */}
      <rect x="3.5" y="7" width="17" height="13" rx="2.5" className="fill-white/[0.04]" />
      {/* Handle */}
      <path d="M9 7V5.2a1.7 1.7 0 0 1 1.7-1.7h2.6a1.7 1.7 0 0 1 1.7 1.7V7" strokeOpacity="0.7" />
      {/* Horizontal seam */}
      <path d="M3.5 12h17" strokeOpacity="0.3" />
      {/* Timeline track nodes */}
      <path d="M8 12v3" strokeOpacity="0.5" />
      <path d="M12 12v4.5" className="stroke-accent" />
      <path d="M16 12v2" strokeOpacity="0.5" />
      <circle cx="12" cy="16.5" r="1" className="fill-accent stroke-none" />
    </svg>
  );
}

export function SkillsGlyph({
  size = 24,
  className = "",
  ...props
}: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Modular component layers / chip */}
      <rect x="4" y="4" width="16" height="16" rx="3" className="fill-white/[0.04]" />
      {/* Internal core chip */}
      <rect x="8" y="8" width="8" height="8" rx="1.5" className="fill-accent/15 stroke-accent" />
      {/* Pin connectors */}
      <path d="M10 4v2" strokeOpacity="0.5" />
      <path d="M14 4v2" strokeOpacity="0.5" />
      <path d="M10 18v2" strokeOpacity="0.5" />
      <path d="M14 18v2" strokeOpacity="0.5" />
      <path d="M4 10h2" strokeOpacity="0.5" />
      <path d="M4 14h2" strokeOpacity="0.5" />
      <path d="M18 10h2" strokeOpacity="0.5" />
      <path d="M18 14h2" strokeOpacity="0.5" />
    </svg>
  );
}

export function ResumeGlyph({
  size = 24,
  className = "",
  ...props
}: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Document sheet with folded corner */}
      <path
        d="M6 3.5h7.5L18.5 8v12.5a2 2 0 0 1-2 2h-10.5a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2z"
        className="fill-white/[0.04]"
      />
      {/* Fold corner path */}
      <path d="M13.5 3.5V8H18" strokeOpacity="0.5" />
      {/* Text lines */}
      <path d="M8.5 11h4" strokeOpacity="0.5" />
      <path d="M8.5 14h3" strokeOpacity="0.4" />
      {/* Download arrow badge */}
      <circle cx="15.5" cy="16.5" r="3.2" className="fill-[#090b10] stroke-accent" strokeWidth="1.2" />
      <path d="M15.5 15v3m0 0l-1-1m1 1l1-1" className="stroke-accent" strokeWidth="1.2" />
    </svg>
  );
}

export function AppGlyph({
  id,
  size = 24,
  className = "",
  ...props
}: GlyphProps & { id: ApplicationId }) {
  switch (id) {
    case "projects":
      return <ProjectExplorerGlyph size={size} className={className} {...props} />;
    case "about":
      return <AboutMeGlyph size={size} className={className} {...props} />;
    case "links":
      return <LinksGlyph size={size} className={className} {...props} />;
    case "experience":
      return <ExperienceGlyph size={size} className={className} {...props} />;
    case "skills":
      return <SkillsGlyph size={size} className={className} {...props} />;
    case "resume":
      return <ResumeGlyph size={size} className={className} {...props} />;
  }
}
