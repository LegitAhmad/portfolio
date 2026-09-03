"use client";

import { DESKTOP_APPLICATIONS, type ApplicationId } from "@/lib/desktop-apps";
import { DesktopIcon } from "./desktop-icon";

export interface DesktopIconGridProps {
  selectedAppId: ApplicationId | null;
  onSelectApp: (id: ApplicationId | null) => void;
  onOpenApp: (id: ApplicationId) => void;
}

/**
 * Desktop icon area with responsive composition:
 * - Desktop: Vertical column arrangement on the left margin
 * - Tablet: Compact vertical column layout with tighter gutters
 * - Mobile: Centered launcher-style grid arrangement
 */
export function DesktopIconGrid({
  selectedAppId,
  onSelectApp,
  onOpenApp,
}: DesktopIconGridProps) {
  return (
    <section
      aria-label="Desktop Applications"
      className="relative z-10 select-none pointer-events-auto"
    >
      {/* 
        Desktop / Tablet layout:
        Positioned as a left vertical column with grid-flow-col
      */}
      <div className="hidden sm:grid sm:grid-flow-col sm:auto-rows-[92px] sm:w-max sm:gap-2.5 sm:p-5 md:p-6">
        {DESKTOP_APPLICATIONS.map((app) => (
          <DesktopIcon
            key={app.id}
            app={app}
            isSelected={selectedAppId === app.id}
            onSelect={(id) => onSelectApp(id)}
            onOpen={onOpenApp}
          />
        ))}
      </div>

      {/* 
        Mobile layout:
        Launcher-style grid arrangement centered at the top
      */}
      <div className="sm:hidden px-4 pt-4 pb-20 max-w-[360px] mx-auto">
        <div className="grid grid-cols-3 gap-3 justify-items-center">
          {DESKTOP_APPLICATIONS.map((app) => (
            <DesktopIcon
              key={app.id}
              app={app}
              isSelected={selectedAppId === app.id}
              onSelect={(id) => onSelectApp(id)}
              onOpen={onOpenApp}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
