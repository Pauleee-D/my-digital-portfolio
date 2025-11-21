## Quick Orientation

- **Purpose**: Help AI coding agents be productive in this Next.js + TypeScript portfolio app (CyberShield). Use this file as the single-source guidance for coding style, conventions, and repo-specific workflows.
- **Key areas**: `app/` (Next App Router pages/layouts), `components/` (shadcn and custom UI), `lib/` (db, utils, types), `actions/` (server actions), `middleware.ts`, and `drizzle.config.ts`.

## Architecture & Big Picture

- App uses Next.js App Router with Server Components by default — prefer server components unless browser APIs or hooks are required. Place interactive code in client components (`"use client"`).
- UI is built with shadcn/ui patterns; custom UI wraps or composes shadcn components under `components/ui/`.
- Database: Neon PostgreSQL accessed via Drizzle (schema in `lib/db.ts`, config in `drizzle.config.ts`). Server actions and route handlers perform mutations.
- Auth: Clerk is used for authentication and role-based access; middleware (`middleware.ts`) enforces route protection and roles.

## Repo-specific Conventions (apply everywhere)

- TypeScript strict mode: prefer explicit types and return types for components and functions.
- Files: use kebab-case for filenames; components in PascalCase. Prefer named exports over default exports.
- Components: keep single responsibility; prefer function declarations for components.
- Styling: Tailwind CSS only. Use project's `cn()` utility for conditional class names and follow theme in `components/theme-provider.tsx`.
- Shadcn pattern: import UI primitives from `@/components/ui/[component-name]` and extend by composition rather than editing core shadcn files.
- Icons: use Lucide icons consistently.

## Patterns & Examples (search these paths in the repo)

- Server component example: `app/page.tsx`, `app/about/page.tsx` — fetch data server-side and return JSX.
- Client component example: `components/client-project-admin.tsx`, `components/theme-toggle.tsx` — include `"use client"` and React hooks.
- DB & actions: `lib/db.ts`, `actions/admin.ts`, `actions/newsletter.ts`, `actions/projects.ts` — use typed Drizzle queries and server actions for mutations.

## Developer Workflows & Commands (Windows PowerShell)

- Install: `pnpm install`
- Dev server: `pnpm run dev`
- DB generate/migrate/push (drizzle):
  - `pnpm run db:generate`
  - `pnpm run db:migrate`
  - `pnpm run db:push`
- Linting: follow project's ESLint config; run `pnpm run lint` if available.

## Environment & Secrets

- Use a `.env` at repo root with `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, and optional `VERCEL_URL`. Drizzle uses `DATABASE_URL` in `drizzle.config.ts`.

## Things to watch for (handy gotchas)

- Next 15.x routing: many dynamic route params are async; guard by awaiting `params` (see root `copilot-instructions.md` note). Example pattern in `app/[slug]/page.tsx`.
- Prefer server-side fetching in server components — minimize client JS and avoid unnecessary hydration.
- Keep forms validated (project follows zod/validation patterns in routes/actions). Use server actions when performing mutations.

## When changing code

- Avoid changing core shadcn files; extend them via composition and `className` merging.
- Update `lib/db.ts` and `drizzle.config.ts` together when altering schema; then run the drizzle commands above.

## Where to look for inspiration

- `components/ui/` — component patterns and variant usage
- `lib/` — db connection, types, and utilities
- `app/` — route grouping, metadata, and server/client component usage

## If you need more context

- Read `README.md` for product vision, architecture, and setup steps.
- Merge or consult `copilot-instructions.md` at repository root for detailed coding rules if deeper guidance is needed.

---
If anything seems missing or you want me to surface concrete examples from specific files, tell me which area to expand (UI, DB, auth, or build/deploy) and I will iterate.
