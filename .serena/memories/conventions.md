# Conventions

- Dark-first, developer-oriented, restrained visuals (subtle depth, crisp borders, minimal noise). No fake OS clones, no cyberpunk/neon. Wallpaper is atmospheric, content readable over it. Respect `prefers-reduced-motion`.
- Server Components by default; `"use client"` only for Zustand/drag/resize/Motion/browser APIs. Never mark whole pages client because one child needs it. Data via server, interaction via client.
- Centralized Zustand store for window state; mutations only via store actions (open/close/focus/minimize/restore/toggleMaximize/move/resize). Selective subscriptions to avoid rerenders. Predictable z-index strategy, never random/z-index:9999.
- Small cohesive components; no giant page/window components. Generic Window component never contains app-specific content. Application registry (type/title/icon/dimensions/component) instead of per-app conditional logic.
- Data access in `lib/data/<domain>.ts`; UI consumes domain models, not raw Supabase/GitHub responses. Normalize external API responses into internal models.
- TypeScript strict; type state/edges (loading/empty/error/not-found) explicitly. No `any` smuggling. All components typed.
- Theme tokens: define color/font vars in `:root` + `@theme inline` in `app/globals.css`. Component-level CSS (e.g. `.wallpaper`) also lives there. Use theme utility classes in JSX.
- No code comments unless asked; no invented personal/fake content — placeholders must be labeled.
- Dependency discipline: check built-in platform & existing deps first, prefer small focused libs, no trend-chasing (no Drizzle just because it's popular, etc.).