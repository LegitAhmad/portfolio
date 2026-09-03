"use client";

import { useCallback, useRef } from "react";
import type { WindowPosition, WindowSize } from "@/stores/window-store";

export type ResizeDirection =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

export interface UseWindowInteractionProps {
  id: string;
  position: WindowPosition;
  size: WindowSize;
  minSize: WindowSize;
  isMaximized: boolean;
  isDisabled?: boolean;
  onMove: (id: string, position: WindowPosition) => void;
  onResize: (id: string, size: WindowSize, position?: WindowPosition) => void;
  onFocus: (id: string) => void;
}

const TASKBAR_HEIGHT = 48;
const TITLEBAR_HEIGHT = 38;

export function useWindowInteraction({
  id,
  position,
  size,
  minSize,
  isMaximized,
  isDisabled = false,
  onMove,
  onResize,
  onFocus,
}: UseWindowInteractionProps) {
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);

  // -------------------------------------------------------------------------
  // Dragging logic
  // -------------------------------------------------------------------------
  const handleTitlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      onFocus(id);

      // Only left click initiates dragging
      if (e.button !== 0 || isMaximized || isDisabled) return;

      // Ignore clicks on buttons/controls inside the titlebar
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a")) return;

      e.preventDefault();
      const targetElement = e.currentTarget;
      targetElement.setPointerCapture(e.pointerId);

      isDraggingRef.current = true;
      const startClientX = e.clientX;
      const startClientY = e.clientY;
      const initialX = position.x;
      const initialY = position.y;

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (!isDraggingRef.current) return;

        const deltaX = moveEvent.clientX - startClientX;
        const deltaY = moveEvent.clientY - startClientY;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Viewport bounds: titlebar must remain visible and above taskbar
        const minX = -size.width + 60;
        const maxX = viewportWidth - 60;
        const minY = 0;
        const maxY = viewportHeight - TASKBAR_HEIGHT - TITLEBAR_HEIGHT;

        const nextX = Math.min(Math.max(minX, initialX + deltaX), maxX);
        const nextY = Math.min(Math.max(minY, initialY + deltaY), maxY);

        onMove(id, { x: nextX, y: nextY });
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        isDraggingRef.current = false;
        try {
          targetElement.releasePointerCapture(upEvent.pointerId);
        } catch {
          // ignore if already released
        }
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    },
    [id, position, size, isMaximized, isDisabled, onFocus, onMove]
  );

  // -------------------------------------------------------------------------
  // Resizing logic
  // -------------------------------------------------------------------------
  const handleResizePointerDown = useCallback(
    (direction: ResizeDirection, e: React.PointerEvent<HTMLElement>) => {
      onFocus(id);

      if (e.button !== 0 || isMaximized || isDisabled) return;

      e.preventDefault();
      e.stopPropagation();

      const targetElement = e.currentTarget;
      targetElement.setPointerCapture(e.pointerId);

      isResizingRef.current = true;
      const startClientX = e.clientX;
      const startClientY = e.clientY;
      const initialWidth = size.width;
      const initialHeight = size.height;
      const initialX = position.x;
      const initialY = position.y;

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (!isResizingRef.current) return;

        const deltaX = moveEvent.clientX - startClientX;
        const deltaY = moveEvent.clientY - startClientY;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const maxAvailableHeight = viewportHeight - TASKBAR_HEIGHT;

        let nextWidth = initialWidth;
        let nextHeight = initialHeight;
        let nextX = initialX;
        let nextY = initialY;

        // Horizontal resize
        if (direction.includes("e")) {
          nextWidth = Math.min(
            Math.max(minSize.width, initialWidth + deltaX),
            viewportWidth - initialX
          );
        } else if (direction.includes("w")) {
          const desiredWidth = initialWidth - deltaX;
          if (desiredWidth >= minSize.width) {
            nextWidth = desiredWidth;
            nextX = initialX + deltaX;
          } else {
            nextWidth = minSize.width;
            nextX = initialX + (initialWidth - minSize.width);
          }
        }

        // Vertical resize
        if (direction.includes("s")) {
          nextHeight = Math.min(
            Math.max(minSize.height, initialHeight + deltaY),
            maxAvailableHeight - initialY
          );
        } else if (direction.includes("n")) {
          const desiredHeight = initialHeight - deltaY;
          if (desiredHeight >= minSize.height && initialY + deltaY >= 0) {
            nextHeight = desiredHeight;
            nextY = initialY + deltaY;
          } else if (desiredHeight < minSize.height) {
            nextHeight = minSize.height;
            nextY = initialY + (initialHeight - minSize.height);
          }
        }

        onResize(
          id,
          { width: Math.round(nextWidth), height: Math.round(nextHeight) },
          { x: Math.round(nextX), y: Math.round(nextY) }
        );
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        isResizingRef.current = false;
        try {
          targetElement.releasePointerCapture(upEvent.pointerId);
        } catch {
          // ignore
        }
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    },
    [id, position, size, minSize, isMaximized, isDisabled, onFocus, onResize]
  );

  return {
    handleTitlePointerDown,
    handleResizePointerDown,
  };
}
