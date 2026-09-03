"use client";

import { useWindowStore } from "@/stores/window-store";
import { APP_REGISTRY } from "@/lib/app-registry";
import { TaskbarClock } from "./taskbar-clock";
import { TaskbarItem } from "./taskbar-item";

export interface TaskbarProps {
  onLauncherClick?: () => void;
}

/**
 * Taskbar component connected to the window management system.
 * 
 * Accurately displays active, inactive, and minimized windows.
 * Clicking a taskbar item:
 * - Restores and focuses if minimized
 * - Minimizes if currently active
 * - Brings to focus if currently inactive
 */
export function Taskbar({ onLauncherClick }: TaskbarProps) {
  const windowOrder = useWindowStore((state) => state.windowOrder);
  const windows = useWindowStore((state) => state.windows);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);

  const focusWindow = useWindowStore((state) => state.focusWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const restoreWindow = useWindowStore((state) => state.restoreWindow);
  const openWindow = useWindowStore((state) => state.openWindow);

  const handleTaskbarItemClick = (id: string) => {
    const item = windows[id];
    if (!item) return;

    if (item.minimized) {
      restoreWindow(id);
      focusWindow(id);
    } else if (activeWindowId === id) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  };

  const handleDefaultLauncherClick = () => {
    if (onLauncherClick) {
      onLauncherClick();
      return;
    }
    // If no window is open, open Project Explorer
    if (windowOrder.length === 0) {
      openWindow("projects");
    } else if (activeWindowId) {
      // Toggle active window
      minimizeWindow(activeWindowId);
    } else {
      // Restore the first window in order
      const firstId = windowOrder[0];
      if (firstId) {
        restoreWindow(firstId);
        focusWindow(firstId);
      }
    }
  };

  return (
    <nav
      role="region"
      aria-label="Desktop Taskbar"
      className="fixed bottom-0 left-0 right-0 z-50 h-11 sm:h-12 bg-surface-taskbar backdrop-blur-md border-t border-border-subtle shadow-taskbar select-none"
    >
      <div className="flex items-center justify-between h-full px-2 sm:px-3">
        {/* Left Section: Launcher & Open Application Items */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          {/* Portfolio Launcher Button */}
          <button
            type="button"
            aria-label="Portfolio Launcher"
            title="Portfolio Launcher"
            onClick={handleDefaultLauncherClick}
            className="flex items-center gap-2 h-8 px-2 sm:px-2.5 rounded-md hover:bg-white/[0.07] active:bg-white/[0.1] transition-colors outline-none focus-visible:ring-1 focus-visible:ring-accent/70 cursor-pointer shrink-0"
          >
            {/* Geometric Portfolio Monogram */}
            <span className="flex items-center justify-center w-5 h-5 rounded bg-accent/15 border border-accent/30 text-accent">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="1" y="1" width="4.5" height="4.5" rx="1" fill="currentColor" />
                <rect x="6.5" y="1" width="4.5" height="4.5" rx="1" fill="currentColor" fillOpacity="0.4" />
                <rect x="1" y="6.5" width="4.5" height="4.5" rx="1" fill="currentColor" fillOpacity="0.4" />
                <rect x="6.5" y="6.5" width="4.5" height="4.5" rx="1" fill="currentColor" />
              </svg>
            </span>
            <span className="hidden sm:inline-block font-mono text-xs font-semibold tracking-tight text-text-primary">
              Portfolio
            </span>
          </button>

          {/* Vertical separator */}
          <div aria-hidden="true" className="w-px h-4 bg-white/10 mx-0.5 shrink-0" />

          {/* Running / Active Application Items */}
          <div
            className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5"
            role="tablist"
            aria-label="Open Applications"
          >
            {windowOrder.map((id) => {
              const item = windows[id];
              if (!item) return null;
              const appDef = APP_REGISTRY[item.type];
              const IconComp = appDef?.icon;
              const isItemActive = activeWindowId === id && !item.minimized;

              return (
                <TaskbarItem
                  key={id}
                  id={id}
                  title={item.title || appDef?.title || id}
                  icon={IconComp ? <IconComp size={15} /> : null}
                  isActive={isItemActive}
                  isMinimized={item.minimized}
                  onClick={() => handleTaskbarItemClick(id)}
                />
              );
            })}
          </div>
        </div>

        {/* Right Section: System Tray & Clock */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Active window count pill */}
          {windowOrder.length > 0 && (
            <div
              className="hidden lg:flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] text-text-muted bg-white/[0.03] border border-white/[0.05]"
              title={`${windowOrder.length} open application window${windowOrder.length > 1 ? "s" : ""}`}
            >
              <span>{windowOrder.length} active</span>
            </div>
          )}

          {/* Status Indicator */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.03] border border-white/[0.05]"
            title="System status: Environment ready"
          >
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 rounded-full bg-status-online shadow-[0_0_6px_rgba(52,211,153,0.6)]"
            />
            <span className="font-mono text-[11px] text-text-muted tracking-wide">
              Ready
            </span>
          </div>

          {/* Vertical separator on desktop */}
          <div aria-hidden="true" className="hidden md:block w-px h-4 bg-white/10 mx-0.5" />

          {/* Live System Clock */}
          <TaskbarClock />
        </div>
      </div>
    </nav>
  );
}
