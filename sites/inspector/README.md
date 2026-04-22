# inspector

A rich visual dashboard for inspecting the `@thetabench/core` simulation engine.
Inspector connects to one or more running ThetaBench sites (jira, linear,
shopify-admin, slack, zendesk) over HTTP and lets a developer browse tasks,
launch episodes, step through actions, and diff snapshots — without having to
spelunk through `curl` output.

## Quick start

```bash
pnpm --filter inspector dev
```

The app runs on **http://localhost:3010** by default. Point it at any sites you
want to inspect (the defaults expect them to be running on the ports listed
below).

## Default sites

| Name          | URL                     |
| ------------- | ----------------------- |
| shopify-admin | http://localhost:3000   |
| linear        | http://localhost:3001   |
| jira          | http://localhost:3002   |
| slack         | http://localhost:3003   |

Sites are stored in `localStorage` (`thetabench-inspector:sites`). To add or
remove a site, visit `/sites` and use the inline form. The defaults are seeded
on first visit.

## Pages

| Route                                  | What it does                                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/`                                    | Overview — health card per site, recent episodes from local history.                                                |
| `/sites`                               | Site connection manager. Add/edit/delete sites; live health & task counts.                                          |
| `/tasks`                               | Combined task browser across all configured sites. Filter by site/domain/difficulty/type/stage; full-text search.   |
| `/tasks/[site]/[id]`                   | Pretty-printed `TaskDefinition` with eval checks, retrieval rubric, and reward profile cards.                       |
| `/curriculum`                          | The 10 curriculum stages, each with task counts per site.                                                           |
| `/episodes/new`                        | Form to start a new episode against a chosen site/task.                                                             |
| `/episodes/[site]/[episodeId]`         | Live episode runner — observation panel, action history, JSON action input, finish dialog.                          |
| `/snapshots/[site]/[episodeId]`        | Side-by-side initial vs current state diff (computed locally via `computeDiff` from `@thetabench/core`).            |

## Architecture

- **Stateless server.** All persistence is in browser `localStorage` — sites
  list and recent-episodes history. Refresh-safe across tabs.
- **Proxy.** The catch-all route `app/api/proxy/[site]/[...path]/route.ts`
  forwards `/api/proxy/<siteName>/<path>` to the configured site URL. This
  avoids CORS in dev and lets server components call site APIs identically to
  client components.
- **Data layer.** TanStack Query with auto-refetch on focus. Health is staled
  at 30s, tasks at 5min, episode observations are not cached.
- **Engine import.** Inspector imports `computeDiff` and the `TaskDefinition`
  type from `@thetabench/core` for rendering only. Real episode actions all go
  over HTTP — inspector never holds a `SiteAdapter` itself.

## Keyboard

- `d` — toggle dark mode (anywhere outside an input).
