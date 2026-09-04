"use client";

import { useEffect, useState } from "react";
import { Wallpaper } from "./wallpaper";
import { DesktopIconGrid } from "./icons/desktop-icon-grid";
import { Taskbar } from "./taskbar/taskbar";
import { WindowLayer } from "./window/window-layer";
import { DESKTOP_APPS_BY_ID, type ApplicationId } from "@/lib/desktop-apps";
import { useWindowStore, type WindowType } from "@/stores/window-store";
import { APP_REGISTRY } from "@/lib/app-registry";
import { executeResumeDownload } from "@/lib/data/resume";

export function Desktop() {
  const [selectedAppId, setSelectedAppId] = useState<ApplicationId | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const openWindow = useWindowStore((state) => state.openWindow);

  // Open default Project Explorer window on first load if no windows exist
  useEffect(() => {
    if (useWindowStore.getState().windowOrder.length === 0) {
      openWindow("projects", {
        title: APP_REGISTRY.projects.title,
        defaultSize: APP_REGISTRY.projects.defaultSize,
        minSize: APP_REGISTRY.projects.minSize,
      });
    }

    // Accessibility: Escape minimizes active window when not in an input field
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
          return;
        }
        const activeId = useWindowStore.getState().activeWindowId;
        if (activeId) {
          useWindowStore.getState().minimizeWindow(activeId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openWindow]);

  // Clear icon selection when clicking empty desktop canvas
  const handleDesktopBackgroundClick = () => {
    setSelectedAppId(null);
  };

  // Open application handler
  const handleOpenApp = (id: ApplicationId) => {
    const app = DESKTOP_APPS_BY_ID[id];
    if (!app) return;

    if (app.isDocument || id === "resume") {
      executeResumeDownload((message) => {
        setNotification(message);
        setTimeout(() => {
          setNotification((prev) => (prev ? null : prev));
        }, 3500);
      });
      return;
    }

    const windowType = id as WindowType;
    const appDef = APP_REGISTRY[windowType];

    if (appDef) {
      openWindow(windowType, {
        title: appDef.title,
        defaultSize: appDef.defaultSize,
        minSize: appDef.minSize,
      });
    }
  };

  return (
    <main
      onClick={handleDesktopBackgroundClick}
      className="fixed inset-0 w-screen h-screen h-dvh overflow-hidden select-none bg-background text-foreground font-sans"
    >
      {/* 1. Atmospheric Wallpaper Layer */}
      <Wallpaper />

      {/* 2. Desktop Icons Area */}
      <DesktopIconGrid
        selectedAppId={selectedAppId}
        onSelectApp={setSelectedAppId}
        onOpenApp={handleOpenApp}
      />

      {/* 3. Window Management Layer */}
      <WindowLayer />

      {/* Subtle feedback toast for document/action notifications */}
      {notification && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-3.5 py-2 rounded-md bg-surface-raised/95 border border-border-default shadow-lg text-xs font-mono text-text-primary backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>{notification}</span>
          </div>
        </aside>
      )}

      {/* 4. Taskbar Layer */}
      <Taskbar />
    </main>
  );
}
