"use client";

import { useMemo } from "react";
import { useWindowStore } from "@/stores/window-store";
import { APP_REGISTRY } from "@/lib/app-registry";
import { WindowControls } from "./window-controls";
import { useWindowInteraction, type ResizeDirection } from "@/hooks/use-window-interaction";

export interface WindowProps {
  id: string;
}

const RESIZE_HANDLES: { dir: ResizeDirection; className: string }[] = [
  { dir: "n", className: "top-0 left-3 right-3 h-2 cursor-ns-resize" },
  { dir: "s", className: "bottom-0 left-3 right-3 h-2 cursor-ns-resize" },
  { dir: "e", className: "right-0 top-3 bottom-3 w-2 cursor-ew-resize" },
  { dir: "w", className: "left-0 top-3 bottom-3 w-2 cursor-ew-resize" },
  { dir: "ne", className: "top-0 right-0 w-3.5 h-3.5 cursor-nesw-resize" },
  { dir: "nw", className: "top-0 left-0 w-3.5 h-3.5 cursor-nwse-resize" },
  { dir: "se", className: "bottom-0 right-0 w-3.5 h-3.5 cursor-nwse-resize" },
  { dir: "sw", className: "bottom-0 left-0 w-3.5 h-3.5 cursor-nesw-resize" },
];

/**
 * Reusable Window primitive.
 * 
 * Features:
 * - Selective Zustand subscription (only rerenders when its own state flips)
 * - Custom pointer-based drag (titlebar) and 8-direction resize handles
 * - Viewport bounds protection against being dragged off-screen
 * - Mobile responsive near-fullscreen layout
 * - Active vs Inactive styling and elevation
 * - Seamless minimize / maximize / restore
 */
export function Window({ id }: WindowProps) {
  // Selective Zustand subscriptions
  const windowItem = useWindowStore((state) => state.windows[id]);
  const isActive = useWindowStore((state) => state.activeWindowId === id);

  const focusWindow = useWindowStore((state) => state.focusWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const toggleMaximize = useWindowStore((state) => state.toggleMaximize);
  const moveWindow = useWindowStore((state) => state.moveWindow);
  const resizeWindow = useWindowStore((state) => state.resizeWindow);

  const appDef = useMemo(() => {
    return windowItem ? APP_REGISTRY[windowItem.type] : null;
  }, [windowItem]);

  const minSize = useMemo(() => {
    return appDef?.minSize ?? { width: 320, height: 240 };
  }, [appDef]);

  const { handleTitlePointerDown, handleResizePointerDown } =
    useWindowInteraction({
      id,
      position: windowItem?.position ?? { x: 40, y: 40 },
      size: windowItem?.size ?? { width: 600, height: 440 },
      minSize,
      isMaximized: windowItem?.maximized ?? false,
      onMove: moveWindow,
      onResize: resizeWindow,
      onFocus: focusWindow,
    });

  if (!windowItem) return null;

  const { title, position, size, zIndex, minimized, maximized } = windowItem;

  // Render icon from registry or fallback
  const IconComponent = appDef?.icon;
  const AppComponent = appDef?.component;

  return (
    <article
      role="dialog"
      aria-labelledby={`window-title-${id}`}
      aria-modal="false"
      onPointerDown={() => focusWindow(id)}
      style={{
        zIndex,
        ...(maximized
          ? {}
          : {
              width: `${size.width}px`,
              height: `${size.height}px`,
              transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            }),
      }}
      className={`
        pointer-events-auto flex flex-col rounded-lg overflow-hidden
        bg-surface-window backdrop-blur-md transition-[box-shadow,border-color,opacity] duration-150
        ${minimized ? "hidden" : "flex"}
        ${
          maximized
            ? "fixed inset-2 sm:inset-3 bottom-13 sm:bottom-15"
            : "fixed top-0 left-0 sm:absolute sm:top-0 sm:left-0 max-sm:inset-1.5 max-sm:bottom-12 max-sm:w-auto! max-sm:h-auto! max-sm:transform-none!"
        }
        ${
          isActive
            ? "border border-accent/40 shadow-windowActive"
            : "border border-border-default shadow-window opacity-95"
        }
      `}
    >
      {/* ------------------------------------------------------------------- */}
      {/* Window Title Bar (Drag Handle)                                      */}
      {/* ------------------------------------------------------------------- */}
      <header
        onPointerDown={handleTitlePointerDown}
        className={`
          flex items-center justify-between h-[38px] px-3 select-none
          border-b border-border-subtle transition-colors duration-150
          ${
            isActive
              ? "bg-surface-window-header text-text-primary"
              : "bg-surface text-text-muted hover:text-text-secondary"
          }
          ${maximized ? "cursor-default" : "sm:cursor-grab sm:active:cursor-grabbing"}
        `}
      >
        {/* Title and Icon */}
        <div className="flex items-center gap-2 min-w-0 pointer-events-none">
          {IconComponent && (
            <span
              className={`flex items-center justify-center w-4 h-4 shrink-0 ${
                isActive ? "text-accent" : "text-text-muted"
              }`}
            >
              <IconComponent size={15} />
            </span>
          )}
          <h2
            id={`window-title-${id}`}
            className="font-mono text-xs font-medium tracking-tight truncate select-none"
          >
            {title || appDef?.title}
          </h2>
        </div>

        {/* Window Controls */}
        <WindowControls
          isMaximized={maximized}
          allowMaximize={appDef?.allowMaximize ?? true}
          onMinimize={() => minimizeWindow(id)}
          onToggleMaximize={() => toggleMaximize(id)}
          onClose={() => closeWindow(id)}
        />
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* Content Region                                                      */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-surface/50 text-text-primary">
        {AppComponent ? (
          <AppComponent windowId={id} metadata={windowItem.metadata} />
        ) : (
          <div className="p-4 text-xs text-text-muted">
            Application content unavailable.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 8-Directional Resize Handles (Desktop only, when not maximized)      */}
      {/* ------------------------------------------------------------------- */}
      {!maximized && (appDef?.allowResize ?? true) && (
        <div className="hidden sm:block pointer-events-none">
          {RESIZE_HANDLES.map(({ dir, className }) => (
            <div
              key={dir}
              aria-hidden="true"
              onPointerDown={(e) => handleResizePointerDown(dir, e)}
              className={`absolute pointer-events-auto ${className}`}
            />
          ))}
        </div>
      )}
    </article>
  );
}
