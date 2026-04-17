# Theta Observability Dashboard

Next.js 16 dashboard for the Theta Observability SaaS — marketing site,
auth, onboarding, Live Traces list, and per-trace detail view.

## Stack

- Next.js 16.1.7 (App Router, turbopack)
- React 19.2.4
- Tailwind CSS 4.2.1 (`@theme inline` variables, shadcn `base-mira` preset)
- `@base-ui/react`, `@hugeicons/react`, `lucide-react`
- `recharts` 3.8 for charts
- NextAuth v5 (Google + Resend email) with a Postgres adapter
- TypeScript 5.9

## Local development

```bash
# from repo root
npm install
npm run dev --workspace=observability/dashboard
```

The dashboard listens on `http://localhost:3100`.

Set `OBS_MOCK_DATA=true` in `.env.local` (the default in `.env.example`) to
render the UI with bundled fixtures when the Go API is unavailable.

## Environment variables

See `.env.example`. `DATABASE_URL` must point to the same Postgres the Go
ingest API uses for its control plane.

## Scripts

- `npm run dev` — turbopack dev server on port 3100
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint

## Layout

```
src/
  app/                     app router
  actions/                 "use server" server actions
  components/
    trace-list/
    trace-detail/
    settings/
    charts/
    ui/                    shadcn base-mira primitives
  lib/
    api.ts                 server-only fetch wrapper for the Go API
    auth.ts                NextAuth v5 config
    env.ts                 zod-validated env
    mock.ts                fixtures for standalone dev
    types.ts               trace schema types
```
