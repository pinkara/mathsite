# MathUnivers — Agent Guide

## Project overview

React 19 + TypeScript + Vite 7 SPA for a participative math encyclopedia (French).  
Styled with Tailwind CSS 3 + shadcn/ui (New York style). Data in Supabase with localStorage fallback. PWA with service worker. Deployed to GitHub Pages.

## Commands (all from `app/`)

```bash
npm run dev      # dev server on port 5174 (strict port)
npm run build    # tsc -b && vite build (type-check first)
npm run lint     # eslint .
npm run preview  # vite preview
```

There are **no tests** in this repo.

## Architecture

- **`app/src/`** — all source code
- **Hash-based SPA routing** — custom `useRouter()` hook, routes like `'home' | 'courses' | 'problems' | 'formulas' | 'library' | 'ide' | 'admin' | 'article' | 'worlds' | 'profile' | 'collection' | 'timeline' | 'subjects'`
- **Data layer** — `useStorage.ts` (~1900 lines) reads from Supabase first, falls back to `localStorage`. Env vars `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in `app/.env`. Without them, a warning banner appears and data is local-only.
- **Entrypoint** — `app/src/main.tsx` → `App.tsx`
- **Path alias** `@/` maps to `app/src/` (configured in both Vite and tsconfig)
- **`app/src/components/ui/`** — 53 shadcn/ui primitives. Use `cn()` from `@/lib/utils` for class merging.
- **Content rendering** — `ContentRenderer.tsx` handles HTML with LaTeX (via MathJax 3 loaded in App), code blocks, molecule viewers (3Dmol, JSmol), and interactive visualizers.
- **Math** — `MathJax 3` loaded dynamically; inline `$...$`, display `$$...$$`. Also `mathlive` for input and `@cortex-js/compute-engine` for symbolic verification.

## Key directories

| Path | Purpose |
|------|---------|
| `app/src/sections/` | Page-level components (one per route) |
| `app/src/components/` | Shared UI components |
| `app/src/hooks/` | Custom hooks (`useStorage`, `useAuth`, `useRouter`, `useMathJax`) |
| `app/src/lib/` | Utilities (`supabase.ts`, `utils.ts`, `fileStorage.ts`, `worldsConfig.ts`, `xpCalculator.ts`) |
| `app/src/types/` | TypeScript types (`index.ts` has all domain types) |
| `app/public/` | Static assets, PWA manifest, service worker (`sw.js`) |
| `app/scripts/` | Build helpers (`generate-icons.cjs`, `fetch-mathematicians.mjs`) |

## Deployment

- GitHub Actions (`.github/workflows/deploy.yml`) builds `app/` and deploys `app/dist` to GitHub Pages.
- Production base path is `/mathsite/` (set in `vite.config.ts`).
- Secrets needed: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Push to `main`/`master` triggers auto-deploy.

## Domain notes

- **Levels**: `6e | 5e | 4e | 3e | 2nde | 1re | Term | Prépa | Licence | Master | Expert`
- **Subject types**: `academic` (programme scolaire) or `exotic` (olympiades/hors programme)
- **Gamification**: XP, levels, streaks, worlds/arenas (16 worlds, each with multiple arenas), badges, MathCoins, collectible mathematician cards
- **Admin**: password-gated (stored in localStorage, not a real auth system)
- **Auth**: optional Supabase Google OAuth; without it, app works fully in guest mode
- **Content images**: uploaded to Supabase Storage (`images`, `documents`, `covers` buckets) or stored in IndexedDB via `fileStorage.ts`
