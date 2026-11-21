# Neon Lakebase Postgres wired into the Next.js 16 portfolio app

The app now reads live data from a Neon Postgres database at request time through a Node-runtime route handler, `GET /api/gallery`. A new `gallery_works` table mirrors the existing `GALLERY_WORKS` content (6 rows), populated by an idempotent migration script, and served by a `pg`-backed data-access module. The implementation deliberately leaves the existing portfolio UI and the pre-existing `@neondatabase/serverless` inquiries integration untouched, adding the new `pg` (node-postgres) integration alongside them. Connection traffic is split per Neon best practice: app queries go through the pooled `DATABASE_URL` (PgBouncer transaction mode), and the migration/seed run against the direct `DATABASE_URL_UNPOOLED`. The recorded evidence shows the build passing, the migration running idempotently, and the route returning real Postgres rows — including a throwaway probe row that appeared and then disappeared, proving the route reads the live database rather than a cached or static copy.

**Watch for:** Nothing blocking. The one thing to be aware of is that the plan in `plan.md` was written against a `PROJECTS`/`Project` data model that does not exist in this repo; the implementer correctly adapted to the real data (`GALLERY_WORKS`/`GalleryWork`) and documented the deviation. The seed in `migrate.cjs` is a static copy of that array, so it won't pick up future edits to `portfolioData.ts` unless re-synced — an accepted tradeoff the author called out, not a defect.

**Verdict**: APPROVED

## High-level view

The plan assumed a `PROJECTS` array and `Project` type, but the repo actually exports `TREASURE_STOPS`, `ROUTE_CHAPTERS`, `CREATIVE_TOOLS`, and `GALLERY_WORKS` (types in `src/types/index.ts`), and the home page inlines its own data rather than importing from `portfolioData.ts`. Rather than force the planned schema onto data that doesn't exist, the implementer mirrored `GALLERY_WORKS` — the most portfolio-like content — into a `gallery_works` table and exposed it through `GET /api/gallery`. This satisfies the task's core requirement (a genuine, testable runtime Postgres integration) without touching the static portfolio UI, exactly the fallback the plan itself endorsed.

Connection handling follows the Neon pooled/direct split. App query traffic flows through a `pg` `Pool` singleton bound to the pooled `DATABASE_URL` (the `-pooler` host); the migration connects with a `pg` `Client` against the direct `DATABASE_URL_UNPOOLED`. The two strings are never swapped, which is the failure mode that produces `prepared statement already exists` / `SQLSTATE 25006` under PgBouncer transaction mode.

Under `cacheComponents: true`, the route handler must not export `runtime`, `dynamic`, `revalidate`, or `fetchCache` — the `runtime` segment config is disallowed and Node is the forced default. The handler calls `await connection()` before the query, which the bundled route-handlers doc lists as a valid prerender-stopper, deferring the DB read to request time so the build never touches Postgres.

The migration is idempotent (`CREATE TABLE IF NOT EXISTS` plus `INSERT ... ON CONFLICT (id) DO NOTHING`, re-running without duplicating rows) and parameterized — inserts bind through `$1..$12` placeholders and the query module's `SELECT` takes no user input, so there's no SQL-injection surface. Connection strings come from `process.env` everywhere; no secrets are committed (`.env*` and `.neon` are gitignored). On failure the route returns a generic message to the client and logs the full error server-side, so DB or connection details don't leak to the caller, and a missing `DATABASE_URL` throws a clear error rather than failing silently.

<details>
<summary>Issues (0)</summary>

No blocking findings. The review surfaced no correctness, security, Next.js 16, or scoping issues. The deviations from `plan.md` (data model adaptation, static seed snapshot) are reasonable adaptations documented by the implementer, not defects.

</details>

<details>
<summary>Details</summary>

### Adapting the integration to the real data model

`plan.md` specified a `projects` table mirroring a `Project` interface in `src/types/portfolio.ts`, with steps that referenced `PROJECTS` and a `GET /api/projects` route. Neither `portfolio.ts` nor a `PROJECTS` export exists in this codebase. The real types live in `src/types/index.ts`, and the real portfolio data in `src/data/portfolioData.ts` is `TREASURE_STOPS`, `ROUTE_CHAPTERS`, `CREATIVE_TOOLS`, and `GALLERY_WORKS`. The home page (`src/app/page.tsx`) inlines its own content and imports nothing from `portfolioData.ts`.

The implementer chose `GALLERY_WORKS` as the table to mirror because it is the most portfolio-like export: six discrete works with a clean, flat-ish shape (scalar fields plus two `string[]` arrays). The `GalleryWork` interface maps to the `gallery_works` table column-for-column, with `tools` and `colors` stored as `JSONB` (`pg` auto-parses JSONB to JS arrays on read) and a `created_at` audit column that isn't selected. The route and table are named `gallery`/`gallery_works` to match the source concept rather than the plan's `projects`.

### Connection split: pooled for queries, direct for migrations

The two connection strings carry different responsibilities, and the code keeps them strictly separated:

```
App query traffic          Migration / seed
  GET /api/gallery           scripts/migrate.cjs
        │                          │
  pg Pool (singleton)        pg Client (per-run)
  DATABASE_URL               DATABASE_URL_UNPOOLED
  (-pooler host,             (direct host,
   PgBouncer txn mode)        no pooler)
```

