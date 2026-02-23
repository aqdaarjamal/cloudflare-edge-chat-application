# Velocity Edge Chat

[cloudflarebutton]

A production-ready full-stack chat application deployed on Cloudflare's edge network. This template combines a modern React frontend with a Cloudflare Workers backend, leveraging Durable Objects for real-time state management, Hono for API routing, and shadcn/ui for a polished UI.

## Features

- **Edge-Optimized Full-Stack App**: React SPA served via Cloudflare Pages/Assets with Workers handling API routes.
- **Persistent State**: Cloudflare Durable Objects for counter, demo data, and chat state storage.
- **Modern UI**: shadcn/ui components, TailwindCSS, Lucide icons, dark mode support.
- **Data Fetching**: TanStack Query for optimistic updates and caching.
- **Routing**: React Router for SPA navigation.
- **API Layer**: Hono-based routes with CORS, logging, and error handling.
- **Developer Experience**: Vite for fast HMR, Bun scripts, TypeScript end-to-end.
- **Production-Ready**: Error boundaries, client error reporting, health checks.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, shadcn/ui, TanStack Query, React Router, Zustand, Framer Motion, Lucide React.
- **Backend**: Cloudflare Workers, Hono, Durable Objects.
- **State & Data**: TanStack Query, Immer, Zustand.
- **Build Tools**: Bun, Wrangler, Vite.
- **UI Primitives**: Radix UI, Class Variance Authority (CVA), Tailwind Merge.
- **Other**: Sonner (toasts), Recharts, Date-fns, UUID.

## Quick Start

1. **Prerequisites**:
   - [Bun](https://bun.sh/) installed.
   - [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/) installed (`bunx wrangler` works too).

2. **Clone & Install**:
   ```bash
   git clone <your-repo-url>
   cd velocity-edge-chat--qcz1lndzqviiwkppmigc
   bun install
   ```

3. **Generate Types** (from Workers):
   ```bash
   bun run cf-typegen
   ```

4. **Development**:
   ```bash
   bun run dev
   ```
   Opens at `http://localhost:3000` (or `$PORT`).

## Development

- **Frontend HMR**: Edit `src/` files; Vite handles hot reload.
- **Backend Routes**: Add/edit routes in `worker/userRoutes.ts`. Restart dev server if needed.
- **Durable Objects**: State persists in `worker/durableObject.ts`. Modify methods like `getDemoItems()`.
- **API Testing**: Use `/api/health`, `/api/counter`, `/api/demo` endpoints.
- **Linting**: `bun run lint`.
- **Build**: `bun run build` (generates `dist/` for deployment).

Shared types live in `shared/` for cross-import (frontend/backend).

Example API call from frontend:
```tsx
const { data } = useQuery({
  queryKey: ['demo'],
  queryFn: () => fetch('/api/demo').then(res => res.json()),
});
```

## Deployment

Deploy to Cloudflare Workers with Pages/Assets in one command:

```bash
bun run deploy
```

Or manually:

1. Login: `wrangler login`
2. Deploy: `bun run build && wrangler deploy`
3. Assets auto-serve SPA; API routes proxy to Workers.

[cloudflarebutton]

**Custom Domain**: Update `wrangler.jsonc` with your bindings/migrations, then `wrangler deploy`.

**Environment Variables**: Add via Wrangler dashboard or `wrangler.toml`.

## API Endpoints

Base: `/api/*`

| Method | Endpoint              | Description                  |
|--------|-----------------------|------------------------------|
| GET    | `/api/health`         | Health check                 |
| GET    | `/api/test`           | Test response                |
| GET    | `/api/counter`        | Get counter value            |
| POST   | `/api/counter/increment` | Increment counter         |
| GET    | `/api/demo`           | List demo items              |
| POST   | `/api/demo`           | Add demo item                |
| PUT    | `/api/demo/:id`       | Update demo item             |
| DELETE | `/api/demo/:id`       | Delete demo item             |
| POST   | `/api/client-errors`  | Report client errors         |

All responses: `{ success: boolean, data?: T, error?: string }`.

## Customization

- **UI**: Edit `src/pages/`, use shadcn components (`@/components/ui/*`).
- **Theme**: Toggle via `ThemeToggle`; custom in `tailwind.config.js`.
- **Sidebar**: Customize `src/components/app-sidebar.tsx`, wrap in `AppLayout`.
- **Queries**: Extend TanStack Query in `src/main.tsx`.
- **Routes**: Add React Router paths in `src/main.tsx`.
- **Backend**: Extend `worker/userRoutes.ts`; DO NOT edit `worker/index.ts`.

## Troubleshooting

- **Types Missing**: Run `bun run cf-typegen`.
- **Dev Server Issues**: Clear `node_modules/.vite`, `bun install`.
- **Deploy Fails**: Check `wrangler tail` for logs.
- **CORS**: Pre-configured for `*` on `/api/*`.

## License

MIT. See [LICENSE](LICENSE) for details.