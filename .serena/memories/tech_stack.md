# Tech stack

Pin the versions by reading `package.json` / `pnpm-lock.yaml`, not from memory.

- Next.js 16.x (Turbopack default for dev+build; stylized "this is NOT the Next.js you know" — breaking changes each major; docs bundled in `node_modules/next/dist/docs/`)
- React 19.x, TypeScript strict (`"strict": true`)
- Tailwind CSS v4 (PostCSS plugin `@tailwindcss/postcss`, config-less; theme via `@theme inline` in `app/globals.css`)
- ESLint 9 flat config (`eslint.config.mjs`, `eslint-config-next` core-web-vitals + typescript). `next lint` is gone — script is `eslint`
- Zustand 5 (client/window state)
- Motion (v13, `motion/react`; framer-motion successor)
- shadcn/ui + Radix: planned, only where useful, not yet initialized
- Supabase: planned persistence (Postgres/Storage/Auth via supabase-js)
- GitHub App: planned external data source
- pnpm (workspace root = app; `pnpm-workspace.yaml` holds `allowBuilds` block: sharp/unrs-resolver build scripts disabled)
- Node ≥20.9 required (v16); deployed to Vercel, no Docker/long-lived processes

Path alias: `@/*` → repo root (tsconfig `paths`). Fonts: `next/font/google` Geist + Geist Mono via CSS vars `--font-geist-sans`/`--font-geist-mono`.