`src/lib/postgres.ts` constructs a single `Pool` from the pooled `DATABASE_URL`. `pg` connects lazily, so importing the module during the build's module evaluation opens no connection. `scripts/migrate.cjs` opens a `Client` against `DATABASE_URL_UNPOOLED` and closes it on every path, so a mid-migration error can't leak a connection.

This split is the documented Neon best practice and the specific failure mode the plan warned about: running DDL over the pooled string can collide with PgBouncer's transaction-mode prepared-statement handling. The two `process.env` reads are distinct variables and are never interchanged. Both modules guard against an unset string with a clear, actionable error message and a non-zero exit (migration) or throw (pool) rather than proceeding with an empty string.

### Cache Components and request-time execution

`next.config.ts` has `cacheComponents: true` and `partialPrefetching: true`. The bundled docs make the `runtime` segment config illegal under `cacheComponents` — `runtime.md` and `cacheComponents.md` both say to remove any `runtime` export, including `runtime = 'nodejs'`, because Cache Components forces the Node runtime — and the route-handlers doc lists `connection()` among the prerender-stoppers (alongside `headers()`, `cookies()`, database queries, and non-deterministic operations).

The one non-obvious point is the `<Suspense>` boundary. The `connection()` doc says that under Cache Components, a component calling `connection()` should sit inside a `<Suspense>` boundary or navigation blocks instead of streaming. That guidance targets page navigations — the doc's examples are all `app/page.tsx`. Route handlers don't participate in client-side navigation, and the route-handlers doc's own Cache Components examples (`/api/random-number`, `/api/user-agent`) call dynamic APIs directly in the handler with no Suspense boundary. None is needed here. The build output confirms the effect: `/` stays static (○), `/api/gallery` is dynamic (ƒ), and no DB query ran during the build.

### Seed fidelity and the static-snapshot tradeoff

The seed array in `migrate.cjs` is a verbatim copy of the `GALLERY_WORKS` literal from `portfolioData.ts`, and the runtime response matches it field-for-field (e.g. `w-01` title `PORTO FOLIO 2026 — Royal Sunburst Master`, category `poster`), so the round-trip through Postgres preserves the data.

The accepted tradeoff, documented by the implementer: the seed is a static snapshot. `portfolioData.ts` remains the source of truth for the UI, and the DB seed won't track future edits to that file unless `migrate.cjs` is updated too. It would become a real concern only if the goal were to keep the UI and the DB in continuous sync.

### Scoping: additive only, no UI or pre-existing-integration regressions

The change is purely additive: four new files (`scripts/migrate.cjs`, `src/lib/postgres.ts`, `src/lib/gallery.ts`, `src/app/api/gallery/route.ts`) and a minimal `package.json` edit adding `pg` to dependencies, `@types/pg` to devDependencies, and a `migrate` script. A search for the new module paths confirms nothing outside the new files imports them — no page or component was rewired to the DB, so the portfolio UI is untouched. The evidence backs this: the home page returns HTTP 200 with its expected markers (`HAN STUDIO`, `PORTO FOLIO`) and 119874 bytes, and the pre-existing `@neondatabase/serverless` inquiries route still returns `{"connected":true,"count":"2"}`. `next.config.ts`, `eslint.config.mjs`, `neon.ts`, `.env.local`, and the `AGENTS.md` nextjs-agent-rules block are unchanged.

</details>

<details>
<summary>File map</summary>

**Added:**
- `scripts/migrate.cjs` — idempotent `CREATE TABLE IF NOT EXISTS gallery_works` + seed of 6 rows via `INSERT ... ON CONFLICT DO NOTHING`; connects with `pg` `Client` to `DATABASE_URL_UNPOOLED`.
- `src/lib/postgres.ts` — `pg` `Pool` singleton bound to the pooled `DATABASE_URL`; throws a clear error if unset.
- `src/lib/gallery.ts` — `getGalleryWorks()` runs `SELECT ... FROM gallery_works ORDER BY id ASC` and maps snake_case rows to the `GalleryWork` camelCase shape.
- `src/app/api/gallery/route.ts` — Node-runtime `GET` handler; calls `await connection()` then `getGalleryWorks()`, returns `Response.json({ works })`, 500 JSON on error. No `runtime`/`dynamic`/`revalidate`/`fetchCache` exports.

**Modified:**
- `package.json` — added `pg` (runtime dep), `@types/pg` (dev dep), and `"migrate": "node --env-file=.env.local scripts/migrate.cjs"`.

**Unchanged (verified):** `src/app/page.tsx`, `src/app/layout.tsx`, `src/components/*`, `src/data/portfolioData.ts`, `src/types/index.ts`, `next.config.ts`, `eslint.config.mjs`, `neon.ts`, `.env.local`, `.gitignore`, `AGENTS.md`, and the pre-existing `src/lib/db.ts` + `src/app/api/inquiries/route.ts`.

Full evidence (build output, migration output, runtime request/response, home-page check, inquiries check): `d:\MyPorto\.agents\tasks\verify-note.md`.

</details>
