# Verification Note — Wire Neon Lakebase Postgres into the Next.js 16 portfolio app

Workspace: `d:\MyPorto` · Next.js 16.4.6 (Turbopack, `cacheComponents: true`, `partialPrefetching: true`) · Node v24.16.0 · `pg@8.23.1` / `@types/pg@8.23.1`.

---

## What changed (and a necessary deviation from the plan)

The plan in `.agents/tasks/plan.md` was written against a **different codebase model** — it assumed a `PROJECTS` array and a `Project` type in `src/types/portfolio.ts`. **That data does not exist in this repo.** The real exported data in `src/data/portfolioData.ts` is `TREASURE_STOPS`, `ROUTE_CHAPTERS`, `CREATIVE_TOOLS`, and `GALLERY_WORKS` (types in `src/types/index.ts`). The home page (`src/app/page.tsx`) has all of its data **inlined** and imports nothing from `portfolioData.ts`.

There is also a **pre-existing** Neon integration already in the repo: `src/lib/db.ts` uses the `@neondatabase/serverless` HTTP driver and `src/app/api/inquiries/route.ts` writes/counts an `inquiries` table. I left it untouched (behavior-preserving) and added the required **`pg` (node-postgres)** integration alongside it, mirroring the real `GALLERY_WORKS` content (6 items — the gallery of works, the most portfolio-like content) into a new `gallery_works` table, exposed through a Node-runtime `GET /api/gallery` route handler.

**Added (new):**
- `scripts/migrate.cjs` — idempotent one-off migration + seed. Uses `DATABASE_URL_UNPOOLED` (direct). `CREATE TABLE IF NOT EXISTS gallery_works`; seeds the 6 `GALLERY_WORKS` rows verbatim with `INSERT ... ON CONFLICT (id) DO NOTHING`.
- `src/lib/postgres.ts` — `pg` `Pool` singleton bound to the pooled `DATABASE_URL` (PgBouncer transaction mode) for app query traffic.
- `src/lib/gallery.ts` — `getGalleryWorks()`: `SELECT ... FROM gallery_works ORDER BY id ASC`, snake_case→camelCase mapping to `GalleryWork`.
- `src/app/api/gallery/route.ts` — Node-runtime `GET` handler. Calls `await connection()` first (Cache Components: prerendering stops here → the query runs only at request time, never at build). Returns `Response.json({ works })`. Exports **no** `runtime` / `dynamic` / `revalidate` / `fetchCache` (the `runtime` segment config is disallowed under `cacheComponents`; the others were removed in v16).

**Modified:**
- `package.json` — added `pg` (runtime dep), `@types/pg` (dev dep), and `"migrate": "node --env-file=.env.local scripts/migrate.cjs"`.

**Not modified (behavior preserved):** `src/app/page.tsx`, `src/app/layout.tsx`, `src/components/*`, `src/data/portfolioData.ts`, `src/types/*`, `next.config.ts`, `eslint.config.mjs`, `neon.ts`, `.env.local`, `AGENTS.md` (nextjs-agent-rules block intact), and the pre-existing `src/lib/db.ts` + `src/app/api/inquiries/route.ts`.

## Neon best practices followed
- App query traffic (route handler) → pooled `DATABASE_URL` (`-pooler` host, PgBouncer transaction mode) via `pg` `Pool`.
- Schema migration / seed → direct `DATABASE_URL_UNPOOLED` (no `-pooler`) via `pg` `Client`. Migrations never run over the pooled URL.
- Migration idempotent (`CREATE TABLE IF NOT EXISTS` + `INSERT ... ON CONFLICT (id) DO NOTHING`) — re-running does not duplicate data.
- Connection strings read from `process.env` at runtime; never hardcoded. `next start` loads `.env.local`; the migrate script loads it via `node --env-file=.env.local`.
- `.gitignore` ignores `.env*` and `.neon` → secrets are never committed. (Repo is not a git repo in any case.)

