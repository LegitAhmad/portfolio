# Portfolio — Core

Personal developer portfolio presented as a browser desktop environment (windows/taskbar over wallpaper). Guided by skill at `.agents/skills/portfolio-dev/SKILL.md` — read it before any portfolio work; it is the authoritative product/architecture spec. Next.js version may differ from training data; read `node_modules/next/dist/docs/` before writing next code (see `AGENTS.md` at repo root).

Stack + tooling pins: `mem:tech_stack`
Commands to run: `mem:suggested_commands`
Code/architecture conventions: `mem:conventions`
Task-completion verification: `mem:task_completion`

## Top-level layout (committed app files only)

- `app/` Next.js App Router (pages, layout, globals.css theme tokens)
- `components/desktop/` desktop infrastructure (wallpaper, shell; window manager comes here)
- `components/apps/`, `components/ui/` planned, not yet created
- `lib/` domain/data access (planned `lib/data/` module per domain)
- `hooks/`, `stores/` (Zustand window state — planned)
- `public/`, `docs/` (architecture.md)

## Status

Foundation only: placeholder desktop page, no window manager/applications/Supabase/GitHub yet. zustand + motion installed but unused.

## Key invariants

- Desktop infrastructure must NOT know about GitHub/Supabase/portfolio rules; application layer consumes data (one-directional: Desktop → WindowManager → Window → Application → data layer).
- GitHub = repository facts; Supabase = editorial content; client state = ephemeral window geometry. Never persist window geometry or put it in URLs; project slug is the durable URL identity.
- No backend service; use server components/actions/route handlers. Serverless-friendly (Vercel).
- Never expose service-role keys / GitHub App private keys / webhook secrets to client.
- Never invent owner's employment/education/projects etc.; use clearly-labeled placeholders.