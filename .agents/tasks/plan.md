# Implementation Plan — Wire Neon Lakebase Postgres into the Next.js 16 portfolio app

Goal: make the app genuinely read from a Neon Postgres database at runtime, via a Node-runtime
route handler, and prove it end-to-end. Scope is intentionally minimal and non-destructive to the
existing portfolio UI.

---

## Decisions (grounded in the codebase + Next.js 16 docs)

### A. Schema shape (from `src/types/portfolio.ts` + `src/data/portfolioData.ts`)
Mirror the `Project` interface into a single `projects` table. One table is enough (instructed).
The `Project` type has nested/structured fields — store those as `JSONB`:

| TS field (camelCase) | Column (snake_case) | SQL type | Notes |
|---|---|---|---|
| `id` | `id` | `TEXT PRIMARY KEY` | string ids like `finflow-mobile-banking` |
| `title` | `title` | `TEXT NOT NULL` | |
| `tagline` | `tagline` | `TEXT NOT NULL` | |
| `category` | `category` | `TEXT NOT NULL` | union of 5 string literals; stored as TEXT |
| `year` | `year` | `TEXT NOT NULL` | kept as TEXT (values like `"2026"`) |
| `client` | `client` | `TEXT NOT NULL` | |
| `role` | `role` | `TEXT NOT NULL` | |
| `duration` | `duration` | `TEXT NOT NULL` | |
| `thumbnailGradient` | `thumbnail_gradient` | `TEXT NOT NULL` | full CSS gradient string |
| `thumbnailIcon` | `thumbnail_icon` | `TEXT NOT NULL` | bootstrap-icon class |
| `description` | `description` | `TEXT NOT NULL` | |
| `tools` | `tools` | `JSONB NOT NULL DEFAULT '[]'` | `string[]` |
| `metrics` | `metrics` | `JSONB NOT NULL DEFAULT '[]'` | `{label,value}[]` |
| `caseStudy` | `case_study` | `JSONB NOT NULL DEFAULT '{}'` | nested object with `deliverables[]` |
| `featured` | `featured` | `BOOLEAN NOT NULL DEFAULT FALSE` | |
| — | `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | audit only |

Why JSONB for `tools`/`metrics`/`case_study`: they are structured nested values with no need to
query into them; JSONB round-trips cleanly (pg parses JSONB → JS objects on read; we
`JSON.stringify` on write). This preserves the exact `Project` shape so the route's JSON matches
the TypeScript type.

### B. Page-wiring decision: KEEP the existing home page static (do NOT wire the DB into the UI)
**Decision: do NOT modify `src/app/page.tsx` or any component.** Add only the route handler +
data-access module + migration. Rationale:
1. `src/components/PortfolioSection.tsx` is a `'use client'` component that imports `PROJECTS`
   directly from `@/data/portfolioData` and filters client-side; `src/components/ProjectCard.tsx`
   renders bespoke UI via a `switch (project.id)` on the known ids. Rewiring it to DB-sourced async
   props would convert the home page from a static prerendered shell into a dynamic route under
   `cacheComponents` and risks regressions in the category filter / modal / id-keyed mockups — for
   no functional gain.
2. `GET /api/projects` is the genuine, required, **testable** runtime DB integration: it queries
   Postgres live on every request (it never imports the static `portfolioData.ts`), so rows it
   returns prove the DB is wired. This satisfies "wire each service into the app's code" and
   "test it works end to end."
3. The task explicitly endorses this fallback ("the route handler is the required, testable
   integration").

### C. Runtime & caching (Next.js 16 `cacheComponents: true`)
This app has `cacheComponents: true` + `partialPrefetching: true` in `next.config.ts`. Read
`node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md`
and `.../04-functions/connection.md`. Key consequences for the route handler:
- It runs on the **Node.js runtime by default**. Do **NOT** add `export const runtime = 'nodejs'`
  (cacheComponents disallows the `runtime` segment config; Node is the default and required).
- Do **NOT** add `export const dynamic` / `revalidate` / `fetchCache` — these were **removed** in
  v16 and will **error** if exported under cacheComponents.
- A GET handler that reads the DB is "uncached data" and is dynamic. To guarantee the query runs
  per request and is **never executed at build time** (so `npm run build` passes without touching
  the DB even in a CI without DB access), call `await connection()` from `next/server` at the top
  of the handler. `connection()` is the documented, stable (v15+) replacement for
  `force-dynamic`/`noStore()` — "prerendering stops here; the following code only runs at request
  time." Route handlers do not need a `<Suspense>` boundary (that requirement is for page
  navigations, not JSON route handlers — confirmed by the route-handlers doc examples).

### D. Connections (Neon best practices, per neon-postgres skill)
- App query traffic (route handler) → **`DATABASE_URL`** (pooled, `-pooler` host, PgBouncer
  transaction mode). Driver: `node-postgres` (`pg`) `Pool`.
- Schema migration → **`DATABASE_URL_UNPOOLED`** (direct, no `-pooler`). Never run migrations over
  the pooled URL (causes `prepared statement s0 already exists` / `SQLSTATE 25006`).
- Both URLs already contain `sslmode=...`, so `pg` uses SSL automatically — no extra SSL config.
- `.env.local` is gitignored (`.env*` + `.neon` in `.gitignore`); secrets stay out of source.
- This is **not** a git repo, so verification does not involve git.

### E. Migration approach
One-off Node script `scripts/migrate.cjs` (`.cjs` = unambiguous CommonJS; excluded from
tsconfig's `**/*.ts` so `next build` type-checking ignores it, and `next build` does not run
ESLint in v16 so it is not linted during build). It connects via `pg` `Client` to
`DATABASE_URL_UNPOOLED`, runs `CREATE TABLE IF NOT EXISTS`, then seeds the 6 projects with
`INSERT ... ON CONFLICT (id) DO NOTHING` (idempotent). The seed data is embedded by copying the
`PROJECTS` array literal verbatim from `src/data/portfolioData.ts` (it is valid plain JS object
syntax — the TS types are annotations only). Run with `node --env-file=.env.local` (Node 24.16 is
installed, so `--env-file` is supported) which loads the env file into `process.env`.
Tradeoff noted: the seed is a static snapshot; `src/data/portfolioData.ts` stays the source of
truth for the UI — re-seeding won't pick up future UI-data changes unless the seed array is
updated too. Acceptable for proving the integration.

---

## Environment facts (verified)
- Node v24.16.0 / npm 11.13.0 → `node --env-file=.env.local ...` works.
- `package.json` scripts: `dev`, `build` (`next build`), `start` (`next start`), `lint` (`eslint`).
  No test runner. No `"type": "module"` (so `.js`/`.cjs` is CommonJS).
- `tsconfig.json`: `paths: { "@/*": ["./src/*"] }`, `strict: true`, `include` matches `**/*.ts`
  (so `.cjs` is excluded from type-check).
- Existing dirs: `src/app/page.tsx`, `src/app/layout.tsx`, `src/components/*.tsx`, `src/data/`,
  `src/types/`. No `src/app/api/`, no `src/lib/`, no `scripts/` — all created new.
- `.env.local` keys present: `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (direct),
  `NEON_BRANCH`, `NEON_BRANCH_ID`, `NEON_FUNCTION_HOST_SUFFIX`.

---

## Implementation steps

- [ ] 1. Install runtime + type packages, and add a `migrate` script.
      Add `pg` as a runtime dependency and `@types/pg` as a dev dependency, then add a convenience
      script. (`pg` does not bundle TypeScript types, so `@types/pg` is required and does not
      conflict.) Edit `package.json`: add `"pg"` to `dependencies`, `"@types/pg"` to
      `devDependencies`, and a script `"migrate": "node --env-file=.env.local scripts/migrate.cjs"`.
      Files: `package.json`
      Verify: `npm install` (or `npm install pg` then `npm install -D @types/pg`) succeeds, and
      `npm ls pg @types/pg` lists both with no peer warnings.

- [ ] 2. Create the one-off migration script `scripts/migrate.cjs`.
      A CommonJS Node script that: (a) reads `process.env.DATABASE_URL_UNPOOLED`; (b) connects
      with `new (require('pg').Client)({ connectionString })`; (c) runs `CREATE TABLE IF NOT EXISTS
      projects (...)` with the exact columns/types from Decision A; (d) logs
      `SELECT count(*) FROM projects`; (e) for each of the 6 projects runs
      `INSERT INTO projects (id,title,tagline,category,year,client,role,duration,thumbnail_gradient,
      thumbnail_icon,description,tools,metrics,case_study,featured) VALUES ($1..$15) ON CONFLICT (id)
      DO NOTHING` binding the 15 values — `JSON.stringify` for `tools`, `metrics`, `case_study`, and
      `!!featured` for the boolean; (f) logs the final count and `client.end()`. Embed the `projects`
      array by copying the `PROJECTS` array literal verbatim from `src/data/portfolioData.ts`
      (only the array value, not the `export`/type annotation) into a `const projects = [...]`.
      Wrap body in `main().catch(err => { console.error('migration failed:', err); process.exit(1); })`.
      Files: `scripts/migrate.cjs` (new)
      Verify: `npm run migrate` (i.e. `node --env-file=.env.local scripts/migrate.cjs`) prints
      `projects before seed: 0`, `projects after seed: 6`, `migration complete`. Re-run prints
      `before: 6`, `after: 6` (idempotent, no errors).

- [ ] 3. Create the data-access pool `src/lib/db.ts`.
      Export a singleton `pg` `Pool` using the **pooled** `process.env.DATABASE_URL`. Include a guard
      that throws a clear error if `DATABASE_URL` is unset. (The route handler is the only importer,
      so `pg` never reaches a client bundle.) Skeleton:
      ```ts
      import { Pool } from 'pg';
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error('DATABASE_URL is not set. Run `neon deploy` or add it to .env.local');
      }
      export const pool = new Pool({ connectionString });
      ```
      Files: `src/lib/db.ts` (new)
      Verify: `npx tsc --noEmit` (or just `npm run build` in step 6) compiles with no error in this
      file; no client component imports it.

- [ ] 4. Create the query module `src/lib/projects.ts`.
      Export `getProjects(): Promise<Project[]>` that runs a `SELECT` of the 15 columns from
      `projects` (ordered `featured DESC, year DESC, title ASC`) via `pool.query(...)`, then maps
      each snake_case row to the camelCase `Project` shape from `src/types/portfolio.ts`. Define a
      `ProjectRow` interface for the DB row, cast `rows as ProjectRow[]`, and cast `row.category`
      to `Project['category']` (string → union). `pg` auto-parses JSONB, so `row.tools`,
      `row.metrics`, `row.case_study` are already JS values — pass them through unchanged. Skeleton:
      ```ts
      import { pool } from './db';
      import type { Project } from '@/types/portfolio';

      interface ProjectRow {
        id: string; title: string; tagline: string; category: string; year: string;
        client: string; role: string; duration: string; thumbnail_gradient: string;
        thumbnail_icon: string; description: string;
        tools: string[]; metrics: { label: string; value: string }[];
        case_study: Project['caseStudy']; featured: boolean;
      }

      export async function getProjects(): Promise<Project[]> {
        const { rows } = await pool.query(
          `SELECT id, title, tagline, category, year, client, role, duration,
                  thumbnail_gradient, thumbnail_icon, description, tools, metrics, case_study, featured
           FROM projects
           ORDER BY featured DESC, year DESC, title ASC`
        );
        return (rows as ProjectRow[]).map((row) => ({
          id: row.id, title: row.title, tagline: row.tagline,
          category: row.category as Project['category'], year: row.year,
          client: row.client, role: row.role, duration: row.duration,
          thumbnailGradient: row.thumbnail_gradient, thumbnailIcon: row.thumbnail_icon,
          description: row.description, tools: row.tools, metrics: row.metrics,
          caseStudy: row.case_study, featured: row.featured,
        }));
      }
      ```
      Files: `src/lib/projects.ts` (new)
      Verify: `npm run build` (step 6) type-checks it cleanly.

- [ ] 5. Create the route handler `src/app/api/projects/route.ts`.
      A Node-runtime (default) `GET` handler. It MUST NOT export `runtime`, `dynamic`,
      `revalidate`, or `fetchCache` (see Decision C). Call `await connection()` first to force
      request-time rendering so the DB query runs per request and never at build, then call
      `getProjects()` and return `Response.json({ projects })`; on error return a 500 JSON.
      Skeleton:
      ```ts
      import { connection } from 'next/server';
      import { getProjects } from '@/lib/projects';

      export async function GET() {
        // Cache Components: stop prerendering here so the DB read runs only at request time.
        await connection();
        try {
          const projects = await getProjects();
          return Response.json({ projects });
        } catch (error) {
          console.error('GET /api/projects failed', error);
          return Response.json({ error: 'failed to load projects' }, { status: 500 });
        }
      }
      ```
      Files: `src/app/api/projects/route.ts` (new)
      Verify: `npm run build` (step 6) succeeds and lists `/api/projects` as a dynamic route; it
      does **not** attempt any DB connection during the build.

- [ ] 6. Build the app.
      Files: none (runs the build).
      Verify: `npm run build` completes with exit code 0. Expect it to show the home page (`/`)
      prerendered as static (unchanged) and `/api/projects` as a dynamic (ƒ) route. No DB errors
      in build output (the route uses `connection()`, so the query is not executed at build).

- [ ] 7. Start the production server in the BACKGROUND and prove the DB-backed route returns real
      Postgres rows; confirm the home page is intact; then stop the server.
      Files: none (runtime verification).
      Verify (run in `d:\MyPorto`; the server reads `.env.local` automatically):
      1. Start in the background (long-running): `npm run start` → it serves the build on
         `http://localhost:3000`. Wait for the "Ready" / "started server" line.
      2. Hit the DB-backed route:
         `curl.exe -s http://localhost:3000/api/projects`
         (or `Invoke-WebRequest -UseBasicParsing http://localhost:3000/api/projects | Select -ExpandProperty Content`).
         **Expect** HTTP 200 with JSON `{"projects":[ ... 6 objects ... ]}`. Confirm 6 rows and
         that titles match the seeded data, e.g. `"title":"FinFlow — Next-Gen Neobank & Wealth App"`,
         `"category":"UI/UX App"`. Since the route reads **only** from Postgres (it never imports
         `portfolioData.ts`), 6 real rows prove the database is wired end-to-end.
         (Optional stronger check: `node --env-file=.env.local -e "..."` to `UPDATE` one
         project's title in Postgres, hit the route again, and confirm the change appears — proves
         live DB, not a cached copy.)
      3. Confirm the home page still renders (unchanged UI): `curl.exe -s -o NUL -w "%{http_code}"
         http://localhost:3000/` → expect `200`; and `curl.exe -s http://localhost:3000/` contains
         the existing portfolio markup (e.g. `Sarah Althea` and `Portofolio`).
      4. Stop the background server (PowerShell):
         `$c = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue;
         if ($c) { Stop-Process -Id $c.OwningProcess -Force }`.

---

## Files summary

**Add (new):**
- `scripts/migrate.cjs` — one-off idempotent migration + seed (uses `DATABASE_URL_UNPOOLED`).
- `src/lib/db.ts` — `pg` `Pool` singleton (uses pooled `DATABASE_URL`).
- `src/lib/projects.ts` — `getProjects()` query + snake→camel mapping.
- `src/app/api/projects/route.ts` — Node-runtime `GET` handler, `connection()`-driven, returns JSON.

**Modify:**
- `package.json` — add `pg` (deps), `@types/pg` (devDeps), `migrate` script.

**Do NOT modify (preserve the portfolio UI):**
- `src/app/page.tsx`, `src/app/layout.tsx`, `src/components/*`, `src/data/portfolioData.ts`,
  `src/types/portfolio.ts`, `next.config.ts`, `eslint.config.mjs`, `neon.ts`, `.env.local`,
  `AGENTS.md` (never remove the nextjs-agent-rules block).

## Packages to install
- `pg` (runtime) — `npm install pg`
- `@types/pg` (dev) — `npm install -D @types/pg`

## Gotchas / troubleshooting
- If `npm run build` errors with "Route segment config 'dynamic'/'runtime'/... is not compatible
  with `nextConfig.cacheComponents`": you added a forbidden segment-config export to the route
  handler — remove it (per Decision C).
- If `GET /api/projects` returns 500 with `prepared statement ... already exists`: this is a
  PgBouncer-transaction-mode symptom. It should not occur against Neon's pooled endpoint (Neon
  supports prepared statements in transaction mode). If it does, temporarily switch the route's
  pool to `DATABASE_URL_UNPOOLED` only to confirm, then keep `DATABASE_URL` (pooled) per Neon best
  practice and ensure you are not running the migration script over the pooled URL.
- If a connection/SSL error appears: confirm the env var is loaded (the build/start load
  `.env.local`; the migrate script loads it via `--env-file`). Both Neon URLs already include
  `sslmode=...`, so `pg` enables SSL automatically.
- Migrations must use `DATABASE_URL_UNPOOLED`; app traffic must use `DATABASE_URL`. Never swap them.
