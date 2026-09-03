# Task completion

Run all of these for any meaningful change unless the task says otherwise:

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm build` (also runs its own type-check over generated route types — the strictest gate)

For UI-visible interaction changes, additionally verify in a browser (agent-browser skill / manual) — the project is interaction-heavy by design. Sanity smoke test without a browser: `pnpm start` + `curl` the HTML and CSS links.

There is no test framework configured yet (none of typecheck/lint/build requires one).