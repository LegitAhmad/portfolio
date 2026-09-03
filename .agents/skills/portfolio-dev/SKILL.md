---
name: portfolio-development
description: Engineering and UX rules for building and maintaining a personal developer portfolio implemented as a desktop-like browser environment. Use this skill whenever modifying the portfolio application, its desktop/window system, portfolio content architecture, GitHub integration, Supabase integration, or deployment configuration.
---

---

# Portfolio Development Skill

## 1. Product definition

This repository contains a personal developer portfolio presented as a fictional desktop environment inside the browser.

The portfolio is intentionally NOT a conventional scrolling portfolio.

The primary interaction model is:

Desktop
→ application/window
→ content
→ detail window

The desktop contains a clean wallpaper/background, desktop icons, a taskbar, and floating application windows.

Core applications:

- Project Explorer
- About Me
- Links
- Experience
- Skills

Resume is a downloadable document, not an application window.

Individual projects can open in their own project-detail windows.

The visual style should feel like a polished modern desktop environment while remaining an original design. Never directly recreate Windows, macOS, Linux desktop environments, or any proprietary UI.

The desktop metaphor must improve navigation rather than obscure content.

---

# 2. Technology decisions

The core stack is fixed unless a concrete technical problem requires changing it.

## Frontend / application

- Next.js
- React
- TypeScript
- App Router
- Tailwind CSS

## Client-side interaction

- Zustand for desktop/window state
- Motion for animation

## UI primitives

- shadcn/ui
- Radix primitives where useful

Use these as implementation primitives, not as the visual identity of the website.

## Persistence/backend services

- Supabase
  - PostgreSQL
  - Storage
  - Authentication where required

There is NO standalone backend service.

Use Next.js Server Components, Server Actions, and Route Handlers for server-side functionality.

## GitHub integration

- GitHub App
- GitHub API
- GitHub App webhooks

GitHub credentials and private keys must remain server-side.

## Deployment

- Vercel

The application must remain compatible with a serverless/edge-oriented Vercel deployment model where practical.

## Package management

- pnpm

---

# 3. Strict architectural rules

## Rule 1: Separate desktop infrastructure from portfolio content

The window manager must not know about:

- GitHub
- Supabase
- database queries
- portfolio business rules

The desktop infrastructure is generic.

The application layer consumes data.

Preferred architecture:

Desktop
→ WindowManager
→ Window
→ Application
→ Data layer

Not:

Application
→ arbitrary Zustand manipulation
→ direct Supabase query
→ direct GitHub request

---

## Rule 2: GitHub is an external data source

GitHub provides repository information such as:

- repository name
- owner
- description
- URL
- homepage
- topics
- languages
- repository timestamps
- other permitted metadata

The portfolio controls:

- visibility
- featured status
- ordering
- custom title
- custom description
- category
- screenshots
- portfolio-specific narrative
- live demo URL
- other presentation metadata

Never assume a GitHub repository should automatically become a visible portfolio project.

---

## Rule 3: Supabase is the portfolio persistence layer

Persistent portfolio content belongs in Supabase.

Do not add:

- MongoDB
- Redis
- SQLite as a production database
- a custom JSON CMS
- another ORM solely for abstraction

Use the Supabase client directly unless a specific requirement demonstrates that an ORM provides substantial value.

Do not introduce Drizzle merely because it is popular.

---

# 4. Source-of-truth hierarchy

When deciding where information belongs:

### GitHub owns repository facts

Examples:

- repo name
- repo URL
- topics
- languages
- repository timestamps

### Portfolio database owns editorial information

Examples:

- project title override
- portfolio description
- screenshots
- featured state
- ordering
- category
- project story
- custom demo URL

### Client state owns ephemeral UI state

Examples:

- window position
- window size
- z-index
- minimized/maximized state
- currently selected item
- open windows

Do not persist ephemeral window geometry unless there is a strong user-experience reason.

---

# 5. Desktop/window system

The window system is one of the most important engineering components of the project.

It must support:

- opening
- closing
- focusing
- minimizing
- restoring
- maximizing
- restoring from maximize
- dragging
- resizing
- z-index ordering
- sensible bounds
- taskbar integration

The window manager must be generic enough to support future applications without rewriting its core.

