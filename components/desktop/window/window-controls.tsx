"use client";

export interface WindowControlsProps {
  isMaximized: boolean;
  allowMaximize?: boolean;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
}

/**
 * Clean, original developer-style window control buttons.
 * Avoids literal OS clones (no Mac traffic lights or classic Windows glyphs).
 */
export function WindowControls({
  isMaximized,
  allowMaximize = true,
  onMinimize,
  onToggleMaximize,
  onClose,
}: WindowControlsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Window management controls"
      className="flex items-center gap-1 shrink-0 ml-2"
    >
      {/* Minimize */}
      <button
        type="button"
        aria-label="Minimize window"
        title="Minimize"
        onClick={(e) => {
          e.stopPropagation();
          onMinimize();
        }}
        className="flex items-center justify-center w-6 h-6 rounded hover:bg-white/[0.08] active:bg-white/[0.12] text-text-muted hover:text-text-primary transition-colors outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor" aria-hidden="true">
          <rect width="10" height="2" rx="0.5" />
        </svg>
      </button>

      {/* Maximize / Restore (Hidden on small mobile screens where window is full width) */}
      {allowMaximize && (
        <button
          type="button"
          aria-label={isMaximized ? "Restore window size" : "Maximize window"}
          title={isMaximized ? "Restore" : "Maximize"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleMaximize();
          }}
          className="hidden sm:flex items-center justify-center w-6 h-6 rounded hover:bg-white/[0.08] active:bg-white/[0.12] text-text-muted hover:text-text-primary transition-colors outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
              <rect x="2.5" y="0.5" width="7" height="7" rx="0.5" strokeOpacity="0.6" />
              <rect x="0.5" y="2.5" width="7" height="7" rx="0.5" />
            </svg>
          ) : (
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
              <rect x="0.5" y="0.5" width="8" height="8" rx="0.5" />
            </svg>
          )}
        </button>
      )}

      {/* Close */}
      <button
        type="button"
        aria-label="Close window"
        title="Close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="flex items-center justify-center w-6 h-6 rounded hover:bg-red-500/20 active:bg-red-500/30 text-text-muted hover:text-red-400 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
          <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
        </svg>
      </button>
    </div>
  );
}
