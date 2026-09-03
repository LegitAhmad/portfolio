const PLANNED_APPLICATIONS = [
  "Project Explorer",
  "About Me",
  "Links",
  "Experience",
  "Skills",
] as const;

export function DesktopPlaceholder() {
  return (
    <section
      aria-label="Desktop status"
      className="relative flex h-full items-center justify-center p-6"
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-surface/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2 rounded-full bg-emerald-400"
          />
          <p className="font-mono text-xs tracking-wider text-muted">
            desktop environment — scaffold
          </p>
        </div>

        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          Portfolio Desktop
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted">
          This shell is the foundation for a portfolio rendered as a desktop
          environment. The window manager, taskbar, and desktop icons are not
          implemented yet.
        </p>

        <p className="mt-5 text-xs font-medium tracking-wide text-foreground/70">
          Planned applications
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {PLANNED_APPLICATIONS.map((application) => (
            <li
              key={application}
              className="rounded border border-border bg-surface-raised px-2 py-1 font-mono text-xs text-foreground/80"
            >
              {application}
            </li>
          ))}
        </ul>

        <p className="mt-6 font-mono text-[11px] leading-relaxed text-muted/80">
          next.js · react · typescript · tailwind
          <br />
          motion · zustand · app router
        </p>
      </div>
    </section>
  );
}
