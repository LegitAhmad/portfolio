import type { ReactNode } from "react";

export interface TaskbarItemProps {
  id: string;
  title: string;
  icon: ReactNode;
  isActive?: boolean;
  isMinimized?: boolean;
  onClick?: () => void;
}

/**
 * Visual component representing an application window in the taskbar.
 * Designed to cleanly scale from mobile icon pills to full desktop tabs.
 */
export function TaskbarItem({
  title,
  icon,
  isActive = false,
  isMinimized = false,
  onClick,
}: TaskbarItemProps) {
  return (
    <button
      type="button"
      aria-label={`Switch to ${title}`}
      aria-pressed={isActive}
      onClick={onClick}
      className={`
        relative group flex items-center gap-2 h-8 px-2.5 rounded-md
        transition-all duration-150 select-none cursor-pointer outline-none
        focus-visible:ring-1 focus-visible:ring-accent/70
        ${
          isActive
            ? "bg-white/[0.08] text-text-primary border border-white/[0.12]"
            : isMinimized
            ? "bg-transparent text-text-muted hover:bg-white/[0.04] hover:text-text-secondary border border-transparent"
            : "bg-white/[0.03] text-text-secondary hover:bg-white/[0.06] hover:text-text-primary border border-white/[0.05]"
        }
      `}
    >
      {/* Icon */}
      <span className="flex items-center justify-center shrink-0 w-4 h-4">
        {icon}
      </span>

      {/* Label (hidden on small mobile screens) */}
      <span className="hidden md:inline-block max-w-[120px] truncate text-xs font-medium tracking-tight">
        {title}
      </span>

      {/* Active accent pill indicator on bottom */}
      <span
        aria-hidden="true"
        className={`
          absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all duration-150
          ${
            isActive
              ? "bg-accent opacity-100 shadow-[0_0_8px_rgba(106,152,255,0.8)]"
              : isMinimized
              ? "bg-white/20 opacity-40"
              : "bg-white/30 opacity-0 group-hover:opacity-60"
          }
        `}
      />
    </button>
  );
}
