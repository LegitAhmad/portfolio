"use client";

import { type KeyboardEvent, type MouseEvent, useRef } from "react";
import type { DesktopAppDefinition } from "@/lib/desktop-apps";
import { AppGlyph } from "./icon-glyphs";

export interface DesktopIconProps {
  app: DesktopAppDefinition;
  isSelected: boolean;
  onSelect: (id: DesktopAppDefinition["id"]) => void;
  onOpen: (id: DesktopAppDefinition["id"]) => void;
}

/**
 * Reusable desktop icon component.
 * 
 * Supports:
 * - Single-click selection
 * - Double-click activation (desktop standard)
 * - Keyboard navigation (Tab, Enter to open, Space to select)
 * - Touch interaction (tap to select, double tap or second tap to open)
 * - Clear hover, selected, and visible focus states
 */
export function DesktopIcon({
  app,
  isSelected,
  onSelect,
  onOpen,
}: DesktopIconProps) {
  const lastTapRef = useRef<number>(0);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    // On touch devices or mobile viewport, tap on an already-selected icon opens it
    const isTouch =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 640);

    if (isTouch && isSelected) {
      onOpen(app.id);
    } else {
      onSelect(app.id);
    }
  };

  const handleDoubleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onOpen(app.id);
  };

  // Keyboard accessibility
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onOpen(app.id);
    } else if (e.key === " ") {
      e.preventDefault();
      onSelect(app.id);
    }
  };

  // Touch optimization: fast double tap opens immediately
  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    lastTapRef.current = now;

    if (timeSinceLastTap < 350 && timeSinceLastTap > 0) {
      e.preventDefault();
      onOpen(app.id);
    }
  };

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={`${app.title}${app.isDocument ? " (Downloadable PDF)" : ""}`}
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onTouchEnd={handleTouchEnd}
      className={`
        group relative flex flex-col items-center justify-start
        w-[84px] p-2 rounded-lg transition-all duration-150 outline-none
        select-none cursor-pointer
        focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background
        ${
          isSelected
            ? "bg-accent/12 border border-accent/40 shadow-[0_0_0_1px_rgba(106,152,255,0.2),0_4px_16px_rgba(0,0,0,0.45)]"
            : "border border-transparent hover:bg-white/[0.05] hover:border-white/[0.09]"
        }
      `}
    >
      {/* Icon frame */}
      <div
        className={`
          relative flex items-center justify-center w-12 h-12 rounded-lg
          transition-transform duration-150 group-active:scale-95
          ${
            isSelected
              ? "bg-surface-raised border border-accent/50 text-accent"
              : "bg-surface-raised/70 border border-white/[0.09] text-text-secondary group-hover:text-text-primary group-hover:border-white/[0.16] group-hover:bg-surface-raised"
          }
        `}
      >
        <AppGlyph id={app.id} size={24} />

        {/* Optional document / format badge */}
        {app.badge && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1 px-1 py-0.2 font-mono text-[9px] font-semibold tracking-wider rounded bg-accent/20 border border-accent/40 text-accent"
          >
            {app.badge}
          </span>
        )}
      </div>

      {/* Label */}
      <span
        className={`
          mt-1.5 text-center text-xs font-medium tracking-tight leading-tight line-clamp-2
          transition-colors duration-150
          ${
            isSelected
              ? "text-text-primary px-1.5 py-0.5 rounded bg-accent/20 font-semibold"
              : "text-text-secondary group-hover:text-text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
          }
        `}
      >
        {app.title}
      </span>
    </button>
  );
}
