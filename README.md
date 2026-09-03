# Portfolio Desktop

A personal developer portfolio presented as a desktop environment running in
the browser. Content opens in floating application windows on a wallpaper
instead of a conventional scrolling page.

> **Status: foundation only.** The repo currently contains a minimal desktop
> placeholder page that verifies the toolchain and component structure. The
> window manager and applications are not implemented yet. See
> [`docs/architecture.md`](docs/architecture.md).

## Stack

- Next.js (App Router) + React + TypeScript (strict)
- Tailwind CSS
- Zustand (client/window state)
- Motion (animation)
- shadcn/ui + Radix primitives (planned, where useful)
- Supabase (planned persistence)
- GitHub App (planned external data source)
- pnpm + Vercel

## Development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

### Commands

| Command               | Description                  |
| --------------------- | ---------------------------- |
| `pnpm dev`            | Start the dev server         |
| `pnpm build`          | Production build             |
| `pnpm start`          | Serve a production build     |
| `pnpm lint`           | Run ESLint                   |
| `pnpm typecheck`      | Run `tsc --noEmit`           |

## Environment variables

Copy `.env.example` to `.env.local` and fill in values. No real credentials
exist in this repository. Variables are not required yet — nothing reads them
until Supabase / GitHub integration lands.

Public Supabase variables are browser-safe; service-role keys and GitHub App
credentials are server-only and must never reach the client.

## Current implementation status

Implemented:

- Next.js App Router, TypeScript strict, Tailwind — building and linting.
- Clean top-level structure: `app/`, `components/`, `lib/`, `hooks/`,
  `stores/`, `public/`, `docs/`.
- Minimal desktop placeholder page (`app/page.tsx` +
  `components/desktop/`).
- `zustand` + `motion` installed for the desktop milestone.
- `.env.example`, architecture docs.

Planned:

- Desktop: wallpaper, desktop icons, taskbar, window manager, application
  registry.
- Applications: Project Explorer, About Me, Links, Experience, Skills.
- Supabase schema + data layer; GitHub App sync tooling.
