# Architecture

A high-level description of the intended architecture for this repository.
This document tracks where the project is heading; the "current status"
section at the end reflects what is actually implemented today.

## Concept

This is a personal developer portfolio presented as a desktop environment
running in the browser. Instead of a scrolling page, content is organized as
applications that open in floating windows:

```
Desktop
→ application/window
→ content
→ detail window
```

Core applications: **Project Explorer**, **About Me**, **Links**,
**Experience**, **Skills**. Individual projects open in dedicated
project-detail windows. A resume is a downloadable document, not a window.

The desktop is a navigation metaphor first. The metaphor must never obscure
content, and must not become a literal clone of any proprietary OS.

## Stack

| Concern              | Choice                                  |
| -------------------- | --------------------------------------- |
| Framework            | Next.js (App Router)                    |
| Language             | TypeScript (strict)                     |
| Styling              | Tailwind CSS                             |
| Client state         | Zustand                                  |
| Animation            | Motion                                   |
| UI primitives        | shadcn/ui + Radix primitives where useful |
| Persistence          | Supabase (Postgres, Storage, Auth)       |
| External data        | GitHub API via a GitHub App             |
| Package manager      | pnpm                                     |
| Deployment           | Vercel (serverless-friendly)            |

There is **no standalone backend service**. Server-side work happens through
Next.js Server Components, Server Actions, and Route Handlers.

## Directory layout

```
app/          Next.js App Router — routes, layouts, page shells
components/   React components, grouped by feature
  desktop/      desktop infrastructure (wallpaper, window manager, taskbar)
  apps/         portfolio applications (project explorer, about, …)
  ui/           generic presentational primitives (shadcn/ui-based)
lib/          domain logic: data access, server helpers, formatting
  data/         one module per content domain (projects, experience, …)
hooks/        shared client-side React hooks
stores/       Zustand stores (desktop/window state)
public/       static assets
docs/         architecture and decision documentation
```

Additional directories should only be introduced when they serve a clear
architectural purpose.

## Desktop infrastructure vs portfolio content

The desktop layer and the content layer are kept separate.

- The **desktop infrastructure** (window manager, window chrome, taskbar,
  wallpaper) is generic. It knows nothing about GitHub, Supabase, or
  portfolio business rules.
- The **application layer** consumes domain data and renders it inside the
  generic desktop shell.

Data flow stays one-directional:

```
Desktop → WindowManager → Window → Application → data layer
```

## Window management

A small **application registry** describes every desktop application
(`projects`, `about`, `links`, `experience`, `skills`). Each entry provides
its type, title, icon, default dimensions, component, and behavior flags.
The window manager consumes the registry instead of duplicating
per-application logic.

Zustand is the single client-side source of truth for open windows.
State is only mutated through a small set of centralized operations:

- `openWindow`, `closeWindow`, `focusWindow`
- `minimizeWindow`, `restoreWindow`, `toggleMaximize`
- `moveWindow`, `resizeWindow`

Window geometry (position, size, z-index, minimized/maximized state) is
ephemeral UI state and is **never persisted** and **never placed in URLs**.
Components subscribe selectively to avoid unnecessary rerenders. A
predictable z-index strategy replaces hardcoded random values.

Windows must: open near center with a sensible offset, stay usable within
the viewport, honor minimum dimensions, preserve geometry when restoring
from maximize, animate subtly, and expose obvious title controls. Dragging
is never required to reach essential information. On mobile, windows become
near-fullscreen and resize/drag interactions are simplified or disabled.

Motion is used deliberately for window open/close/minimize/restore, taskbar
state changes, and subtle hover/press feedback — and always respects
`prefers-reduced-motion`.

## Where data comes from

Three sources of truth with distinct ownership:

| Domain            | Owned by        | Examples                                 |
| ----------------- | --------------- | ---------------------------------------- |
| Repository facts  | GitHub          | name, URL, topics, languages, timestamps |
| Editorial content | Supabase        | title override, description, screenshots, featured, ordering, category, story, demo URL |
| Ephemeral UI      | Client state    | window geometry, focus, selection        |

A GitHub repository does **not** automatically become a visible portfolio
project. The portfolio decides visibility, ordering, and presentation.

GitHub access is planned through a **GitHub App** with minimal permissions.
Public page rendering must never depend on live GitHub requests, and GitHub
webhook payloads are only accepted after signature verification. Never use a
personal access token as the long-term architecture.

Supabase is the portfolio persistence layer. Database access is enforced by
server-side code and Supabase RLS; browser-supplied "is admin" flags are
never trusted. Service-role keys, GitHub App private keys, and webhook
secrets stay server-side only.

## Data access

Raw Supabase queries and GitHub API calls are kept out of React components.
Server code reads through a thin data layer in `lib/data/` (e.g.
`projects.ts`, `experience.ts`, `skills.ts`, `links.ts`) and normalizes
external responses into internal application models. UI components consume
those domain models.

Prefer **Server Components for data retrieval** and **Client Components only
where interactivity requires them** (Zustand, drag/resize, Motion, browser
APIs). Whole pages are not marked `"use client"` because one child needs a
client boundary.

## URLs

Durable content identity may appear in URLs — e.g. `/projects/<slug>` for a
project. Ephemeral desktop state (window position, z-index, size, minimized
state) never appears in URLs.

## Environment variables

See `.env.example`. Public Supabase variables are browser-safe
(`NEXT_PUBLIC_*`); everything else (service-role key, GitHub App credentials,
webhook secret) is server-only and must never reach the client bundle.

## Deployment

The app deploys directly to Vercel. No Docker or long-lived processes are
required. Any scheduled or background synchronization (e.g. importing GitHub
repos into Supabase) must be designed for serverless-friendly execution in
the Vercel / Supabase / GitHub environment.

## Next.js notes

The project targets the Next.js major version installed at the time (currently
the version locked in `pnpm-lock.yaml`). Next.js makes breaking changes across
majors; version-matched reference docs are bundled in
`node_modules/next/dist/docs/` and `AGENTS.md` points agents at them.

## Current implementation status

Initialized foundation only. Implemented:

- Next.js App Router + TypeScript (strict) + Tailwind, wired and building.
- Clean top-level layout: `app/`, `components/`, `lib/`, `hooks/`, `stores/`,
  `public/`, `docs/`.
- Minimal desktop placeholder page proving the toolchain and component
  structure (no window manager yet).
- `zustand` and `motion` installed for the upcoming desktop milestone.
- Environment-variable template and architecture documentation.

Not yet implemented:

- Desktop infrastructure (wallpaper polish, desktop icons, taskbar, window
  manager, application registry).
- Portfolio applications (Project Explorer, About Me, Links, Experience,
  Skills) and project-detail windows.
- Supabase schema, data-access layer, and any live data.
- GitHub App integration and synchronization tooling.
