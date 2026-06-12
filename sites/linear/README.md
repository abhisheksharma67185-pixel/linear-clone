# Linear Clone

This is the Linear simulation site inside the `theta-rl-labs` monorepo. It contains only the essential Linear app files and is intended to run as a standalone Next.js project.

## What is included

- `app/` — Next.js app routes, pages, and API endpoints
- `components/` — reusable UI components
- `hooks/` — custom React hooks
- `lib/` — application logic, state, and utilities
- `public/` — static assets
- `package.json` — project dependencies and scripts
- `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `next-env.d.ts`
- `components.json` — project metadata

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run format:check
npm run typecheck
```

## Run locally

```bash
cd sites/linear
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Notes

- This project is a trimmed Linear clone with only the `sites/linear` content preserved.
- The repo is configured for Next.js 16 and uses TypeScript.
- Remove or update any additional settings if you convert this into a pure standalone app.
