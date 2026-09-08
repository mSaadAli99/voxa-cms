# VOXA CMS

VOXA CMS is a responsive content operations dashboard for managing the VOXA marketing experience.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/voxa-cms run dev` — run the VOXA CMS web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/voxa-cms/src/App.tsx` — admin routes, dashboard screens, CRUD editors, and shared UI
- `artifacts/voxa-cms/src/index.css` — VOXA theme tokens and dashboard styling
- `artifacts/api-server/src/routes/voxa.ts` — mock auth, content, summary, and media API routes
- `lib/api-spec/openapi.yaml` — source of truth for generated API hooks and schemas

## Architecture decisions

- The first version keeps content in memory so the dashboard can be exercised without provisioning persistence.
- The frontend uses the shared generated API client and the existing Express API artifact rather than introducing a second server.
- Auth intentionally uses a clearly marked mock bearer token until a real auth provider is selected.

## Product

The workspace supports mock admin access, content summaries, hero editing, product/solution/section CRUD, media registration and deletion, responsive navigation, search, loading states, retryable errors, and save feedback.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The mock content resets whenever the API service restarts.
- The generated Zod client currently targets the workspace's Zod 3 runtime, so OpenAPI schemas should avoid standalone Zod 4-only email/int helpers.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