Prefer an application registry over duplicated conditional logic.

Conceptually:

apps:
projects
about
links
experience
skills

Each definition may provide:

- type
- title
- icon
- default dimensions
- component
- behavior flags

---

# 6. Window state

Use Zustand as the single client-side source of truth for open windows.

Centralize mutations.

Preferred operations:

- openWindow
- closeWindow
- focusWindow
- minimizeWindow
- restoreWindow
- toggleMaximize
- moveWindow
- resizeWindow

Do not mutate window state directly from arbitrary UI components.

Use selective Zustand subscriptions to prevent unnecessary rerenders.

Do not use random hardcoded z-index values.

Maintain a predictable z-index strategy.

---

# 7. Window UX rules

Windows should:

- open near the center or in a sensible offset location
- avoid completely covering previously opened windows
- remain usable inside the viewport
- have minimum dimensions
- preserve previous geometry when restored from maximized
- animate subtly
- have obvious title bars and controls

Dragging must never be required for essential information access.

Mobile layouts should simplify the desktop metaphor rather than attempting to reproduce every desktop interaction.

On mobile:

- windows become near-fullscreen
- arbitrary resize can be disabled
- dragging can be disabled
- title controls remain accessible

---

# 8. Motion rules

Use Motion deliberately.

Good uses:

- window opening
- window closing
- minimize/restore
- taskbar state changes
- subtle hover/press states
- notifications

Bad uses:

- continuous background animation
- excessive page transitions
- animation on every element
- animation that delays interaction
- distracting decorative effects

Always respect:

`prefers-reduced-motion`

---

# 9. Visual design rules

Design direction:

- dark-first
- refined
- clean
- developer-oriented
- subtle depth
- restrained transparency
- restrained blur
- crisp borders
- strong typography
- minimal visual noise

Avoid:

- cyberpunk
- excessive neon
- excessive glassmorphism
- giant gradients
- excessive rounded cards
- visual clutter
- literal Windows recreation
- fake technical aesthetics

The wallpaper is atmospheric, not the primary content.

Windows must remain readable against it.

---

# 10. Content rules

Never invent the portfolio owner's:

- employment
- education
- projects
- achievements
- skills
- social accounts
- URLs
- statistics
- biography

When actual information is unavailable:

- create a typed placeholder
- clearly identify it as placeholder content
- keep it separate from the final UI architecture

Never use fake personal information as filler.

---

# 11. Project Explorer rules

Project Explorer is the central portfolio application.

It should behave more like a project/file browser than a standard project grid.

Possible concepts:

- Featured
- All Projects
- Categories
- Search

Do not overcomplicate filtering.

Project data should support:

- title
- description
- technologies
- category
- featured
- thumbnail
- GitHub URL
- live demo URL

Individual projects should open in dedicated project-detail windows.

Project detail pages should also have stable URLs.

---

# 12. URL rules

Durable content identity may appear in URLs.

Example:

`/projects/lmsv2`

Ephemeral desktop state should NOT appear in URLs.

Never put these in the URL:

- x/y position
- z-index
- window size
- minimized state

Project slug = durable identity.

Window state = temporary UI state.

---

# 13. Next.js rules

Prefer Server Components by default.

Use Client Components when required for:

- Zustand
- drag/resize interaction
- Motion interactions
- browser APIs
- interactive controls

Do not mark entire pages `"use client"` just because one child component requires client-side behavior.

Keep server/client boundaries deliberate.

Prefer:

- Server Components for data retrieval
- Client Components for interactive desktop behavior

Use Route Handlers or Server Actions for server-side mutations.

---

# 14. Supabase rules

Never expose:

- service-role keys
- GitHub private keys
- webhook secrets
- other privileged credentials

to the browser.

Use environment variables appropriately.

Database authorization must be enforced server-side and/or through appropriate Supabase RLS policies.

Never trust a browser-supplied "is admin" flag.

The public site should remain functional even if GitHub temporarily becomes unavailable.

---

# 15. GitHub rules

Use a GitHub App.

Request the minimum permissions needed.

Do not use a personal access token as the long-term architecture.

Never expose GitHub App private keys to client code.

Do not make public page rendering dependent on live GitHub API calls.

Normalize GitHub API responses into internal application models.

