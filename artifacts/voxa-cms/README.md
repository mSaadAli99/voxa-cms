# VOXA CMS

VOXA CMS is a responsive content operations dashboard for managing the VOXA marketing surface. It includes mock-backed authentication, content CRUD, a media library, loading/error states, and a focused editorial workspace.

## Run locally

This project is part of the Replit pnpm workspace:

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/voxa-cms run dev
```

Open `/admin/login` in the preview. The form is prefilled with demo credentials; any valid email and non-empty password is accepted by the mock login endpoint.

## Included routes

- `/admin/login` — mock admin sign in and registration
- `/admin/dashboard` — content summary and recent activity
- `/admin/dashboard/hero` — homepage hero editor
- `/admin/dashboard/products` — product inventory and editors
- `/admin/dashboard/solutions` — solution inventory and editors
- `/admin/dashboard/sections` — page section inventory and editors
- `/admin/dashboard/media` — media asset library

## API

The shared API service exposes `/api/auth`, `/api/content`, and `/api/upload` endpoints.

Content is stored in MongoDB when `MONGODB_URI` is set. Copy `artifacts/api-server/.env.example` to `artifacts/api-server/.env` and add your connection string:

```bash
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net
MONGODB_DB=voxa-cms
```

On first connect, the API seeds hero, products, solutions, sections, and media. If `MONGODB_URI` is empty, content stays in memory and resets on restart.