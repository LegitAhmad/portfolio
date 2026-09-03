import type { ReactNode } from "react";

export interface WallpaperProps {
  className?: string;
  showGrid?: boolean;
  customImage?: string;
  children?: ReactNode;
}

/**
 * Reusable desktop wallpaper component.
 * 
 * Provides an atmospheric, dark-first CSS-generated backdrop with subtle depth
 * and a precision grid pattern. It preserves text legibility at all times and can
 * be effortlessly replaced with an image or custom canvas in the future.
 */
export function Wallpaper({
  className = "",
  showGrid = true,
  customImage,
  children,
}: WallpaperProps) {
  return (
    <div
      aria-hidden="true"
      className={`wallpaper-canvas absolute inset-0 overflow-hidden select-none pointer-events-none ${className}`}
    >
      {/* Precision developer grid layer */}
      {showGrid && <div className="wallpaper-grid absolute inset-0 opacity-80" />}

      {/* Subtle architectural vignette for edge depth */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,8,12,0.45)_100%)]"
      />

      {/* Optional custom wallpaper image slot with guaranteed dark readability wash */}
      {customImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{ backgroundImage: `url(${customImage})` }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xs" />
        </div>
      )}

      {/* Minimal technical quadrant accent lines - ultra low opacity */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(106,152,255,0.035)_0%,transparent_70%)]" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[radial-gradient(circle,rgba(52,211,153,0.025)_0%,transparent_70%)]" />

      {children}
    </div>
  );
}
