import { create } from "zustand";

export type WindowType =
  | "projects"
  | "about"
  | "links"
  | "experience"
  | "skills"
  | "project";

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowBounds {
  position: WindowPosition;
  size: WindowSize;
}

export interface WindowItem {
  id: string;
  type: WindowType;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  previousBounds?: WindowBounds;
  metadata?: Record<string, unknown>;
}

export interface OpenWindowOptions {
  id?: string;
  title?: string;
  defaultSize?: WindowSize;
  minSize?: WindowSize;
  metadata?: Record<string, unknown>;
}

export interface WindowStoreState {
  windows: Record<string, WindowItem>;
  windowOrder: string[]; // Order of window IDs
  activeWindowId: string | null;

  // Centralized operations
  openWindow: (type: WindowType, options?: OpenWindowOptions) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  moveWindow: (id: string, position: WindowPosition) => void;
  resizeWindow: (id: string, size: WindowSize, position?: WindowPosition) => void;
}

const BASE_WINDOW_Z = 20;
const TASKBAR_HEIGHT = 48;
const MIN_WINDOW_WIDTH = 320;
const MIN_WINDOW_HEIGHT = 240;

/**
 * Normalizes z-indices across all windows to avoid unbounded number growth.
 * Preserves the relative stacking order while ensuring z-indices stay within [20, 39].
 */
function normalizeZIndices(
  windows: Record<string, WindowItem>,
  windowOrder: string[],
  focusedId?: string
): { updatedWindows: Record<string, WindowItem>; activeId: string | null } {
  // Sort window IDs by their current z-index, prioritizing focusedId at the end
  const sortedIds = [...windowOrder].sort((a, b) => {
    if (a === focusedId) return 1;
    if (b === focusedId) return -1;
    return (windows[a]?.zIndex ?? 0) - (windows[b]?.zIndex ?? 0);
  });

  const nextWindows: Record<string, WindowItem> = { ...windows };
  sortedIds.forEach((id, index) => {
    if (nextWindows[id]) {
      nextWindows[id] = {
        ...nextWindows[id],
        zIndex: BASE_WINDOW_Z + index,
      };
    }
  });

  // Active window is the focusedId or highest non-minimized window
  let activeId: string | null = null;
  for (let i = sortedIds.length - 1; i >= 0; i--) {
    const id = sortedIds[i];
    if (nextWindows[id] && !nextWindows[id].minimized) {
      activeId = id;
      break;
    }
  }

  return { updatedWindows: nextWindows, activeId };
}

/**
 * Calculates a staggered initial position for new windows.
 */
