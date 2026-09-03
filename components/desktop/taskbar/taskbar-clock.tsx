"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const timer = setInterval(callback, 1000);
  return () => clearInterval(timer);
}

function getClientSnapshot(): string {
  const now = new Date();
  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const date = now.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${time}|${date}`;
}

function getServerSnapshot(): string {
  return "--:--|";
}

/**
 * Hydration-safe taskbar clock using useSyncExternalStore.
 * Avoids cascading effect renders and hydration mismatches in React 19.
 */
export function TaskbarClock() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const [timeStr, dateStr] = snapshot.split("|");
  const isMounted = timeStr !== "--:--";

  return (
    <div
      title={dateStr || undefined}
      aria-label={isMounted ? `Current time: ${timeStr}, ${dateStr}` : "Clock"}
      className="flex flex-col items-end justify-center px-2 py-1 select-none rounded hover:bg-white/[0.05] transition-colors"
    >
      <span className="font-mono text-xs font-medium text-text-primary tracking-tight">
        {timeStr}
      </span>
      {dateStr ? (
        <span className="hidden sm:inline-block font-mono text-[10px] text-text-muted -mt-0.5">
          {dateStr}
        </span>
      ) : null}
    </div>
  );
}
