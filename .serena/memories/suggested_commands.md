# Suggested commands

- Install: `pnpm install`
- Dev server: `pnpm dev` (port 3000)
- Production build: `pnpm build`
- Serve build: `pnpm start`
- Lint: `pnpm lint` (plain `eslint`, flat config — no `next lint`)
- Typecheck: `pnpm typecheck` (`tsc --noEmit`)
- Next 16 codemods if ever upgrading: `pnpm dlx @next/codemod@canary ...` (see bundled upgrade docs)

Notes:
- `next build` is the real gate: it runs its own type-check and fails on type errors even if `pnpm typecheck` passes (generated route types only exist after a dev/build run).
- Avoid `pkill -f "next start"` — the pattern matches the invoking shell's own command line and kills it. Kill by PID from `lsof -ti tcp:<port>`.
- Repo also tracks a `.jj` (Jujutsu) directory alongside git; don't disturb it.