function calculateInitialPosition(
  index: number,
  size: WindowSize
): WindowPosition {
  if (typeof window === "undefined") {
    return { x: 40, y: 40 };
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const isMobile = viewportWidth < 640;
  if (isMobile) {
    return { x: 8, y: 8 };
  }

  // Base centered position
  const centerX = Math.max(20, Math.floor((viewportWidth - size.width) / 2));
  const centerY = Math.max(
    20,
    Math.floor((viewportHeight - TASKBAR_HEIGHT - size.height) / 2)
  );

  // Stagger offset (cycling every 5 windows)
  const staggerOffset = (index % 5) * 28;

  const x = Math.min(
    Math.max(20, centerX + staggerOffset),
    Math.max(20, viewportWidth - size.width - 20)
  );
  const y = Math.min(
    Math.max(20, centerY + staggerOffset),
    Math.max(20, viewportHeight - TASKBAR_HEIGHT - size.height - 20)
  );

  return { x, y };
}

export const useWindowStore = create<WindowStoreState>((set, get) => ({
  windows: {},
  windowOrder: [],
  activeWindowId: null,

  openWindow: (type, options = {}) => {
    const id = options.id ?? type;
    const current = get().windows[id];

    // If window already exists, restore and focus it
    if (current) {
      if (current.minimized) {
        get().restoreWindow(id);
      } else {
        get().focusWindow(id);
      }
      return id;
    }

    const defaultSize: WindowSize = options.defaultSize ?? {
      width: Math.min(680, typeof window !== "undefined" ? window.innerWidth - 32 : 680),
      height: Math.min(480, typeof window !== "undefined" ? window.innerHeight - TASKBAR_HEIGHT - 48 : 480),
    };

    const position = calculateInitialPosition(get().windowOrder.length, defaultSize);

    const newWindow: WindowItem = {
      id,
      type,
      title: options.title ?? type,
      position,
      size: defaultSize,
      zIndex: BASE_WINDOW_Z + get().windowOrder.length,
      minimized: false,
      maximized: false,
      metadata: options.metadata,
    };

    set((state) => {
      const nextWindows = { ...state.windows, [id]: newWindow };
      const nextOrder = [...state.windowOrder, id];
      const { updatedWindows, activeId } = normalizeZIndices(
        nextWindows,
        nextOrder,
        id
      );

      return {
        windows: updatedWindows,
        windowOrder: nextOrder,
        activeWindowId: activeId,
      };
    });

    return id;
  },

  closeWindow: (id) => {
    set((state) => {
      if (!state.windows[id]) return state;

      const nextWindows = { ...state.windows };
      delete nextWindows[id];

      const nextOrder = state.windowOrder.filter((wId) => wId !== id);
      const { updatedWindows, activeId } = normalizeZIndices(
        nextWindows,
        nextOrder
      );

      return {
        windows: updatedWindows,
        windowOrder: nextOrder,
        activeWindowId: activeId,
      };
    });
  },

  focusWindow: (id) => {
    set((state) => {
      const target = state.windows[id];
      if (!target) return state;

      // If minimized, restore it
      const nextWindows = {
        ...state.windows,
        [id]: {
          ...target,
          minimized: false,
        },
      };

      const { updatedWindows, activeId } = normalizeZIndices(
        nextWindows,
        state.windowOrder,
        id
      );

      return {
        windows: updatedWindows,
        activeWindowId: activeId,
      };
    });
  },

  minimizeWindow: (id) => {
    set((state) => {
      const target = state.windows[id];
      if (!target) return state;

      const nextWindows = {
        ...state.windows,
        [id]: {
          ...target,
          minimized: true,
        },
      };

      const { updatedWindows, activeId } = normalizeZIndices(
        nextWindows,
        state.windowOrder
      );

      return {
        windows: updatedWindows,
        activeWindowId: activeId,
      };
    });
  },

  restoreWindow: (id) => {
    set((state) => {
      const target = state.windows[id];
      if (!target) return state;

      const nextWindows = {
        ...state.windows,
        [id]: {
          ...target,
          minimized: false,
        },
      };

      const { updatedWindows, activeId } = normalizeZIndices(
        nextWindows,
        state.windowOrder,
        id
      );

      return {
        windows: updatedWindows,
        activeWindowId: activeId,
      };
    });
  },

  toggleMaximize: (id) => {
    set((state) => {
      const target = state.windows[id];
      if (!target) return state;

      if (target.maximized) {
        // Restore from maximized
        const previousBounds = target.previousBounds;
        const restoredPosition = previousBounds?.position ?? target.position;
        const restoredSize = previousBounds?.size ?? target.size;

        const nextWindows = {
          ...state.windows,
          [id]: {
            ...target,
            maximized: false,
            position: restoredPosition,
            size: restoredSize,
            previousBounds: undefined,
          },
        };

        const { updatedWindows, activeId } = normalizeZIndices(
          nextWindows,
          state.windowOrder,
          id
        );

        return {
          windows: updatedWindows,
          activeWindowId: activeId,
        };
      } else {
        // Maximize window
        const nextWindows = {
          ...state.windows,
          [id]: {
            ...target,
            maximized: true,
            previousBounds: {
              position: target.position,
              size: target.size,
            },
          },
        };

        const { updatedWindows, activeId } = normalizeZIndices(
          nextWindows,
          state.windowOrder,
          id
        );

        return {
          windows: updatedWindows,
          activeWindowId: activeId,
        };
      }
    });
  },

  moveWindow: (id, position) => {
    set((state) => {
      const target = state.windows[id];
      if (!target || target.maximized) return state;

      // Viewport bounds clamping
      const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
      const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

      // Ensure title bar remains accessible (top >= 0, titlebar height ~38px visible, bottom above taskbar)
      const clampedX = Math.min(
        Math.max(-target.size.width + 60, position.x),
        viewportWidth - 60
      );
      const clampedY = Math.min(
        Math.max(0, position.y),
        viewportHeight - TASKBAR_HEIGHT - 38
      );

      return {
        windows: {
          ...state.windows,
          [id]: {
            ...target,
            position: { x: clampedX, y: clampedY },
          },
        },
      };
    });
  },

  resizeWindow: (id, size, position) => {
    set((state) => {
      const target = state.windows[id];
      if (!target || target.maximized) return state;

      const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
      const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

      const clampedWidth = Math.min(
        Math.max(MIN_WINDOW_WIDTH, size.width),
        viewportWidth
      );
      const clampedHeight = Math.min(
        Math.max(MIN_WINDOW_HEIGHT, size.height),
        viewportHeight - TASKBAR_HEIGHT
      );

      const nextPosition = position ? { ...position } : target.position;

      return {
        windows: {
          ...state.windows,
          [id]: {
            ...target,
            size: { width: clampedWidth, height: clampedHeight },
            position: nextPosition,
          },
        },
      };
    });
  },
}));