---

## (1) Build — `npm run build` MUST pass ✅

```
> next build
▲ Next.js 16.4.6 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 83ms
- Cache Components enabled
- Partial Prefetching enabled
  Creating an optimized production build ...
✓ Compiled successfully in 4.6s
  Running TypeScript ...
  Finished TypeScript in 2.7s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (6/6) in 1269ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/gallery
└ ƒ /api/inquiries

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```
Exit code: **0** (success). `Environments: .env.local` confirms Next loaded the env at build (so the `DATABASE_URL` guard didn't throw). Home page `/` is Static (unchanged); `/api/gallery` is Dynamic. **No DB errors at build** — `connection()` defers the query to request time, so the build never touched Postgres.

## (2) Migration — `npm run migrate` (idempotent) ✅

First run:
```
gallery_works before seed: 0
gallery_works after seed: 6
migration complete
```
Second run (idempotency — no duplication, no errors):
```
gallery_works before seed: 6
gallery_works after seed: 6
migration complete
```
Note: `pg` prints one benign SSL-mode warning (`sslmode=require` is treated as `verify-full`; in a future pg major this becomes standard libpq semantics). It is informational only and did not stop the migration.

## (3) CORE PROOF — DB-backed route returns real Postgres rows at runtime ✅

Server started in the background: `next start` → `✓ Ready in 267ms`, listening on `http://localhost:3000`.

Exact request command:
```
curl.exe -s -w "\nHTTP_STATUS:%{http_code}" http://localhost:3000/api/gallery
```
Response: **HTTP 200**. Clean UTF-8 JSON (6 rows), pretty-printed here for readability:
```json
{
  "works": [
    { "id": "w-01", "title": "PORTO FOLIO 2026 — Royal Sunburst Master", "category": "poster", "categoryLabel": "Event Poster", "committee": "INNOFAIR 2026", "spanClass": "md:col-span-7", "aspectClass": "aspect-[16/10]", "dim": "1920 × 1080 px", "tools": ["Figma","Illustrator","Photoshop"], "colors": ["#0038A8","#021238","#C6A355","#6B0F1A","#FFFFFF"], "desc": "Key visual utama dengan latar sinar radial biru royal, bingkai Art-Deco emas ganda, lencana pil marun + 2026 +, dan tipografi 3D bertumpuk.", "art": "cover-banner" },
    { "id": "w-02", "title": "INNOFAIR Exhibition — Editorial Feed 4:5", "category": "feed", "categoryLabel": "Social Media Feed", "committee": "INNOFAIR 2026", "spanClass": "md:col-span-5", "aspectClass": "aspect-[4/4]", "dim": "1080 × 1350 px", "tools": ["Figma","Lightroom"], "colors": ["#0038A8","#FFFFFF","#C6A355"], "desc": "Sistem microblog dan pengumuman pembicara dengan tata letak bersih, hirarki tipografi tegas, dan aksen garis emas.", "art": "feed-recap" },
    { "id": "w-03", "title": "National Tech Hackathon — Call For Participants", "category": "poster", "categoryLabel": "Event Poster", "committee": "HMPSTI", "spanClass": "md:col-span-4", "aspectClass": "aspect-[3/4]", "dim": "1080 × 1920 px", "tools": ["Illustrator","Photoshop"], "colors": ["#6B0F1A","#E2C275","#021542"], "desc": "Poster vertikal pendaftaran kompetisi berskala nasional dengan kombinasi marun royal dan bingkai klasik modern.", "art": "poster-vertical" },
    { "id": "w-04", "title": "Auditorium Keynote & Stage Spotlight", "category": "photography", "categoryLabel": "Event Photography", "committee": "Creative Workshop", "spanClass": "md:col-span-8", "aspectClass": "aspect-[16/10]", "dim": "6000 × 4000 px • 35mm f/2.0", "tools": ["Adobe Lightroom"], "colors": ["#021542","#C6A355","#F8FAFC"], "desc": "Dokumentasi panggung utama seminar nasional menangkap sorotan lampu panggung dan ekspresi pembicara.", "art": "photo-stage" },
    { "id": "w-05", "title": "All-Access Lanyard, ID Card & Brand Kit", "category": "uiux", "categoryLabel": "UI/UX & Brand", "committee": "INNOFAIR 2026", "spanClass": "md:col-span-6", "aspectClass": "aspect-[16/10]", "dim": "900 × 45 mm • CMYK & UI Kit", "tools": ["Figma","Illustrator"], "colors": ["#6B0F1A","#C6A355","#0038A8"], "desc": "Sistem identitas fisik kepanitiaan mencakup tali lanyard marun-emas, kartu akses divisi, dan panduan komponen visual.", "art": "lanyard-print" },
    { "id": "w-06", "title": "Golden Hour Campus Closing Series", "category": "photography", "categoryLabel": "Event Photography", "committee": "PKKMB Fakultas", "spanClass": "md:col-span-6", "aspectClass": "aspect-[16/10]", "dim": "6000 × 4000 px • 50mm f/1.8", "tools": ["Adobe Lightroom"], "colors": ["#7C2D12","#E2C275","#FEF3C7"], "desc": "Rangkaian foto dokumenter penutupan acara luar ruang dengan profil warna hangat sinematik.", "art": "photo-sunset" }
  ]
}
```
6 rows, matching the seeded `GALLERY_WORKS` content (e.g. `w-01` title `PORTO FOLIO 2026 — Royal Sunburst Master`, category `poster`). The route imports only `getGalleryWorks` → `pg` `pool` → `SELECT FROM gallery_works`; there is **no** static/fallback import in that code path.

### Stronger proof — the route reads LIVE Postgres, not a cached/static copy
Inserted a throwaway row directly into Postgres (`DATABASE_URL_UNPOOLED`):
```
probe inserted: w-probe-live
gallery_works count now: 7
```
The route immediately served it:
```
MATCH FOUND: route served the live probe row
work objects returned: 7
```
Deleted the probe:
```
probe deleted: w-probe-live
gallery_works count now: 6
probe gone from route response (good)
work objects returned: 6
```
A row that existed only momentarily in Postgres appeared in the route response and then disappeared — the route reads the live database on every request. The 6 real `GALLERY_WORKS` rows were never modified.

## (4) Home page still loads (UI intact) ✅
```
GET / HTTP status: 200
home.html actual bytes: 119874
marker found: HAN STUDIO
marker found: PORTO FOLIO
marker found: Portofolio
marker found: PORTO
marker found: FOLIO
marker found: Han
```
Starts with `<!DOCTYPE html><html lang="id">…`. Existing portfolio UI renders unchanged.

## Existing integration intact (not broken by these changes) ✅
```
GET http://localhost:3000/api/inquiries -> {"connected":true,"count":"2"}
```
The pre-existing `@neondatabase/serverless` inquiries route still connects and returns a count.

## (5) Server stopped ✅
Background server stopped; port 3000 is FREE; no `next start` / `next dev` processes left running.

---

## Anything that failed / operational notes
- A **stale `next dev` server from a prior session** was holding port 3000 (PIDs 35592 `npm run dev` → 27520 `next dev` → 28632 `start-server.js` + several turbopack workers). Stopped its process tree to free the port before starting the production server. The unrelated `9router` tray app (PIDs 26696/21904) was left alone.
- `next start` spawns a child `start-server.js` that actually binds the port; killing the parent CLI PID via `taskkill /T` did not cascade to that child in one case, so the child was stopped directly by its own PID. Final clean state confirmed.
- `pg` SSL-mode warning (see §2) — informational only.
- This project has **no test runner** (`package.json` has no `test` script), so verification was done via `npm run build` + the runtime HTTP checks above, per the task instructions.