Do not let raw GitHub response objects spread throughout the application.

GitHub webhook signatures must be verified.

Webhook handling must fail safely.

---

# 16. Data access rules

Do not scatter raw Supabase queries through React components.

Prefer a data-access structure such as:

lib/
data/
projects.ts
experience.ts
skills.ts
links.ts

UI components should consume application/domain data.

Keep database-specific details close to the data layer.

---

# 17. Component rules

Prefer small cohesive components.

Avoid:

- giant page components
- giant window components
- components containing unrelated data-fetching and presentation logic
- duplicated window logic
- duplicated project rendering logic

The generic Window component should not contain application-specific content.

The Project Explorer should not implement drag/resize behavior itself.

---

# 18. Dependency rules

Before adding a dependency:

1. Confirm the built-in platform cannot reasonably solve the problem.
2. Check whether an existing dependency already solves it.
3. Determine whether the dependency is actively maintained.
4. Consider bundle size.
5. Consider whether the dependency conflicts with the architecture.
6. Prefer a small focused library over a large framework.

Do not add packages just to follow trends.

---

# 19. Accessibility

The desktop metaphor must not compromise accessibility.

Ensure:

- keyboard navigation
- visible focus
- accessible labels
- semantic controls
- sensible tab ordering
- sufficient contrast
- reduced motion support
- non-drag alternatives for essential actions

Do not rely on hover-only behavior.

---

# 20. Responsive rules

Desktop:

- floating windows
- desktop icons
- taskbar

Tablet:

- constrained windows
- controlled window positioning
- careful overflow handling

Mobile:

- near-fullscreen application windows
- compact launcher/taskbar
- simplified window controls
- no essential interaction requiring drag/resize

Do not build a completely separate mobile application.

---

# 21. Development workflow

For every meaningful change:

1. Inspect existing architecture.
2. Identify the smallest appropriate scope.
3. Plan the change.
4. Implement incrementally.
5. Run typechecking.
6. Run linting.
7. Run relevant tests.
8. Inspect affected files.
9. Verify the behavior in the browser when visual interaction is involved.
10. Report what changed and any remaining limitations.

Do not rewrite unrelated code.

Do not "clean up" unrelated files during feature work.

---

# 22. Browser verification

Because this is an interaction-heavy visual application, source-code reasoning alone is insufficient.

When browser automation is available, verify:

- window opening
- window stacking
- dragging
- resizing
- maximize/minimize
- taskbar interactions
- project opening
- responsive behavior
- keyboard interactions

After significant UI changes, inspect the rendered result.

---

# 23. Error handling

Errors must be understandable to the user.

Do not expose:

- stack traces
- internal database errors
- secret values
- raw webhook payloads
- GitHub credentials

Create appropriate:

- loading states
- empty states
- error states
- not-found states

Do not allow a failed GitHub request to take down unrelated portfolio content.

---

# 24. Testing priorities

Test behavior that can break the architecture:

- window state transitions
- opening multiple windows
- z-index/focus behavior
- project filtering/search
- project data normalization
- project URL behavior
- admin authorization
- important data transformations
- GitHub webhook verification

Do not pursue arbitrary test-coverage percentages.

Prioritize meaningful behavior.

---

# 25. Deployment target

The application is designed to deploy directly to Vercel.

Do not make Docker mandatory.

Do not require:

- persistent Node processes
- cron workers running continuously
- long-lived backend processes

Any scheduled/background synchronization must be designed for the Vercel/Supabase/GitHub environment.

---

# 26. Engineering philosophy

Prefer:

simple > clever

explicit > magical

typed > implicit

modular > monolithic

server data > unnecessary client fetching

small abstractions > framework-building

real content > invented filler

usable gimmick > gimmick for its own sake

Do not over-engineer a personal portfolio.

The project should remain easy for its owner to understand and modify months later.

---

# 27. Final quality bar

The finished product should feel like:

"A polished personal desktop environment that happens to be a portfolio."

It should NOT feel like:

"A normal portfolio with Windows-themed components."

The desktop metaphor should provide:

- memorable navigation
- useful organization
- personality
- enjoyable interaction

while keeping:

- projects
- experience
- skills
- contact information
- resume

easy to discover.
