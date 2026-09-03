"use client";

import { useWindowStore } from "@/stores/window-store";
import { Window } from "./window";

/**
 * Window rendering layer.
 * 
 * Mounts in the z-space between desktop icons and the taskbar.
 * Subscribes selectively to the list of open window IDs so it only updates
 * when windows are opened or closed.
 */
export function WindowLayer() {
  const windowOrder = useWindowStore((state) => state.windowOrder);

  return (
    <div
      aria-label="Application Windows Layer"
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {windowOrder.map((id) => (
        <Window key={id} id={id} />
      ))}
    </div>
  );
}
